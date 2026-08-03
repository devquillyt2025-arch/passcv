'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import { SHEET_H } from '@/components/resume-templates/shared';

const SPACER_ATTR = 'data-pagination-spacer';

/**
 * Mirrors, on screen, the page fragmentation Chromium performs when printing.
 *
 * The printed document gets real pagination from `@page` plus the
 * `break-inside: avoid` / `break-after: avoid` rules in sheetStyles.ts. The
 * on-screen sheet is one continuous column, so without this a block that
 * straddles a page boundary is merely crossed by a guide line while the PDF
 * moves it wholesale to the next page.
 *
 * Two things this gets right that a naive version does not:
 *
 *  - It pushes with an inserted spacer element rather than by growing
 *    `margin-top`. Adjacent sibling margins collapse, so a margin of +33px
 *    against a sibling's 20px bottom margin shifts the block by 13px, not 33 —
 *    the block lands mid-boundary and still straddles.
 *
 *  - When moving an entry would strand its section heading alone at the foot of
 *    the previous page, it moves the heading instead and lets the entry follow.
 *    That is what `break-after: avoid` does on the print side; checking for an
 *    orphaned heading only *before* moving anything misses it, because the
 *    heading is only orphaned as a consequence of the move.
 *
 * A note on flex/grid columns: an earlier version skipped blocks nested inside
 * them, on the theory that Chromium never fragments such a container so the
 * blocks could not move independently. That was wrong — it was compensating for
 * a missing `html { line-height: 1.5 }` in the print stylesheet, which made the
 * printed sheet shorter than the preview and shifted every page boundary. With
 * that fixed the skip caused mismatches instead of preventing them, so it is
 * gone. Chromium does fragment the *content* of a flex column; what it will not
 * split is the container's own box (its background stops at the page break).
 *
 * scripts/pagination-check.mjs asserts this agrees with the PDF's actual page
 * assignment, so the two implementations are held together by a test rather
 * than by intent.
 */
export function usePaginatedSheet<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T | null>(null);

  const paginate = useCallback(() => {
    const root = ref.current?.querySelector<HTMLElement>('[data-resume-sheet]');
    if (!root) return;

    // Always recompute from the natural flow, never from an already-pushed layout.
    root.querySelectorAll(`[${SPACER_ATTR}]`).forEach((el) => el.remove());

    const topOf = (el: Element) => el.getBoundingClientRect().top - root.getBoundingClientRect().top;
    const pageOf = (y: number) => Math.floor(y / SHEET_H);

    const blocks = [...root.querySelectorAll<HTMLElement>('[data-section] > *')];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const height = block.getBoundingClientRect().height;
      if (height <= 0) continue;

      // Taller than a page: Chromium ignores `break-inside: avoid` here and
      // breaks the block, so there is nothing to mirror.
      if (height > SHEET_H) continue;

      const top = topOf(block);
      const startPage = pageOf(top);
      if (startPage === pageOf(top + height - 0.5)) continue;

      // Moving the first entry of a section would leave its heading behind;
      // move the heading and let the entry follow it.
      const prev = block.previousElementSibling as HTMLElement | null;
      const target =
        prev && prev === block.parentElement?.firstElementChild && pageOf(topOf(prev)) === startPage
          ? prev
          : block;

      pushToNextPage(target);

      // If the heading was moved but the block still straddles (heading plus
      // entry exceed one page), move the block too — which is what Chromium
      // does once it can no longer honour `break-after: avoid`.
      if (target !== block) {
        const newTop = topOf(block);
        if (pageOf(newTop) !== pageOf(newTop + height - 0.5)) pushToNextPage(block);
      }
    }

    /** Insert a non-collapsing spacer that lands `el` on the next page boundary. */
    function pushToNextPage(el: HTMLElement) {
      const y = topOf(el);
      const spacer = document.createElement('div');
      spacer.setAttribute(SPACER_ATTR, '');
      spacer.style.cssText = `height:${(pageOf(y) + 1) * SHEET_H - y}px;margin:0;padding:0`;
      el.parentElement?.insertBefore(spacer, el);
    }
  }, []);

  useLayoutEffect(() => {
    paginate();
    // Fonts land after first layout and change every measurement.
    document.fonts?.ready.then(paginate).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginate, ...deps]);

  return ref;
}
