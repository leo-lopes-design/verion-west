/**
 * The veil over a photographic band, reproduced from Figma rather than eyeballed.
 *
 * SVG, not CSS: Figma's radial fills here carry rotation and shear in their
 * transform, and `radial-gradient()` cannot express a rotated ellipse at all.
 * `gradientTransform` on a gradient in objectBoundingBox units is the
 * same construct Figma stores, so the matrices below are not interpretations —
 * they are Figma's own matrices, inverted once (Figma maps object → gradient,
 * SVG maps gradient → object) and otherwise untouched. Sanity check on the
 * inversion: running the hero's linear fill through it returns a centre of
 * (0.5, 0.5), which is what a linear fill must return.
 *
 * The stop colour is a token — `stop-color` is a real CSS property inside SVG,
 * so the veil themes with the page.
 */
export type BandVariant = 'quote' | 'close';

/** Figma's matrix, inverted. SVG order is matrix(a b c d e f). */
const GRADIENTS: Record<BandVariant, { radial: string; linear: string; radialOpacityVar: string }> =
  {
    quote: {
      // centre lands at object (0, 1) — the bottom-left corner
      radial: 'matrix(1.48056 -1.40994 1.32071 9.22884 -1.40063 -2.90945)',
      linear: 'matrix(0 -1 0.59949 0 0.20026 1)',
      radialOpacityVar: 'var(--band-quote-radial)',
    },
    close: {
      // centre lands dead centre, on a strongly scaled and rotated ellipse
      radial: 'matrix(-1 1 -1 -6.29363 1.5 3.14681)',
      linear: 'matrix(-1 0 0 -2.22179 1 1.61089)',
      radialOpacityVar: 'var(--band-close-radial)',
    },
  };

export function BandScrim({ variant }: { variant: BandVariant }) {
  const g = GRADIENTS[variant];
  const r = `scrim-${variant}-radial`;
  const l = `scrim-${variant}-linear`;

  return (
    <svg
      className="media__scrim"
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={r} gradientUnits="objectBoundingBox" gradientTransform={g.radial}>
          <stop offset="0" className="scrim-stop scrim-stop--clear" />
          <stop offset="1" className="scrim-stop scrim-stop--solid" />
        </radialGradient>
        <linearGradient id={l} gradientUnits="objectBoundingBox" gradientTransform={g.linear}>
          <stop offset="0" className="scrim-stop scrim-stop--solid" />
          <stop offset="1" className="scrim-stop scrim-stop--clear" />
        </linearGradient>
      </defs>

      <rect width="1" height="1" fill={`url(#${r})`} style={{ opacity: g.radialOpacityVar }} />
      <rect width="1" height="1" fill={`url(#${l})`} />
    </svg>
  );
}
