import { Badge, type Tone } from './Badge';

/** Label stretches, value sits right — a column of values lines up with no grid. */
export function DetailRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`detail-row${muted ? ' detail-row--muted' : ''}`}>
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value}</span>
    </div>
  );
}

export function ListRow({
  primary,
  secondary,
  amount,
  tone,
  status,
}: {
  primary: string;
  secondary: string;
  amount: string;
  tone: Tone;
  status: string;
}) {
  return (
    <div className="list-row">
      <span className="list-row__identity">
        <span className="list-row__primary">{primary}</span>
        <span className="list-row__secondary">{secondary}</span>
      </span>
      <span className="list-row__amount">{amount}</span>
      <Badge tone={tone}>{status}</Badge>
    </div>
  );
}

export type StepState = 'done' | 'active' | 'pending';

/** done is the past, active is where the money is now, pending is what is left.
 *  The connector takes the colour of the step above it, so progress reads on the
 *  line and not only on the dot. */
export function TimelineStep({
  title,
  when,
  state,
  last,
}: {
  title: string;
  when: string;
  state: StepState;
  last?: boolean;
}) {
  return (
    <div className={`tl-step tl-step--${state}`}>
      <span className="tl-step__gutter">
        <span className="tl-step__dot" />
        {last ? null : <span className="tl-step__line" />}
      </span>
      <span className="tl-step__content">
        <span className="tl-step__title">{title}</span>
        <span className="tl-step__when">{when}</span>
      </span>
    </div>
  );
}
