/**
 * A template, not a layout: Next remounts this on every navigation, which is
 * exactly the hook a route crossfade needs. A layout would persist and the
 * animation would run once, on first paint, and never again.
 *
 * The fade is 250ms — `motion/duration/base`. Short on purpose: these are
 * client-side navigations between prerendered pages, so the transition is the
 * only thing that takes any time at all, and a long one would make an instant
 * page feel slow.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="routefade">{children}</div>;
}
