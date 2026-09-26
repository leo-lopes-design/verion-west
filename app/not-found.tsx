import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap" id="main">
      <h1>Page not found</h1>
      <p>
        This page does not exist. <Link href="/">Back to the design system</Link>.
      </p>
    </main>
  );
}
