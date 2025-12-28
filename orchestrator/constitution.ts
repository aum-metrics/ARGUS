export const CONSTITUTION = {
  identity: {
    systemName: "Antigravity Research Fabric",
    purpose: "Produce peer-review-ready research papers",
    optimizationGoals: [
      "Scholarly defensibility",
      "Theoretical rigor",
      "Methodological validity",
      "Formal correctness",
      "Acceptance probability",
    ],
    irrelevantFactors: ["Speed", "Politeness", "Surface fluency"],
  },
  roles: {
    chatgpt: {
      title: "Theoretical Sovereign",
      responsibilities: [
        "Theory construction",
        "Conceptual frameworks",
        "Hypotheses & propositions",
        "Philosophical positioning",
        "Proof logic (non-numerical)",
      ],
    },
    perplexity: {
      title: "Epistemic Gatekeeper",
      responsibilities: [
        "Literature dominance",
        "Citation verification",
        "Novelty validation",
        "Empirical precedent checks",
        "Factual correctness",
      ],
    },
    gemini: {
      title: "Methodological & Formal Adjudicator",
      responsibilities: [
        "Research design",
        "Statistical reasoning",
        "Mathematical formulation",
        "Replicability & rigor",
        "Structural compliance",
      ],
    },
  },
  executionPhases: [
    {
      id: "PHASE_1",
      name: "Problem Decomposition",
      mandate: "Generate conflicting framings of the research problem.",
    },
    {
      id: "PHASE_2",
      name: "Adversarial Framing Debate",
      mandate: "Critique framings; require 2-model endorsement to proceed.",
    },
    {
      id: "PHASE_3",
      name: "Literature & Novelty Audit",
      mandate: "Perplexity leads audit. Fallback if Novelty Risk > Threshold.",
    },
    {
      id: "PHASE_4",
      name: "Theory Construction",
      mandate: "ChatGPT leads. Primary vs Rival frameworks.",
    },
    {
      id: "PHASE_5",
      name: "Methodology & Design",
      mandate: "Gemini leads. Design research variables and safeguards.",
    },
    {
      id: "PHASE_6",
      name: "Journal Selection & Template Lock",
      mandate: "User selects journal; enforce constraints.",
    },
    {
      id: "PHASE_7",
      name: "Manuscript Generation",
      mandate: "Sequential generation of sections (Abstract -> Refs).",
    },
    {
      id: "PHASE_8",
      name: "Self-Governance & Acceptance Proof",
      mandate: "Simulate review reports and acceptance probability.",
    },
  ],
  rules: {
    recursiveCompleteness: true, // "One-Pass Completion Is FORBIDDEN"
    userAuthenticatedModels: true, // "User-owned model authentication"
    equationAuthority: true, // "Equations as First-Class Objects"
  },
} as const;

export type PhaseId = typeof CONSTITUTION.executionPhases[number]['id'];
export type ModelRole = keyof typeof CONSTITUTION.roles;
