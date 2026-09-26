import type { Metadata } from 'next';
import { Archivo, Roboto } from 'next/font/google';
import './globals.css';
import { DemoBanner } from '@/components/DemoBanner';
import { Intro } from '@/components/Intro';
import { SiteNav } from '@/components/SiteNav';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
  display: 'swap',
});
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Verion West — Design System Demo', template: '%s — Verion West' },
  description:
    'A three-tier design system built in Figma and exported to code. Tokens, components and two live surfaces that theme from the same variables.',
  robots: { index: false, follow: false },
};

/** Read the stored theme before first paint so the page never flashes the wrong one. */
const noFlash = `
(function () {
  try {
    var t = localStorage.getItem('wu-theme');
    if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${roboto.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {/* An overlay that unmounts itself; the page below is never gated behind it. */}
        <Intro />
        <DemoBanner />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
