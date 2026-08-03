import ResumeDoc from '@/components/resume-templates';
import ResumePreview from '@/components/builder/ResumePreview';
import type { TemplateId } from '@/lib/types';
import { selectRenderInput } from '@/lib/resume-render/selectRenderInput';
import { PREVIEW_RESUME } from '@/lib/previewFixture';

/**
 * Dev-only harness for eyeballing a single HTML template at true A4 size.
 * /tplpreview?t=classic&accent=%230D9488[&paginate=1]
 *
 * Two modes, and the distinction matters to the harnesses:
 *   default        — bare ResumeDoc, continuous flow. scripts/parity-check.mjs
 *                    compares this against the print document's geometry.
 *   ?paginate=1    — the builder's real preview path, page reflow included.
 *                    scripts/pagination-check.mjs compares this against the
 *                    PDF's actual page assignment.
 */
export default async function TemplatePreviewPage(
  props: {
    searchParams: Promise<{ t?: string; accent?: string; paginate?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const templateId = (searchParams.t || 'classic') as TemplateId;
  const accentColor = searchParams.accent || '#0D9488';
  const paginate = Boolean(searchParams.paginate);

  const input = selectRenderInput({
    data: PREVIEW_RESUME,
    templateId,
    sectionOrder: undefined,
    hiddenSections: [],
    builderDesign: { accentColor, fontPair: 'modern', spacing: 'balanced' },
  });

  return (
    <div id="tplshot" style={{ background: '#fff', width: 794 }}>
      {/* The app's global .dark rules repaint .bg-white; the harness always shoots on paper. */}
      <style>{`
        html, body { background: #fff !important; }
        #tplshot, #tplshot .bg-white { background-color: #fff !important; }
        #tplshot { color: #111 !important; box-shadow: none !important; }
        #tplshot .shadow-2xl { box-shadow: none !important; }
      `}</style>
      {/* Built through selectRenderInput() so this harness renders exactly the
          cascade the builder and the PDF export do. The branch is a plain
          ternary on purpose: returning the client component from an IIFE hides
          it from the RSC client manifest and the page 500s. */}
      {paginate ? <ResumePreview input={input} paginate /> : <ResumeDoc input={input} />}
    </div>
  );
}
