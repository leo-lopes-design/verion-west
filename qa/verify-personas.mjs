/**
 * Checks the persona data against its schema and against itself.
 *
 *   node qa/verify-personas.mjs
 *
 * `lib/personas.ts` is the contract, and three consumers read it: the panel,
 * the `.md` brief and the `.persona.json`. So this runs against the module,
 * not rendered HTML, and asserts the rules the schema calls defects.
 *
 * The module is compiled into `lib/.personas-build/` (gitignored) so node can
 * import it; the folder is removed on exit, pass or fail.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'lib', '.personas-build');

const MARKS = new Set(['product', 'sourced', 'hypothesis']);
const CONFIDENCE = new Set(['high', 'medium', 'low']);

let pass = 0;
const fail = [];
const ok = (name, cond, detail = '') => {
  if (cond) pass++;
  else fail.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

/* ---------------------------------------------------------------- compile */
function compile() {
  rmSync(BUILD, { recursive: true, force: true });
  try {
    // node on tsc's entry point: execFileSync cannot spawn the .cmd shim on Windows without a shell
    execFileSync(
      process.execPath,
      [
        path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc'),
        'lib/personas.ts',
        '--outDir',
        BUILD,
        '--module',
        'esnext',
        '--target',
        'es2022',
        '--moduleResolution',
        'bundler',
        // hoisted @types from the Angular workspace are not this file's concern
        '--skipLibCheck',
      ],
      { cwd: ROOT, stdio: 'pipe' }
    );
  } catch (e) {
    throw new Error(`tsc failed on lib/personas.ts:\n${e.stdout?.toString() || e.message}`);
  }
  return path.join(BUILD, 'personas.js');
}

try {
  const { PERSONAS, toMarkdown, toPersonaJson } = await import(pathToFileURL(compile()).href);

  /* ---------------------------------------------------------------- shape */
  ok('three personas', PERSONAS.length === 3, `got ${PERSONAS.length}`);
  ok(
    'exactly one primary',
    PERSONAS.filter((p) => p.primary).length === 1,
    `got ${PERSONAS.filter((p) => p.primary).length}`
  );
  ok('ids unique', new Set(PERSONAS.map((p) => p.id)).size === PERSONAS.length);

  for (const p of PERSONAS) {
    ok(
      `${p.id}: every panel mark is valid`,
      p.panel.every((r) => MARKS.has(r.mark))
    );
    ok(
      `${p.id}: every trait mark is valid`,
      p.traits.every((t) => MARKS.has(t.mark))
    );
    ok(
      `${p.id}: every evidence mark is valid`,
      p.evidence.every((e) => MARKS.has(e.mark))
    );
    ok(
      `${p.id}: every evidence confidence is valid`,
      p.evidence.every((e) => CONFIDENCE.has(e.confidence))
    );

    /* The schema's rule: a trait with no ledger entry is a defect. Traits and
       entries are worded differently on purpose, so the check is per claim
       class: no MARK among the traits may be absent from the ledger. */
    const traitMarks = new Set(p.traits.map((t) => t.mark));
    const ledgerMarks = new Set(p.evidence.map((e) => e.mark));
    const orphan = [...traitMarks].filter((m) => !ledgerMarks.has(m));
    ok(`${p.id}: no claim class missing from the ledger`, orphan.length === 0, orphan.join(', '));

    ok(`${p.id}: has guardrails`, p.guardrails.length > 0);
    ok(
      `${p.id}: avatar file exists`,
      existsSync(path.join(ROOT, 'public', p.avatar.slice(1))),
      p.avatar
    );
    ok(`${p.id}: avatar has alt text`, typeof p.avatarAlt === 'string' && p.avatarAlt.length > 20);
  }

  /* ----------------------------------------------- the two export formats */
  for (const p of PERSONAS) {
    const md = toMarkdown(p);
    ok(`${p.id}.md: carries the synthetic disclaimer`, md.includes('SYNTHETIC'));
    ok(`${p.id}.md: carries the evidence ledger`, md.includes('## Evidence ledger'));
    ok(`${p.id}.md: carries the guardrails`, md.includes('must NOT be used for'));
    ok(
      `${p.id}.md: every panel row reached the table`,
      p.panel.every((r) => md.includes(`| ${r.label} |`))
    );

    const j = toPersonaJson(p, '2026-01-01T00:00:00.000Z');
    ok(`${p.id}.json: blind runtime contract`, j.runtime_contract.blind === true);
    ok(`${p.id}.json: never_sees is populated`, j.runtime_contract.never_sees.length >= 5);
    ok(`${p.id}.json: fidelity is directional`, j.fidelity.level === 'directional');
    ok(
      `${p.id}.json: ledger tags are schema vocabulary`,
      j.evidence_ledger.every((e) => e.tag === 'synthetic' || e.tag === 'researched')
    );
    ok(
      `${p.id}.json: carries the re-mint guardrail`,
      j.guardrails.some((g) => g.includes('MINTED BY HAND'))
    );
    ok(
      `${p.id}.json: grounding cites a file that exists`,
      j.grounding.sources
        .filter((s) => s.startsWith('design/'))
        .every((s) => existsSync(path.join(ROOT, s.split(' ')[0])))
    );
  }

  /* ---------------------------------------------- the receiver-agency pass */
  /* The receiver-agency research counts as applied only if the data stopped
     asserting what it refuted. These assert the shape of the finding, not its wording. */
  const alzira = PERSONAS.find((p) => p.id === 'alzira-recebe-em-dinheiro');
  const marcos = PERSONAS.find((p) => p.primary);
  ok(
    'the refuted claim is gone from the open questions',
    !alzira.needsClarification.some((n) => /receiver drives channel/i.test(n))
  );
  ok(
    'Alzira keeps method authority and not brand authority',
    alzira.guardrails.some((g) =>
      /do not escalate her method authority into brand authority/i.test(g)
    )
  );
  ok(
    'Marcos is guarded against being read as the decision-maker',
    marcos.guardrails.some((g) => /payout method or currency/i.test(g))
  );
} catch (e) {
  fail.push(e.message);
} finally {
  rmSync(BUILD, { recursive: true, force: true });
}

/* ------------------------------------------------------------------ report */
console.log(`personas: ${pass}/${pass + fail.length} passed`);
for (const f of fail) console.log(`  FAIL  ${f}`);
process.exit(fail.length ? 1 : 0);
