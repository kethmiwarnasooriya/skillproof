import { SKILL_LEVEL_ORDER } from "../constants/skillLevels";

// Starter task templates per difficulty. Each skill gets a task at its own level plus a stretch task one level up.
// Replaced by AI-generated tasks once the backend task endpoint exists (see taskApi.js).
const TEMPLATES = {
  BEGINNER: {
    estimate: "2-4 hours",
    title: (skill) => `Starter exercise: ${skill}`,
    description: (skill) =>
      `Build a small, self-contained exercise that shows you can apply ${skill}. Keep the scope to one feature you can finish in an afternoon, and document what you did.`,
    steps: (skill) => [
      `Pick one realistic use case for ${skill} and write it down in a sentence.`,
      "Create a new repository with a README that explains the goal.",
      `Implement the smallest working version that uses ${skill}.`,
      "Add a short section to the README on how to run it and what you learned.",
    ],
  },
  INTERMEDIATE: {
    estimate: "4-8 hours",
    title: (skill) => `Practical project: ${skill}`,
    description: (skill) =>
      `Use ${skill} to build a small but complete feature, the way you would at work: handle edge cases, add tests and make it easy for someone else to run.`,
    steps: (skill) => [
      `Define a feature that relies on ${skill} and list its acceptance criteria.`,
      "Implement it with clear structure and meaningful names.",
      "Handle at least two edge cases or failure modes explicitly.",
      "Add automated tests for the main path and the edge cases.",
      "Deploy it or record a short demo if the project allows it.",
    ],
  },
  ADVANCED: {
    estimate: "1-2 days",
    title: (skill) => `Production challenge: ${skill}`,
    description: (skill) =>
      `Apply ${skill} to a problem with real constraints: performance, security or scale. Explain the trade-offs you made and how you verified the result.`,
    steps: (skill) => [
      `Choose a non-trivial problem where ${skill} matters, and describe the constraints.`,
      "Design the solution and record the key trade-offs in the README.",
      "Implement it with tests, logging and error handling.",
      "Measure or demonstrate that it meets the constraints (benchmarks, load test or security checks).",
      "Write a short retrospective: what you would change next time.",
    ],
  },
};

const DELIVERABLES = [
  "A public repository (GitHub or similar) with your code",
  "A README explaining the goal, how to run it and your decisions",
  "Optional: a live demo link and screenshots of the result",
];

function nextLevel(level) {
  return SKILL_LEVEL_ORDER[SKILL_LEVEL_ORDER.indexOf(level) + 1];
}

function buildTask(certificate, skill, difficulty, isStretch) {
  const template = TEMPLATES[difficulty];
  return {
    // Stable id so links, filters and saved evidence keep pointing at the same task
    id: `c${certificate.id}-s${skill.id}-${difficulty.toLowerCase()}`,
    certificateId: certificate.id,
    skill: { id: skill.id, name: skill.name, level: skill.level },
    difficulty,
    isStretch,
    estimate: template.estimate,
    title: template.title(skill.name),
    description: template.description(skill.name),
    steps: template.steps(skill.name),
    deliverables: DELIVERABLES,
  };
}

/** Tasks for every skill extracted from a certificate. */
export function buildTasksForCertificate(certificate) {
  return certificate.skills.flatMap((skill) => {
    const stretch = nextLevel(skill.level);
    const tasks = TEMPLATES[skill.level] ? [buildTask(certificate, skill, skill.level, false)] : [];
    if (stretch) tasks.push(buildTask(certificate, skill, stretch, true));
    return tasks;
  });
}
