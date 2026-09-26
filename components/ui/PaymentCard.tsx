export type CardState = 'active' | 'masked' | 'frozen';

/**
 * The product's card.
 *
 * Its surface is `surface/fixed-dark` — the same token as the marketing footer,
 * and for the same reason. A card is a physical object, not a themed surface;
 * it no more inverts in dark mode than a real card changes colour when you turn
 * the lights off. That decision propagates: the FROZEN badge uses
 * `surface/brand` and `text/on-brand`, both mode-invariant, because a
 * `feedback/*` pair would theme and drift away from the surface carrying it.
 *
 * The 12px radius is not a semantic choice. At 328px wide it is what the 3.2mm
 * corner of an ISO/IEC 7810 ID-1 card resolves to, so it comes from the
 * reference tier rather than from `radius/container`.
 *
 * The artwork follows the Figma card (node 49:66): a sheen across the surface,
 * a gold contact chip, a metallic contactless glyph and an embossed chevron.
 */
export function PaymentCard({
  holder,
  state = 'active',
  last4 = '0925',
  expires = '09/30',
}: {
  /** Printed as given — cards carry the name in capitals. */
  holder: string;
  state?: CardState;
  last4?: string;
  expires?: string;
}) {
  const masked = state !== 'active';
  /* Two spaces between groups, not one. The gap is doing the work a hyphen does
     on a printed card, and at this size one space reads as a single 16-digit
     run. It is in the Figma as literal double spaces, so it lives here rather
     than as a letter-spacing trick that would also push the last group off. */
  const number = masked ? `••••  ••••  ••••  ${last4}` : `4821  7390  1164  ${last4}`;

  return (
    <div className="paycard" data-state={state}>
      <div className="paycard__inner">
        <div className="paycard__top">
          <span className="paycard__marks">
            <span className="paycard__chip" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <Contactless />
          </span>
          <Chevron />
        </div>

        <div className="paycard__bottom">
          <p className="paycard__number">{number}</p>
          <div className="paycard__meta">
            <span className="paycard__cell">
              <span className="paycard__label">Cardholder</span>
              <span className="paycard__value">{holder}</span>
            </span>
            <span className="paycard__cell paycard__cell--end">
              <span className="paycard__label">Expires</span>
              <span className="paycard__value">{expires}</span>
            </span>
          </div>
        </div>
      </div>

      {state === 'frozen' ? <span className="paycard__status">Frozen</span> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- artwork */
/* Card artwork, deliberately not part of the icon set — the set is for UI, and
   these two carry their own gradients. An Icon takes `currentColor`; a chrome
   arc and an embossed chevron cannot, because what makes them read as metal is
   that the light runs across them independently of the text around them.
 *
 * Both keep the Figma's two boxes: an outer box at the size the layout reserves,
 * and a leaf that overflows it by exactly the stroke or blur bleed. Collapsing
 * them into one box is the tempting simplification and it moves the glyph. */

/** Outer 13.252 x 20; the 2px stroke bleeds 7.55% / 5% past it. */
function Contactless() {
  return (
    <span className="paycard__wave" aria-hidden="true">
      <svg viewBox="0 0 15.2523 22.0001" fill="none" focusable="false">
        <path
          d="M1.00001 5.00007C2.47587 6.65014 3.29181 8.78627 3.29181 11.0001C3.29181 13.2139 2.47587 15.35 1.00001 17.0001M6.00001 3.00007C7.78403 5.28517 8.75306 8.10103 8.75306 11.0001C8.75306 13.8991 7.78403 16.715 6.00001 19.0001M11 1.00007C13.1137 3.90592 14.2523 7.40679 14.2523 11.0001C14.2523 14.5933 13.1137 18.0942 11 21.0001"
          stroke="url(#paycard-wave-chrome)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id="paycard-wave-chrome"
            x1="1.00001"
            y1="3.20002"
            x2="14"
            y2="24.2"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#484848" />
            <stop offset="0.445346" stopColor="#BDBDBD" />
            <stop offset="1" stopColor="#4A4A4A" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

/**
 * The brand chevron, embossed rather than printed.
 *
 * Outer 78.4 x 53.6 — the same 78.4 the logo's chevron measures in
 * `motion/loading-brief`, so this is the mark itself and not a redraw. The leaf
 * is 80.4 x 55.6 because the inner shadow blurs 1px past the path on each side.
 * The overlay-blended stroke is what makes it look pressed into the surface
 * instead of laid on top; it is bright at the top and bottom edges and absent
 * through the middle, which is how a bevel catches light.
 */
function Chevron() {
  return (
    <span className="paycard__chevron" aria-hidden="true">
      <svg viewBox="0 0 80.4 55.6" fill="none" focusable="false">
        <g filter="url(#paycard-chevron-emboss)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M57.2768 20.0086C54.7168 24.3641 48.4447 24 46.1355 20.0003L34.2855 1.93109H1L27.8344 45.6392C34.8413 57.5869 46.2806 57.5869 53.2879 45.6392L79.4 1L78.7293 1.93109H45.4591L57.2768 20.0086Z"
            fill="url(#paycard-chevron-face)"
          />
          <path
            d="M33.4746 3.43066L44.8809 20.8232C47.7637 25.689 55.4087 26.1476 58.5703 20.7686L59.041 19.9668L58.5322 19.1875L48.2314 3.43066H76.2402L51.9941 44.8799C48.6558 50.5718 44.4623 53.0996 40.5605 53.0996C36.6589 53.0994 32.4659 50.5716 29.1279 44.8799L29.1211 44.8672L29.1123 44.8545L3.68066 3.43066H33.4746Z"
            stroke="url(#paycard-chevron-bevel)"
            style={{ mixBlendMode: 'overlay' }}
            strokeWidth="3"
          />
        </g>
        <defs>
          <filter
            id="paycard-chevron-emboss"
            x="0"
            y="0"
            width="80.4"
            height="55.6"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="10" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.64 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
            <feGaussianBlur stdDeviation="0.5" result="effect2_foregroundBlur" />
          </filter>
          <linearGradient
            id="paycard-chevron-face"
            x1="1.40003"
            y1="0.999998"
            x2="68.9"
            y2="55"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#1D1D1D" />
            <stop offset="0.418269" stopColor="#838383" />
            <stop offset="0.754808" stopColor="#3D3D3D" />
            <stop offset="1" stopColor="#2A2A2A" />
          </linearGradient>
          <linearGradient
            id="paycard-chevron-bevel"
            x1="40.2"
            y1="1"
            x2="40.2"
            y2="54.6"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" stopOpacity="0.64" />
            <stop offset="0.471154" stopColor="white" stopOpacity="0" />
            <stop offset="1" stopColor="white" stopOpacity="0.64" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
