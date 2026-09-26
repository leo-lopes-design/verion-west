/**
 * The three personas, as data.
 *
 * One source feeds three consumers: the panel on the page, the downloadable
 * Markdown brief and the downloadable `.persona.json`, so the screen and the
 * file somebody takes away cannot say different things.
 *
 * Every trait carries HOW it is known — the only thing standing between a
 * synthetic hypothesis and a number that looks like research. The evidence
 * ledger repeats that per trait: a trait with no ledger entry is a defect.
 */

/**
 * `product` — derived from something built. `sourced` — has a public source.
 * `hypothesis` — an assumption, kept visible so it cannot quietly become a fact.
 */
export type Mark = 'product' | 'sourced' | 'hypothesis';

export type PanelRow = { label: string; value: string; mark: Mark };
export type PersonaTrait = { mark: Mark; text: string };
export type Evidence = {
  trait: string;
  source: string;
  confidence: 'high' | 'medium' | 'low';
  mark: Mark;
};

export type Persona = {
  id: string;
  name: string;
  role: string;
  archetype: string;
  job: string;
  /** Exactly one persona is primary — the only one who opens the app. */
  primary: boolean;
  avatar: string;
  avatarAlt: string;
  panel: PanelRow[];
  traits: PersonaTrait[];
  goals: string[];
  frustrations: string[];
  behaviors: string[];
  context: { role: string; region: string; devices: string[]; a11yNeeds: string[] };
  voice: string;
  guardrails: string[];
  needsClarification: string[];
  evidence: Evidence[];
};

/** Evidence tags in the JSON file's vocabulary. `sourced` is written as `researched`. */
const TAG: Record<Mark, string> = {
  product: 'synthetic',
  sourced: 'researched',
  hypothesis: 'synthetic',
};

export const PERSONAS: Persona[] = [
  {
    id: 'marcos-remetente',
    name: 'Marcos',
    role: 'The sender — the only one who opens the app',
    archetype: 'Long-settled migrant, sends small and often to the same people',
    job: '“Send the usual, to the person I always send to. Know what lands. Know it arrived.”',
    primary: true,
    avatar: '/media/avatar-marcos.jpg',
    avatarAlt: 'A man in his forties, indoors by a window, looking into the camera',
    panel: [
      { label: 'Age', value: '38–52, peak at 45', mark: 'sourced' },
      { label: 'Years since migrating', value: '~26 — settled, not recent', mark: 'sourced' },
      { label: 'Sends from', value: 'United States (USD balance)', mark: 'hypothesis' },
      { label: 'Corridors', value: 'BR · PT · US · MX · UK', mark: 'product' },
      { label: 'Typical amount', value: '$120 – $480', mark: 'product' },
      { label: 'Daily limit', value: '$920', mark: 'product' },
      { label: 'Frequency', value: '14–17 transfers a year', mark: 'sourced' },
      { label: 'Digital adoption', value: '25% at 18–29 vs 7% at 60–69', mark: 'sourced' },
      {
        label: 'Picks the payout method',
        value: 'Enters it — does not decide it',
        mark: 'sourced',
      },
    ],
    traits: [
      {
        mark: 'product',
        text: 'Earns and holds a balance in USD, and sends to named people in five corridors. The app was designed around him end to end.',
      },
      {
        mark: 'sourced',
        text: 'Aged roughly 38 to 52. Propensity to send money abroad peaks at 40–49 and halves by 70 (Statistics Canada, 2017 data).',
      },
      {
        mark: 'sourced',
        text: 'A long-settled migrant, not a recent arrival. In the largest US corridor the sender has been in the country 26 years on average.',
      },
      {
        mark: 'product',
        text: 'Small and repeating, not one large event. The seeded history is $250, $480, $120 against a $920 daily limit — personal scale, not business.',
      },
      {
        mark: 'sourced',
        text: 'The order of magnitude survives contact with reality: average principal in the Mexico corridor was $490 in 2024 and $520 in 2025, at 14–17 transfers a year.',
      },
      {
        /* Stops the page reading as if the sender owned a decision he only transcribes. */
        mark: 'sourced',
        text: 'He operates the transfer but does not freely choose how it lands. Western Union’s own terms let the receiver’s choice of payout method and currency override his instructions, and the screen that picks it is titled “How they collect”.',
      },
      {
        mark: 'hypothesis',
        text: 'Sends from the United States. The USD default points there, and the US is the largest sending country by a wide margin — but that is inference from one configuration line.',
      },
    ],
    goals: [
      'send the usual amount to the person I always send to, without re-entering everything',
      'know exactly what lands before I confirm',
      'know it arrived without having to ask anyone',
    ],
    frustrations: [
      'a fee that only appears at the end',
      'not knowing where the money is between sending and collection',
    ],
    behaviors: [
      'sends small amounts on a repeating cadence to the same named people',
      'checks the arrival figure before confirming, not after',
      'picks the payout method the recipient can actually use, not the one he would prefer',
    ],
    context: {
      role: 'Remittance sender, personal scale',
      region: 'United States (inferred from the USD default)',
      devices: ['mobile'],
      a11yNeeds: [],
    },
    voice: 'plain and unhurried; wants the number, not the pitch; reads the fee line twice',
    guardrails: [
      'do not use for pricing-elasticity decisions — the fees in this product are invented',
      'do not treat the age range as measured: it is a reading of a propensity curve, and no public source publishes a median sender age',
      'do not treat him as the decision-maker for payout method or currency — on WU’s own terms that authority sits with the receiver',
      'directional only — nobody was interviewed about this product, which does not exist',
    ],
    needsClarification: [
      'the relationship between sender and recipient — family, partner, employee — which decides the emotional register of any image with both in it',
      'whether the card user and the sender are the same person',
    ],
    evidence: [
      {
        trait: 'holds a USD balance and sends to five named corridors',
        source: 'lib/money.ts, lib/flow.ts#RECIPIENTS',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: 'aged roughly 38–52',
        source:
          'Statistics Canada, Study on International Money Transfers (2017 data) — propensity peaks 40–49',
        confidence: 'low',
        mark: 'sourced',
      },
      {
        trait: 'long-settled migrant, ~26 years in country',
        source: 'Inter-American Dialogue, 2026 — Mexican immigrants average 26 years in the US',
        confidence: 'medium',
        mark: 'sourced',
      },
      {
        trait: 'small repeating amounts',
        source: 'lib/flow.ts#SEED_TRANSFERS — $250, $480, $120 against DAILY_LIMIT_USD 920',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: '14–17 transfers a year',
        source: 'Inter-American Dialogue, 2025 projections',
        confidence: 'low',
        mark: 'sourced',
      },
      {
        trait: 'does not hold the payout-method decision',
        source:
          'Western Union Online Money Transfer terms (fetched 2026-09-15): “The Sender authorizes Us to honor the Receiver’s choice of method to receive funds or the pay-out currency even if it differs from the Sender’s instructions.”',
        confidence: 'high',
        mark: 'sourced',
      },
      {
        trait: 'sends from the United States',
        source: 'inference from the USD send default in lib/money.ts — not a stated fact',
        confidence: 'low',
        mark: 'hypothesis',
      },
    ],
  },
  {
    id: 'alzira-recebe-em-dinheiro',
    name: 'Alzira',
    role: 'Receives in cash — never opens the app',
    archetype: 'Cash-pickup recipient; the journey to the counter is hers',
    job: '“Go and collect it, and don’t come home empty-handed.”',
    primary: false,
    avatar: '/media/avatar-alzira.jpg',
    avatarAlt:
      'A woman in her late sixties outdoors in hard afternoon light, looking into the camera',
    panel: [
      { label: 'Payout method', value: 'Cash pickup', mark: 'product' },
      { label: 'Fee she pays for', value: '1.2% + $2.40 — the highest', mark: 'product' },
      { label: 'Arrival', value: 'Minutes', mark: 'product' },
      { label: 'Banked', value: 'Probably yes — 80% of senders are', mark: 'sourced' },
      { label: 'Surface in this product', value: 'None — a code and a counter', mark: 'product' },
      { label: 'Decides the method', value: 'Effectively yes — 74% say so', mark: 'sourced' },
      { label: 'Decides the brand', value: 'No — influences it, 68%', mark: 'sourced' },
      { label: 'Age', value: 'No public anchor exists', mark: 'hypothesis' },
    ],
    traits: [
      {
        mark: 'product',
        text: 'Sits in a corridor where cash pickup is the sender’s default. The product charges the highest fee for it (1.2% + $2.40) and delivers in minutes.',
      },
      {
        mark: 'product',
        text: 'She pays for speed. That only makes sense if the need is immediate — which is why her experience is a tracking number and a counter, not a screen.',
      },
      {
        mark: 'sourced',
        text: 'Cash is not a signal of being unbanked. 45% of senders still use physical agent locations while 80% hold a bank account. We had this wrong first time.',
      },
      {
        /* Method is in WU's contract; brand is only a survey verb, "influences". */
        mark: 'sourced',
        text: 'She does not pick the company, but she effectively picks the method. 74% of senders in one surveyed market say their transfer method depends on how the receiver can collect, and WU’s terms let her choice of method and currency override his instructions.',
      },
      {
        mark: 'product',
        text: 'The journey is hers. If the money is not there when she arrives, the cost is a wasted trip — not a notification.',
      },
    ],
    goals: ['collect the money today, and not make the trip twice'],
    frustrations: [
      'arriving at the counter and finding the money is not available',
      'having no way to check before leaving home',
    ],
    behaviors: [
      'receives the tracking code through a channel outside this product',
      'tells the sender how she can collect, which narrows what he can pick',
    ],
    context: {
      role: 'Cash-pickup recipient',
      region: 'Cash corridors in the seed — São Paulo, Guadalajara',
      devices: [],
      a11yNeeds: [],
    },
    voice: 'practical, unsentimental; asks whether it is there, not how it works',
    guardrails: [
      'do not use to represent financial exclusion — cash persists among the banked, and the earlier version of this persona had that backwards',
      'do not assign an age: no public source anchors receiver age, and the one table found summed to 109%',
      'do not escalate her method authority into brand authority — the sourced verb is “influences”, and WU’s contract covers method and currency only',
      'she never sees a screen in this product; do not use her to evaluate UI',
    ],
    needsClarification: [
      'her age — no globally representative source exists',
      'how far her method authority reaches in practice: the one survey that quantifies it is a single national cut (Saudi Arabia, n>1,500, December 2022) and Western Union’s global figure could not be checked — the corporate site was unavailable when this research was done (2026-09-15)',
    ],
    evidence: [
      {
        trait: 'cash-pickup corridor with the highest fee and fastest arrival',
        source: 'lib/money.ts#PAYOUT.cash — 1.2% + $2.40, minutes',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: 'cash is not a proxy for being unbanked',
        source: 'Inter-American Dialogue, 2026 — 45% use agent locations, 80% hold a bank account',
        confidence: 'medium',
        mark: 'sourced',
      },
      {
        trait: 'the receiver effectively decides the payout method',
        source:
          'Western Union Online Money Transfer terms (fetched 2026-09-15), plus WU-commissioned survey reported by Arab News 2022-12-21 (Saudi cut, n>1,500): 74% say their transfer method depends on how the receiver can collect',
        confidence: 'medium',
        mark: 'sourced',
      },
      {
        trait: 'the receiver influences but does not choose the brand',
        source:
          'Same survey: 68% say the receiver “influences the company they choose”. The sender remains the one who chooses; a WU executive (NewsBytes.PH, 2022-12-03) scopes receiver influence to frequency and amount',
        confidence: 'medium',
        mark: 'sourced',
      },
      {
        trait: 'no screen in this product',
        source: 'components/prototype — the flow has no recipient-facing surface',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: 'age unknown',
        source:
          'no anchored source; the only receiver-age table found summed to 109% and was discarded',
        confidence: 'low',
        mark: 'hypothesis',
      },
    ],
  },
  {
    id: 'joana-recebe-em-conta',
    name: 'Joana',
    role: 'Receives into an account — never opens the app',
    archetype: 'Bank-deposit recipient; the money simply appears',
    job: '“Let it land, and let me know when.”',
    primary: false,
    avatar: '/media/avatar-joana.jpg',
    avatarAlt: 'A woman in her thirties indoors in soft daylight, looking into the camera',
    panel: [
      { label: 'Payout method', value: 'Bank deposit · digital wallet', mark: 'product' },
      { label: 'Fee', value: '0.6% + $1.20 — the lowest', mark: 'product' },
      { label: 'Arrival', value: '1–2 business days', mark: 'product' },
      { label: 'Trade she makes', value: 'Speed for cost', mark: 'product' },
      { label: 'Surface in this product', value: 'None — the wait is silent', mark: 'product' },
      {
        label: 'Split from Alzira',
        value: 'Product design, not measured behaviour',
        mark: 'hypothesis',
      },
    ],
    traits: [
      {
        mark: 'product',
        text: 'Bank deposit and digital wallet corridors. Lowest fee (0.6% + $1.20), 1–2 days. She trades speed for cost, which implies the need is not today.',
      },
      {
        mark: 'product',
        text: 'Between send and arrival she has no surface at all in this product. The wait is silent by design, and that is a gap, not a feature.',
      },
      {
        /* Holding an account widens the menu, so her influence narrows nothing. */
        mark: 'sourced',
        text: 'Her authority over the method is real but invisible. Holding an account is what widens the menu rather than narrowing it, so the same receiver influence that forces Alzira’s corridor to cash leaves his options open here.',
      },
      {
        mark: 'hypothesis',
        text: 'Splitting her from Alzira by payout method has no measured basis. The Global Findex does not ask whether a remittance arrived as cash or digitally.',
      },
    ],
    goals: ['have it land without doing anything', 'know when it landed'],
    frustrations: ['the silence between send and arrival'],
    behaviors: ['takes the slower, cheaper route because the need is not immediate'],
    context: {
      role: 'Bank-deposit recipient',
      region: 'Account corridors in the seed — Lisbon, Miami, Manchester',
      devices: [],
      a11yNeeds: [],
    },
    voice: 'undemanding; would rather be told than have to check',
    guardrails: [
      'do not use as evidence of a market split — the cash/account division here is product design, and no globally representative source measures it',
      'she never sees a screen in this product; do not use her to evaluate UI',
    ],
    needsClarification: [
      'whether the cash/account split reflects any real proportion — the flagship financial-inclusion survey does not ask the question',
    ],
    evidence: [
      {
        trait: 'account corridor, lowest fee, 1–2 days',
        source: 'lib/money.ts#PAYOUT.bank — 0.6% + $1.20',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: 'no surface between send and arrival',
        source: 'components/prototype — no recipient-facing screen exists',
        confidence: 'high',
        mark: 'product',
      },
      {
        trait: 'an account widens the sender’s menu rather than narrowing it',
        source:
          'Inter-American Dialogue, 2025-04-16: “A sender’s choice of transfer method varies depending on the options available and the sender’s needs.”',
        confidence: 'low',
        mark: 'sourced',
      },
      {
        trait: 'the cash/account split is unmeasured',
        source:
          'Global Findex 2025 has no cash-vs-digital receipt question (Remitscope, 2025-10-30)',
        confidence: 'medium',
        mark: 'hypothesis',
      },
    ],
  },
];

/* ------------------------------------------------------------------ export */

const DISCLAIMER = [
  'DEMO — a study reconstruction. Verion West is a fictional product; no affiliation with,',
  'endorsement by, or approval from Western Union. This persona is SYNTHETIC: nobody was',
  'interviewed, because the product does not exist. Fidelity is `directional`. Every claim',
  'carries how it is known — product (derived from what was built), sourced (public research',
  'about remittance behaviour generally, not about this product), hypothesis (assumption).',
  'Do not cite it as research and do not let a hypothesis become a number.',
].join('\n');

export function toMarkdown(p: Persona): string {
  const line = (t: PersonaTrait) => `- \`[${t.mark}]\` ${t.text}`;
  return `<!-- tags: personas, audience, synthetic -->
# ${p.name} — ${p.archetype}

> **Tag: \`synthetic\` · Fidelity: \`directional\`.**
> ${DISCLAIMER.split('\n').join('\n> ')}

## Persona: ${p.name} · \`synthetic\` · grounds: the built product + one public research pass

- **Role:** ${p.role}
- **Context:** ${p.context.role} · ${p.context.region}${
    p.context.devices.length ? ` · ${p.context.devices.join(', ')}` : ''
  }
- **Voice:** ${p.voice}
- **Job to be done:** ${p.job}

### At a glance

| | | |
|---|---|---|
${p.panel.map((r) => `| ${r.label} | ${r.value} | \`${r.mark}\` |`).join('\n')}

### Traits

${p.traits.map(line).join('\n')}

### Goals

${p.goals.map((g) => `- ${g}`).join('\n')}

### Frustrations

${p.frustrations.map((f) => `- ${f}`).join('\n')}

### Behaviours

${p.behaviors.map((b) => `- ${b}`).join('\n')}

## Evidence ledger

Every trait traces to a source. A trait with no entry here is a defect.

| Trait | Source | Confidence | Tag |
|---|---|---|---|
${p.evidence.map((e) => `| ${e.trait} | ${e.source} | ${e.confidence} | \`${TAG[e.mark]}\` |`).join('\n')}

## Guardrails — what this persona must NOT be used for

${p.guardrails.map((g) => `- ${g}`).join('\n')}

## Open questions

${p.needsClarification.map((n) => `- [ ] ${n}`).join('\n')}

---

_Generated from the Verion West design-system demo. Regenerate rather than hand-edit._
`;
}

export function toPersonaJson(p: Persona, isoDate: string) {
  return {
    id: p.id,
    name: p.name,
    archetype: p.archetype,
    source_persona: 'lib/personas.ts',
    context: {
      role: p.context.role,
      region: p.context.region,
      devices: p.context.devices,
      a11y_needs: p.context.a11yNeeds,
    },
    goals: p.goals,
    frustrations: p.frustrations,
    behaviors: p.behaviors,
    voice: p.voice,
    /* When the persona stands in for a user walking through screens, it is told
       only what that user would know. */
    runtime_contract: {
      blind: true,
      sees: [
        'screens, one at a time',
        'its own goal, in its own words',
        'its own traits, as self-knowledge — never as a document',
      ],
      never_sees: [
        'the product spec or the planned user flows',
        'design or usability vocabulary',
        'which screen or flow it is meant to be on',
        'the other personas',
        'whether its last action was the one the designer intended',
      ],
    },
    evidence_ledger: p.evidence.map((e) => ({
      trait: e.trait,
      source: e.source,
      confidence: e.confidence,
      tag: TAG[e.mark],
    })),
    grounding: {
      method: 'mixed',
      sources: [
        'the built product — lib/money.ts, lib/flow.ts, components/prototype',
        'design/research-receiver-influence-2026-09-15.md (public secondary research)',
      ],
      consent_cleared: true,
    },
    fidelity: {
      level: 'directional',
      basis:
        'No brief and no interviews: the product is fictional. Traits derive from what was built plus public research about remittance behaviour in general.',
    },
    guardrails: [
      ...p.guardrails,
      'MINTED BY HAND from this demo’s data, not generated by a tool — treat it as a draft.',
      'A persona file is normally an internal working document; this one is downloadable only because the product, the brand and the people are all invented.',
    ],
    needs_clarification: p.needsClarification,
    meta: {
      produced_by: 'hand, from lib/personas.ts',
      schema_version: '2.0',
      project: 'Verion West — design system demo',
      status: 'draft',
      created_at: isoDate,
    },
  };
}
