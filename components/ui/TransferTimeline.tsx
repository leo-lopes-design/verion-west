import { STATUS_STEP, TIMELINE_STEPS, type TransferStatus } from '@/lib/flow';
import { TimelineStep, type StepState } from './Rows';

function stepState(step: number, reached: number): StepState {
  if (step < reached) return 'done';
  return step === reached ? 'active' : 'pending';
}

/** The delivery steps, drawn from a transfer's status — the same on the site and in the app. */
export function TransferTimeline({ status }: { status: TransferStatus }) {
  const reached = STATUS_STEP[status];
  return (
    <div className="timeline">
      {TIMELINE_STEPS.map((step, i) => (
        <TimelineStep
          key={step.title}
          title={step.title}
          when={i <= reached ? step.when : 'Pending'}
          state={stepState(i, reached)}
          last={i === TIMELINE_STEPS.length - 1}
        />
      ))}
    </div>
  );
}
