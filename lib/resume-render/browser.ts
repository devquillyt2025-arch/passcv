import type { Browser } from 'puppeteer-core';
import { SHEET_W, SHEET_H } from '@/components/resume-templates/shared';

/**
 * Pin the viewport to the sheet so screen-media and print-media layout are
 * measured in the same coordinate space (deviceScaleFactor 1 = 96 CSS dpi).
 */
const SHEET_VIEWPORT = { width: SHEET_W, height: SHEET_H, deviceScaleFactor: 1 };

/**
 * Chromium acquisition.
 *
 * Production (Vercel serverless, Linux/Lambda): `@sparticuz/chromium-min`. The
 * package carries no binary; it downloads a chromium pack at cold start from a
 * URL we host and inflates it into /tmp.
 *
 * We started on the full `@sparticuz/chromium`, which bundles the binary and is
 * self-contained — the better property. It does not fit: the deployed function
 * came to 390 MB against Vercel's 250 MB limit. The large-functions beta would
 * raise the ceiling, but nobody ships a 390 MB function deliberately, so a
 * cold-start measured on that path would not describe anything we would run.
 *
 * Three things this must get right, all of them known failure modes:
 *   1. The pack is hosted by us (Vercel Blob), not fetched from a third party's
 *      release link — that is someone else's bandwidth and their breakage.
 *   2. The pack version must match the installed package version exactly. A
 *      mismatch fails at launch, so assertPackMatchesPackage() checks it up
 *      front and says which two versions disagree.
 *   3. The download is cached behind a single shared promise per instance.
 *      Concurrent requests landing on the same cold container would otherwise
 *      each start their own 66 MB download.
 *
 * Local dev (Windows/macOS): the pack is Linux-only, so fall back to a locally
 * installed Chrome. Override with PUPPETEER_EXECUTABLE_PATH.
 */

/**
 * Where the chromium pack lives. Must be set in every serverless environment;
 * there is deliberately no default, because a default would either point at
 * someone else's release or silently drift from the installed package.
 */
const PACK_URL = process.env.CHROMIUM_PACK_URL;

const LOCAL_CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean) as string[];

function isServerless(): boolean {
  return Boolean(process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL);
}

async function resolveLocalChrome(): Promise<string> {
  const { existsSync } = await import('fs');
  const found = LOCAL_CHROME_CANDIDATES.find((p) => existsSync(p));
  if (!found) {
    throw new Error(
      'No local Chrome found for PDF export. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH.',
    );
  }
  return found;
}

export interface LaunchTimings {
  /** Resolving the executable. On Lambda this is the brotli inflate into /tmp —
   *  the suspected dominant cold-start cost, so it is timed separately from the
   *  process launch rather than reported as one combined number. */
  executableMs: number;
  /** puppeteer.launch() itself: spawning Chromium and attaching over CDP. */
  launchMs: number;
  /** False only on the first launch in this warm instance. */
  reusedInstance: boolean;
}

/** Flips after the first launch, so logs distinguish cold from warm invocations. */
let hasLaunchedBefore = false;

/**
 * One in-flight download per container, shared by every concurrent request.
 * Without this, N requests arriving together on a cold instance each pull their
 * own copy of a 66 MB pack.
 */
let executablePathPromise: Promise<string> | null = null;

/**
 * Must equal the @sparticuz/chromium-min version pinned in package.json — which
 * is pinned exactly (no caret) precisely so these two cannot drift apart on an
 * incidental install.
 *
 * Read as a constant rather than from the package's own package.json: that
 * module's `exports` field does not expose ./package.json, so requiring it fails
 * the webpack build outright.
 *
 * When bumping the package: change this, re-upload the matching pack, and
 * update CHROMIUM_PACK_URL. All three move together or the launch fails.
 */
const CHROMIUM_VERSION = '149.0.0';

/**
 * Fail loudly and specifically when the hosted pack and the pinned package
 * disagree. The launch error you get otherwise points at Chromium, not at the
 * version skew that actually caused it.
 */
function assertPackMatchesPackage(url: string): void {
  if (!url.includes(`v${CHROMIUM_VERSION}`)) {
    throw new Error(
      `CHROMIUM_PACK_URL does not match the pinned @sparticuz/chromium-min ` +
        `(${CHROMIUM_VERSION}). The pack filename must contain "v${CHROMIUM_VERSION}". ` +
        `URL: ${url}`,
    );
  }
}

type MinChromium = { executablePath: (url?: string) => Promise<string> };

function resolveServerlessChromium(chromium: MinChromium): Promise<string> {
  if (!PACK_URL) {
    throw new Error(
      'CHROMIUM_PACK_URL is not set. @sparticuz/chromium-min ships no binary; ' +
        'point this at the self-hosted chromium pack matching the installed package version.',
    );
  }
  assertPackMatchesPackage(PACK_URL);

  if (!executablePathPromise) {
    executablePathPromise = chromium.executablePath(PACK_URL).catch((err) => {
      // Do not cache a failure — the next request should be able to retry.
      executablePathPromise = null;
      throw err;
    });
  }
  return executablePathPromise;
}

export async function launchBrowser(): Promise<{ browser: Browser; timings: LaunchTimings }> {
  const puppeteer = await import('puppeteer-core');
  const reusedInstance = hasLaunchedBefore;
  hasLaunchedBefore = true;

  const t0 = Date.now();
  let executablePath: string;
  let args: string[];

  if (isServerless()) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    // Printing needs no WebGL. Disabling the graphics stack skips extracting
    // swiftshader on cold start — less /tmp pressure, faster launch.
    chromium.setGraphicsMode = false;
    executablePath = await resolveServerlessChromium(chromium);
    args = chromium.args;
  } else {
    executablePath = await resolveLocalChrome();
    args = ['--no-sandbox', '--disable-dev-shm-usage'];
  }

  const t1 = Date.now();
  const browser = (await puppeteer.launch({
    args,
    executablePath,
    defaultViewport: SHEET_VIEWPORT,
    headless: true,
  })) as unknown as Browser;

  return {
    browser,
    timings: { executableMs: t1 - t0, launchMs: Date.now() - t1, reusedInstance },
  };
}
