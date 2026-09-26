import type { ReactNode } from 'react';

/**
 * The shell around the prototype. Everything inside `device__screen` is the
 * real app — the frame contributes no colour of its own to it, so the app
 * still themes on its own terms.
 */
export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device">
      <span className="device__btn device__btn--silent" aria-hidden="true" />
      <span className="device__btn device__btn--vol-up" aria-hidden="true" />
      <span className="device__btn device__btn--vol-dn" aria-hidden="true" />
      <span className="device__btn device__btn--power" aria-hidden="true" />
      <div className="device__screen">
        <span className="device__sensor" aria-hidden="true" />
        <span className="device__glare" aria-hidden="true" />
        {children}
        <span className="device__indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
