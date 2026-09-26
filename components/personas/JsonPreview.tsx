/**
 * A syntax-highlighted JSON preview, tokenised here rather than by a library.
 *
 * Prism, Shiki and highlight.js all arrive with a colour theme of their own.
 * Dropping one into a demo whose entire argument is that no colour lives in the
 * code would be the most expensive contradiction on the page — so this is about
 * forty lines of regex and every colour resolves through `syntax/*`, five
 * tokens created for exactly this and themed like everything else.
 *
 * It runs on the server: the markup arrives highlighted and ships no JavaScript
 * to do it.
 */
import type { ReactNode } from 'react';

/**
 * One pass. A quoted run followed by a colon is a key; a quoted run on its own
 * is a string. Everything the regex does not claim is whitespace, and is
 * emitted untouched so the pretty-printer's indentation survives.
 */
const TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],:])/g;

function highlight(line: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;

  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(line.slice(last, at));

    const [, keyName, keyColon, str, literal, num, punct] = m;
    if (keyName !== undefined) {
      out.push(
        <span className="tok tok--key" key={`${keyPrefix}-${i++}`}>
          {keyName}
        </span>,
        <span className="tok tok--punct" key={`${keyPrefix}-${i++}`}>
          {keyColon}
        </span>
      );
    } else if (str !== undefined) {
      out.push(
        <span className="tok tok--str" key={`${keyPrefix}-${i++}`}>
          {str}
        </span>
      );
    } else if (literal !== undefined) {
      out.push(
        <span className="tok tok--lit" key={`${keyPrefix}-${i++}`}>
          {literal}
        </span>
      );
    } else if (num !== undefined) {
      out.push(
        <span className="tok tok--num" key={`${keyPrefix}-${i++}`}>
          {num}
        </span>
      );
    } else if (punct !== undefined) {
      out.push(
        <span className="tok tok--punct" key={`${keyPrefix}-${i++}`}>
          {punct}
        </span>
      );
    }
    last = at + m[0].length;
  }

  if (last < line.length) out.push(line.slice(last));
  return out;
}

type Props = {
  value: unknown;
  filename: string;
  /** Names the scroll region for a screen reader — the <pre> is focusable. */
  label: string;
};

export function JsonPreview({ value, filename, label }: Props) {
  const text = JSON.stringify(value, null, 2);
  const lines = text.split('\n');
  const gutterWidth = `${String(lines.length).length}ch`;

  return (
    <figure className="codeblock" style={{ margin: 0 }}>
      <figcaption className="codeblock__bar">
        <span className="codeblock__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="codeblock__name">{filename}</span>
        <span className="codeblock__meta">{lines.length} lines</span>
      </figcaption>

      {/* tabIndex on a scrollable region, not on the figure: a keyboard user has
          to be able to reach the overflow, and only the <pre> actually scrolls. */}
      <pre className="codeblock__body" tabIndex={0} role="region" aria-label={label}>
        <code>
          {lines.map((line, n) => (
            <span className="codeblock__line" key={n}>
              <span className="codeblock__num" aria-hidden="true" style={{ width: gutterWidth }}>
                {n + 1}
              </span>
              <span className="codeblock__code">{highlight(line, `l${n}`)}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
