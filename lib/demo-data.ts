import type { CompanyTarget } from "@/domain/inputs";
import type { PostMortemAnalysis } from "@/domain/postmortem";
import { editorialDisclaimer } from "@/domain/prompts";

type DemoExample = {
  label: string;
  subject: string;
  contextNotes: string;
  aliases: string[];
  build: (generatedAt: string) => PostMortemAnalysis;
};

function withMeta(
  company: CompanyTarget,
  generatedAt: string,
  analysis: Omit<PostMortemAnalysis, "company" | "generatedAt" | "sourceMode" | "disclaimer">,
): PostMortemAnalysis {
  return {
    company,
    generatedAt,
    sourceMode: "demo",
    disclaimer: editorialDisclaimer,
    ...analysis,
  };
}

export const demoExamples: Array<{
  label: string;
  subject: string;
  contextNotes: string;
}> = [
  {
    label: "Northvolt / industrial scale",
    subject: "Northvolt",
    contextNotes:
      "Battery manufacturing, capital intensity, Europe-first industrial strategy.",
  },
  {
    label: "Quibi / consumer habit",
    subject: "Quibi",
    contextNotes: "Mobile-first entertainment, launch timing, product assumptions.",
  },
  {
    label: "Babylon / regulated growth",
    subject: "Babylon Health",
    contextNotes: "Regulation, public markets pressure, healthcare unit economics.",
  },
  {
    label: "Jawbone / hardware squeeze",
    subject: "Jawbone",
    contextNotes: "Hardware margins, competition, execution drift.",
  },
  {
    label: "Quibi URL",
    subject: "https://www.quibi.com",
    contextNotes: "Try a URL-based lookup.",
  },
];

const catalog: DemoExample[] = [
  {
    label: "Northvolt",
    subject: "Northvolt",
    contextNotes:
      "Battery manufacturing, capital intensity, Europe-first industrial strategy.",
    aliases: ["northvolt", "northvolt.com"],
    build: (generatedAt) =>
      withMeta(
        { displayName: "Northvolt", inputType: "company" },
        generatedAt,
        {
          overview:
            "Northvolt's promise was unusually powerful: build a European battery champion at industrial scale, close the gap with Asia, and capture the electric transition from the cell up. The ambition was strategically attractive, but the operating burden appears to have outrun the company's ability to industrialize consistently, preserve cash, and reduce execution risk fast enough.",
          timeline: [
            {
              dateLabel: "2016-2019",
              event:
                "Northvolt launches with a Europe-first battery thesis and raises substantial backing around the idea of building domestic cell capacity.",
              kind: "founding",
            },
            {
              dateLabel: "2020-2022",
              event:
                "The company adds industrial partnerships, expands manufacturing plans, and becomes a flagship bet on European battery sovereignty.",
              kind: "funding",
            },
            {
              dateLabel: "2023-2024",
              event:
                "As scale-up pressure intensifies, the gap between strategic narrative and reliable factory output becomes harder to ignore.",
              kind: "market",
            },
            {
              dateLabel: "Later stage",
              event:
                "Cash pressure, complex operations, and the difficulty of synchronizing technology, manufacturing, and demand narrow the company's room to recover.",
              kind: "shutdown",
            },
          ],
          whatWentWrong: {
            title: "What Went Wrong",
            summary:
              "The core issue looks less like one bad decision and more like a collision between industrial ambition and operational reality. Battery manufacturing punishes delays, yield problems, and capital overruns at the same time.",
            bullets: [
              "Capital intensity was extreme, leaving little margin for prolonged execution drift.",
              "Scaling advanced manufacturing appears to have been harder than the public story initially implied.",
              "A broad strategic mandate increased complexity before core production reliability was fully secured.",
              "Once confidence in industrial execution weakens, fundraising and customer leverage both deteriorate quickly.",
            ],
          },
          whatCouldHaveSavedIt: {
            title: "What Could Have Saved It",
            summary:
              "A narrower operating posture may have improved the odds, though it would not have removed the structural difficulty of the category.",
            bullets: [
              "A tighter initial manufacturing scope could have reduced coordination risk.",
              "Earlier emphasis on yield, reliability, and throughput over expansion narrative might have preserved credibility.",
              "More conservative pacing of factory build-out may have protected liquidity.",
              "A staged industrial roadmap with clearer proof points might have reduced strategic overreach.",
            ],
          },
          lessonsForFounders: {
            title: "Lessons for Founders",
            summary:
              "Industrial startups cannot fund their way out of process instability forever. Hardware and manufacturing stories must earn the right to scale.",
            bullets: [
              "Do not confuse strategic importance with operational readiness.",
              "In capital-heavy categories, execution risk compounds faster than software founders expect.",
              "Expansion should follow repeatable output, not precede it.",
              "When the factory is the product, process discipline is the growth strategy.",
            ],
          },
          observedFacts: [
            "Northvolt was positioned as a major European battery manufacturer.",
            "The company operated in a highly capital-intensive category with demanding industrial execution requirements.",
            "Its story was closely tied to the rise of electric vehicles and regional supply-chain concerns.",
          ],
          plausibleHypotheses: [
            "Operational complexity likely consumed management bandwidth that would otherwise have gone to de-risking core production.",
            "The strategic importance of the mission may have encouraged broader commitments before the operating system was mature.",
            "Factory economics likely became less forgiving as timelines slipped.",
          ],
          openQuestions: [
            "How much of the failure was driven by technical yield issues versus financing conditions?",
            "Could a narrower geographic or product scope have materially changed the outcome?",
            "Which internal milestones were most predictive of the later strain?",
          ],
        },
      ),
  },
  {
    label: "Quibi",
    subject: "Quibi",
    contextNotes: "Mobile-first entertainment, launch timing, product assumptions.",
    aliases: ["quibi", "quibi.com"],
    build: (generatedAt) =>
      withMeta(
        { displayName: "Quibi", inputType: "company" },
        generatedAt,
        {
          overview:
            "Quibi entered the market with money, talent, and Hollywood access, but its core assumption proved fragile: that premium short-form video needed a new paid destination built specifically for phones. The company seems to have solved for production value before proving that the product itself fit everyday viewer behavior.",
          timeline: [
            {
              dateLabel: "2018",
              event:
                "Quibi launches with a well-funded thesis around premium short-form entertainment for mobile viewing.",
              kind: "founding",
            },
            {
              dateLabel: "2019-early 2020",
              event:
                "The company commissions high-profile content and markets itself as a new category rather than an iteration on existing video habits.",
              kind: "product",
            },
            {
              dateLabel: "2020 launch",
              event:
                "Quibi debuts into a media environment already saturated with free attention and established streaming brands.",
              kind: "market",
            },
            {
              dateLabel: "Same year",
              event:
                "Weak retention and limited traction leave the business with little time to reset its core assumptions.",
              kind: "shutdown",
            },
          ],
          whatWentWrong: {
            title: "What Went Wrong",
            summary:
              "Quibi appears to have mistaken a packaging concept for a durable consumer need. The product was new, but the underlying viewing behavior may not have been waiting for it.",
            bullets: [
              "The company bet on a narrow use case instead of meeting a broad, repeated habit.",
              "Paid mobile video faced immediate competition from free platforms with much stronger engagement loops.",
              "The launch posture emphasized Hollywood polish over distribution and everyday utility.",
              "When early adoption disappointed, the fixed cost base left little room for gradual learning.",
            ],
          },
          whatCouldHaveSavedIt: {
            title: "What Could Have Saved It",
            summary:
              "A more iterative launch might have surfaced weak assumptions earlier and at lower cost.",
            bullets: [
              "Testing with smaller content budgets could have clarified whether the product solved a real habit problem.",
              "A broader cross-device experience may have reduced the mismatch between content and consumption context.",
              "A lighter monetization model could have lowered adoption friction.",
              "Stronger emphasis on shareability and organic distribution might have improved discovery.",
            ],
          },
          lessonsForFounders: {
            title: "Lessons for Founders",
            summary:
              "Consumer businesses fail when they optimize the artifact and under-test the habit. Prestige cannot substitute for product-market fit.",
            bullets: [
              "Do not spend as if the market thesis has already been proven.",
              "Distribution advantages matter as much as product quality in consumer media.",
              "If a startup is asking users to learn a new behavior, the payoff must be obvious.",
              "Large funding rounds can accelerate conviction before they validate demand.",
            ],
          },
          observedFacts: [
            "Quibi launched as a premium short-form mobile streaming service.",
            "The company invested heavily in original content and industry talent.",
            "The business shut down quickly after launch.",
          ],
          plausibleHypotheses: [
            "The product likely overestimated how willing users were to pay for a new mobile-only viewing context.",
            "The company may have treated production quality as the main moat in a market dominated by distribution and habit.",
            "The launch structure probably made course correction too expensive.",
          ],
          openQuestions: [
            "Would Quibi have fared differently with a free tier or creator-led distribution model?",
            "How much did launch timing matter relative to the core product assumption?",
            "Which user behavior signals did the company underestimate before launch?",
          ],
        },
      ),
  },
  {
    label: "Babylon Health",
    subject: "Babylon Health",
    contextNotes: "Regulation, public markets pressure, healthcare unit economics.",
    aliases: ["babylon health", "babylon", "babylonhealth.com"],
    build: (generatedAt) =>
      withMeta(
        { displayName: "Babylon Health", inputType: "company" },
        generatedAt,
        {
          overview:
            "Babylon Health sold a compelling story about digital-first healthcare, but healthcare businesses often break where software instincts meet real-world reimbursement, regulation, and service delivery. The business appears to have stretched between narrative ambition and the slower economics of healthcare execution.",
          timeline: [
            {
              dateLabel: "Early years",
              event:
                "Babylon gains attention for combining telehealth, consumer product design, and a broad technology narrative around care delivery.",
              kind: "founding",
            },
            {
              dateLabel: "Growth stage",
              event:
                "The company expands partnerships, geography, and strategic scope while presenting itself as a category-defining digital healthcare platform.",
              kind: "funding",
            },
            {
              dateLabel: "Public-market era",
              event:
                "Public scrutiny increases pressure on economics, growth quality, and operating clarity.",
              kind: "market",
            },
            {
              dateLabel: "Decline",
              event:
                "The gap between ambitious positioning and sustainable financial performance narrows the company's options.",
              kind: "shutdown",
            },
          ],
          whatWentWrong: {
            title: "What Went Wrong",
            summary:
              "Healthcare is a category where narrative expansion can outrun the underlying cash model. Babylon seems to have faced that problem in public.",
            bullets: [
              "Healthcare delivery economics likely proved harder to scale cleanly than the product story suggested.",
              "The business appeared exposed to the tension between platform ambitions and operator-level execution.",
              "Public-market expectations can punish unresolved complexity faster than private investors do.",
              "Growth across geographies and business lines may have increased operational drag.",
            ],
          },
          whatCouldHaveSavedIt: {
            title: "What Could Have Saved It",
            summary:
              "A narrower strategy with a clearer economic core may have improved resilience.",
            bullets: [
              "Concentrating on the strongest care model rather than broad platform breadth could have sharpened margins and accountability.",
              "A slower expansion path might have preserved flexibility and reduced execution noise.",
              "Earlier proof of sustainable unit economics would have strengthened credibility.",
              "More disciplined market selection may have limited reimbursement and operational complexity.",
            ],
          },
          lessonsForFounders: {
            title: "Lessons for Founders",
            summary:
              "In regulated sectors, good storytelling helps raise capital but cannot replace clean economics and reliable operating discipline.",
            bullets: [
              "Do not assume software-style scale dynamics apply unchanged in healthcare.",
              "Public listings amplify the cost of ambiguity around margins and governance.",
              "Expansion should follow proof that the underlying service model actually works.",
              "Category complexity belongs in the strategy memo from day one, not the post-mortem.",
            ],
          },
          observedFacts: [
            "Babylon Health operated in digital healthcare and telehealth.",
            "The company pursued a broad platform narrative around modern care delivery.",
            "It later faced severe financial and strategic pressure.",
          ],
          plausibleHypotheses: [
            "The company's strategic breadth may have obscured where durable value was really being created.",
            "Healthcare operating realities likely constrained the software-style scale story.",
            "Public-market exposure probably reduced tolerance for long-horizon complexity.",
          ],
          openQuestions: [
            "Which part of the business had the strongest standalone economics?",
            "How much did geographic sprawl contribute to execution drag?",
            "Could Babylon have survived as a narrower services business rather than a platform story?",
          ],
        },
      ),
  },
];

function buildGenericDemoAnalysis(
  target: CompanyTarget,
  contextNotes: string,
  generatedAt: string,
): PostMortemAnalysis {
  const notesFragment = contextNotes
    ? ` The reporter notes point toward ${contextNotes.toLowerCase()}.`
    : "";

  return withMeta(target, generatedAt, {
    overview: `Demo Mode is intentionally showing a sample editorial draft for ${target.displayName}, not a fact-checked live analysis.${notesFragment} The structure, formatting, and share/export flow are the same path used in live mode.`,
    timeline: [
      {
        dateLabel: "Founding phase",
        event:
          "A startup emerges around a strong narrative and an identifiable market problem.",
        kind: "founding",
      },
      {
        dateLabel: "Growth phase",
        event:
          "Capital, hiring, and public attention increase faster than certainty about the business model.",
        kind: "funding",
      },
      {
        dateLabel: "Stress phase",
        event:
          "Execution difficulty, competition, or market conditions expose the weakest assumptions in the company story.",
        kind: "market",
      },
      {
        dateLabel: "Outcome phase",
        event:
          "Leadership must choose between a reset, a narrower business, or a hard unwind.",
        kind: "shutdown",
      },
    ],
    whatWentWrong: {
      title: "What Went Wrong",
      summary:
        "In Demo Mode, this section demonstrates the product's editorial structure rather than asserting specific facts about the named company.",
      bullets: [
        "The original thesis may have scaled faster in narrative than in proof.",
        "Operating complexity can hide beneath early momentum.",
        "Once confidence breaks, capital becomes more expensive and recovery options shrink.",
        "Founders often discover too late that one weak assumption was carrying the whole system.",
      ],
    },
    whatCouldHaveSavedIt: {
      title: "What Could Have Saved It",
      summary:
        "The strongest save path in many post-mortems is earlier narrowing: fewer bets, clearer economics, and faster acknowledgement of what is not working.",
      bullets: [
        "A tighter product scope could have reduced noise.",
        "More disciplined milestones might have exposed fragility sooner.",
        "Lower burn would have bought time for learning.",
        "A more honest reset could have preserved strategic options.",
      ],
    },
    lessonsForFounders: {
      title: "Lessons for Founders",
      summary:
        "A convincing pitch is not the same as a repeatable business. The product should reward the team that interrogates its own assumptions early.",
      bullets: [
        "Interrogate the demand signal before scaling the organization.",
        "Make it easy for bad news to travel upward.",
        "Treat operational reliability as part of the product.",
        "Keep enough strategic slack to survive a thesis rewrite.",
      ],
    },
    observedFacts: [
      "Demo Mode is active because no live model is configured.",
      "This output is a product sample, not a researched verdict on the named company.",
      "The layout still matches the production contract and rendering path.",
    ],
    plausibleHypotheses: [
      "A real post-mortem would likely turn on one or two broken assumptions rather than a single dramatic event.",
      "Context notes would usually sharpen the failure modes worth testing first.",
      "In live mode, the overview would become more company-specific and evidence-aware.",
    ],
    openQuestions: [
      "Which assumption failed first: demand, timing, economics, or execution?",
      "What signals did leadership have before the decline became public?",
      "Would a narrower strategy have been enough, or was the category itself too hostile?",
    ],
  });
}

export function getDemoAnalysis(
  target: CompanyTarget,
  contextNotes: string,
  generatedAt: string,
) {
  const key = `${target.displayName.toLowerCase()} ${target.normalizedUrl ?? ""}`;
  const match = catalog.find((entry) =>
    entry.aliases.some((alias) => key.includes(alias)),
  );

  if (match) {
    return match.build(generatedAt);
  }

  return buildGenericDemoAnalysis(target, contextNotes, generatedAt);
}
