import { Link } from "react-router-dom";
import { Chip, GlassCard } from "../common";
import { getSkillLevel } from "../../constants/skillLevels";

/**
 * Summary card for one task, linking to its workspace.
 * @param {{ task: { id: string, title: string, description: string, difficulty: string, isStretch: boolean,
 *   estimate: string, skill: { name: string } }, certificate: object, submitted?: boolean }} props
 */
export default function TaskCard({ task, certificate, submitted = false }) {
  const difficulty = getSkillLevel(task.difficulty);
  return (
    <GlassCard
      as={Link}
      to={`/tasks/${task.id}?certificate=${task.certificateId}`}
      state={{ certificate }}
      className="group flex h-full flex-col rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Chip tone={difficulty.tone} className="text-xs">{difficulty.label}{task.isStretch && " · Stretch"}</Chip>
        {submitted && <Chip tone="neutral" className="text-xs">✓ Submitted</Chip>}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug text-white">{task.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-400">{task.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs">
        <span className="min-w-0 truncate rounded-full bg-slate-800/70 px-2.5 py-1 text-slate-300" title={task.skill.name}>
          {task.skill.name}
        </span>
        <span className="shrink-0 text-slate-500">{task.estimate}</span>
      </div>
    </GlassCard>
  );
}
