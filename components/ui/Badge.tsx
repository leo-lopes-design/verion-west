export type Tone = 'info' | 'success' | 'error' | 'warning';

/**
 * bg and fg always come from the same feedback family, which is why the badge
 * keeps its contrast when the mode flips instead of needing a dark-only rule.
 */
export function Badge({ tone = 'info', children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
