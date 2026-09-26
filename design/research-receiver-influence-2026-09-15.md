# Does the receiver decide? — a targeted research pass

A research note for the personas of a fictional product, written on 2026-09-15
from public secondary sources only. It is not a market study.

## The question

An earlier version of `/personas` carried this open question, and flagged it as
the one with the largest consequence:

> Research published by Western Union itself suggests the receiver drives the
> choice of channel and brand. If that holds, the hierarchy on this page is
> upside down: Marcos operates the transfer, but Alzira and Joana decide it.

This pass accepted Western Union's own published data as credible wherever
nothing else was available — and the claim still does not survive, because
Western Union does not make it.

## Verdict

| Claim                                                                     | Supported?                                                           |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| The receiver **decides** the channel and the brand                        | **No.** No source found says this, including WU's own.               |
| The receiver **materially constrains and influences** the sender's choice | **Yes**, on one WU-commissioned survey plus WU's own contract terms. |
| The receiver decides the **payout method and currency**                   | **Yes**, and contractually rather than by survey.                    |

The mechanism is a **constrained sender decision**: the sender chooses from a
menu that the receiver's cash-access reality has already narrowed. That is a
weaker claim than "the receiver decides" and a stronger one than "the sender
decides", and it is the one the evidence carries.

## The sources

**p1 — Arab News, 2022-12-21.** Reporting a WU-commissioned survey, Saudi
Arabia cut, n>1,500.

> "Sixty-eight percent also say their receiver influences the company they
> choose to send money through, and 74 percent state that their transfer method
> of choice — digital, retail or a mix — depends on how their receiver can
> collect the money."

The verb is **influences**, and the sentence's own subject is the sender, who
"choose[s]". The 74% figure is the stronger of the two and is about **method**,
not brand.

**p2 — NewsBytes.PH, 2022-12-03.** A Western Union executive, quoted:

> "receivers have strong influence over the frequency and amounts their senders
> transfer."

This is the scope limiter, and it comes from WU itself: frequency and amount.
Not brand.

**p3 — Western Union Online Money Transfer terms and conditions**, fetched
2026-09-15. The strongest item in the set, and the only one that is contractual
rather than self-reported:

> "The Sender authorizes Us to honor the Receiver's choice of method to receive
> funds or the pay-out currency even if it differs from the Sender's
> instructions."

WU gives the receiver authority over **method** and **pay-out currency**, and is
silent on brand.

**p4 — the global figure could not be checked.** The version of the statistic
usually quoted ("70% of senders state that the receiver influences the brand")
is published on Western Union's corporate site. The corporate site was
unavailable when this research was done (2026-09-15). Everything above is
therefore secondary reporting of WU's research, not the research itself.

**p5 — Inter-American Dialogue, 2025-04-16.** The freshest item, and a
counterweight:

> "A sender's choice of transfer method varies depending on the options
> available and the sender's needs."

Options available **and** the sender's needs — both halves, which is precisely
the constrained-decision shape.

**p6 — ECB Working Paper 1683.** The canonical academic model in this area is
titled _"Migrants' choice of remittance channel"_. The unit of analysis is the
sender; the receiver enters the model as a constraint, not as the chooser.

## What it changes in the product

Nothing was reordered, because the product had already conceded the point before
the research named it:

- `MethodScreen` in `components/prototype/screens.tsx` titles the payout screen
  **"How they collect"** — not "How you want to send".
- Every recipient in `lib/flow.ts#RECIPIENTS` carries a `defaultMethod`.
- The same screen reads "{name} usually collects by {method}".

A sender who is _reporting_ a fact about someone else's life is exactly the
constrained decision the evidence describes. What changed is the persona
documents, which now say so out loud:

- **Marcos** gains a `sourced` trait and a guardrail: he operates the transfer,
  he does not hold the method or currency decision.
- **Alzira** loses the open question and gains two panel rows that keep the two
  halves apart — _decides the method_ (yes, effectively) versus _decides the
  brand_ (no, influences, 68%).
- **Joana** gains the asymmetry: holding an account widens the sender's menu
  rather than narrowing it, so her influence is real but invisible.

## Freshness and confidence

The load-bearing survey is ~4 years old, single-country, commissioned by
Western Union, with no independent corroboration found. Confidence on the
receiver-influence claims is **medium** at best; the contractual claim (p3) is
**high**, because it is a term of service rather than a self-report.

## Open

- Whether the global figure differs materially from the Saudi cut. This depends
  on p4, which could not be checked.
- Whether receiver method-authority holds outside cash corridors, where the
  constraint mostly disappears.
