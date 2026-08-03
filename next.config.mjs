/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
   * There is deliberately no `eslint` key here.
   *
   * It used to carry `ignoreDuringBuilds: true` to get past 99 pre-existing
   * @typescript-eslint/no-explicit-any errors. Next 16 removed the option —
   * the build warns "Unrecognized key(s) in object: 'eslint'" — because
   * `next build` no longer runs ESLint at all. Lint is now a separate step
   * (`npm run lint` -> `eslint .`), so the build being green says nothing
   * about lint being clean. It is not: 111 errors, 99 of them that same
   * pre-existing `any` set plus 12 from React 19's stricter hooks rules.
   *
   * Those `any`s are load-bearing — they hide reads of fields that do not
   * exist (award.url, customItem.url/startDate/endDate,
   * certification.description, course/publication.description). The
   * expressions are undefined at runtime and render nothing today; deleting
   * them, or adding the fields to the types and the editor, is the real fix.
   */

  // Both of these graduated out of `experimental` in Next 15, and
  // serverComponentsExternalPackages was renamed to serverExternalPackages.
  // The upgrade codemod does not touch next.config, so this is a manual step.

  // public/ is CDN-served and absent from the function bundle by default. The
  // PDF route reads the font files off disk to inline them as base64, so they
  // must be traced into its bundle explicitly.
  outputFileTracingIncludes: {
    '/api/export/pdf': ['./assets/fonts/**'],
  },

  // puppeteer-core and @sparticuz/chromium-min must stay external: the Chromium
  // binary and its native bindings cannot be webpack-bundled.
  serverExternalPackages: [
    'pdf-parse',
    'mammoth',
    '@react-pdf/renderer',
    'puppeteer-core',
    '@sparticuz/chromium-min',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // serverExternalPackages only covers the app dir. The PDF export lives in
      // pages/api, so externalise Chromium here too — the binary and its native
      // bindings must not be webpack-bundled.
      config.externals = [...(config.externals || []), 'puppeteer-core', '@sparticuz/chromium-min'];
    }
    if (!isServer) {
      // canvas is a native Node.js module used by @react-pdf/renderer internally;
      // it doesn't exist in the browser bundle so tell webpack to ignore it.
      config.resolve.fallback = { ...config.resolve.fallback, canvas: false };
    }
    return config;
  },
};

export default nextConfig;
