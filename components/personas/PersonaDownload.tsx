'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { toMarkdown, toPersonaJson, type Persona } from '@/lib/personas';

/**
 * Takes the persona away, in the two forms it is actually wanted in.
 *
 * `.md` is the brief a human reads. `.persona.json` is the same persona as
 * structured data — the object rendered above it, so the page and the file
 * cannot diverge.
 *
 * Both are built in the browser from the same source the page rendered from;
 * a copy on disk would be a second thing to keep in step.
 */
export function PersonaDownload({ persona }: { persona: Persona }) {
  const [done, setDone] = useState<string | null>(null);

  function save(kind: 'md' | 'json') {
    const isMd = kind === 'md';
    const body = isMd
      ? toMarkdown(persona)
      : JSON.stringify(toPersonaJson(persona, new Date().toISOString()), null, 2);
    const name = isMd ? `${persona.id}.md` : `${persona.id}.persona.json`;

    const blob = new Blob([body], {
      type: isMd ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoke on the next tick — revoking synchronously can beat the download.
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setDone(name);
    setTimeout(() => setDone(null), 2600);
  }

  return (
    <div className="persona__take">
      <div className="demo-grid" style={{ gap: 'var(--wu-ref-space-sm)' }}>
        <Button variant="secondary" size="md" icon="download" onClick={() => save('md')}>
          Download .md
        </Button>
        <Button variant="tertiary" size="md" icon="download" onClick={() => save('json')}>
          .persona.json
        </Button>
      </div>
      <p className="t-body-03 text-secondary" aria-live="polite">
        {done ? `Saved ${done}` : 'The brief as Markdown, or the same persona as structured JSON.'}
      </p>
    </div>
  );
}
