// Display settings for the backend's SkillLevel enum, shared by skill chips and task difficulty badges
export const SKILL_LEVELS = {
  BEGINNER: { label: "Beginner", tone: "sky" },
  INTERMEDIATE: { label: "Intermediate", tone: "amber" },
  ADVANCED: { label: "Advanced", tone: "fuchsia" },
};

export const SKILL_LEVEL_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

/** Label and Chip tone for a level, with a neutral fallback for unknown values. */
export function getSkillLevel(level) {
  return SKILL_LEVELS[level] ?? { label: level, tone: "neutral" };
}
