import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, GlassCard, Spinner } from "../components/common";
import { PageShell } from "../components/layout";
import TaskCard from "../components/tasks/TaskCard";
import { SKILL_LEVEL_ORDER, getSkillLevel } from "../constants/skillLevels";
import { useAsync } from "../hooks/useAsync";
import { useSelectedCertificate } from "../hooks/useSelectedCertificate";
import type { Certificate } from "../services/certificateApi";
import { getEvidenceByTask, getTasksForCertificate } from "../services/taskApi";

const ALL = "ALL";

type Task = Parameters<typeof TaskCard>[0]["task"] & { id: string; skill: { id: number; name: string } };

function FilterChips({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (value: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value} type="button" aria-pressed={active} onClick={() => onChange(option.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50 ${
              active ? "border-amber-300/60 bg-amber-300/15 text-amber-200" : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function CertificatePicker({ certificates }: { certificates: Certificate[] }) {
  if (certificates.length === 0) {
    return (
      <GlassCard className="sp-card mt-10 rounded-3xl p-8 text-center">
        <h2 className="text-xl font-semibold text-white">No skills to practise yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          Tasks are built from the skills in your certificates. Submit a certificate first.
        </p>
        <Button to="/certificates/new" className="mt-6 text-sm">Submit a certificate</Button>
      </GlassCard>
    );
  }
  return (
    <section aria-labelledby="pick-heading" className="mt-10">
      <h2 id="pick-heading" className="text-lg font-semibold text-white">Choose a certificate</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {certificates.map((certificate) => (
          <li key={certificate.id}>
            <GlassCard
              as={Link} to={`/tasks?certificate=${certificate.id}`} state={{ certificate }}
              className="block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:border-amber-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
            >
              <p className="font-semibold text-white">{certificate.courseName}</p>
              <p className="mt-1 text-sm text-slate-400">{certificate.issuer} · {certificate.skills.length} skills</p>
            </GlassCard>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TaskBoard({ certificate }: { certificate: Certificate }) {
  const [skillFilter, setSkillFilter] = useState(ALL);
  const [difficultyFilter, setDifficultyFilter] = useState(ALL);
  const loadTasks = useCallback(() => getTasksForCertificate(certificate) as Promise<Task[]>, [certificate]);
  const { data: tasks, loading, error } = useAsync(loadTasks);
  const { data: evidence } = useAsync(getEvidenceByTask);

  const visible = (tasks ?? []).filter((task) =>
    (skillFilter === ALL || String(task.skill.id) === skillFilter)
    && (difficultyFilter === ALL || task.difficulty === difficultyFilter));

  return (
    <>
      <GlassCard className="sp-card sp-fade mt-10 flex flex-col gap-4 rounded-3xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Tasks for</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">{certificate.courseName}</h2>
          <p className="mt-1 text-sm text-slate-400">{certificate.issuer} · {certificate.skills.length} skills</p>
        </div>
        <Link to="/tasks" className="shrink-0 text-sm font-medium text-amber-300 hover:text-amber-200 hover:underline">
          Change certificate
        </Link>
      </GlassCard>

      <div className="mt-8 space-y-3">
        <FilterChips
          label="Filter by skill" value={skillFilter} onChange={setSkillFilter}
          options={[{ value: ALL, label: "All skills" }, ...certificate.skills.map((s) => ({ value: String(s.id), label: s.name }))]}
        />
        <FilterChips
          label="Filter by difficulty" value={difficultyFilter} onChange={setDifficultyFilter}
          options={[{ value: ALL, label: "Any difficulty" }, ...SKILL_LEVEL_ORDER.map((l) => ({ value: l, label: getSkillLevel(l).label }))]}
        />
      </div>

      {error && <Alert className="mt-8">{error}</Alert>}
      {loading ? (
        <div className="mt-12 flex justify-center text-slate-400"><Spinner className="h-6 w-6" /></div>
      ) : (
        <>
          <p className="mt-8 text-sm text-slate-500" aria-live="polite">{visible.length} of {tasks?.length ?? 0} tasks</p>
          {visible.length === 0 ? (
            <p className="mt-6 text-slate-400">No tasks match these filters.</p>
          ) : (
            <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((task) => (
                <li key={task.id}>
                  <TaskCard task={task} certificate={certificate} submitted={Boolean(evidence?.[task.id])} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export default function TaskHub() {
  const { certificateId, certificate, analyzedCertificates, loading, error } = useSelectedCertificate();

  let content;
  if (loading) content = <div className="mt-16 flex justify-center text-slate-400"><Spinner className="h-6 w-6" /></div>;
  else if (error) content = <Alert className="mt-10">Couldn't load your certificates: {error}</Alert>;
  else if (certificate) content = <TaskBoard key={certificate.id} certificate={certificate} />;
  else {
    content = (
      <>
        {certificateId && <Alert className="mt-10">That certificate wasn't found or has no extracted skills. Pick another one below.</Alert>}
        <CertificatePicker certificates={analyzedCertificates} />
      </>
    );
  }

  return (
    <PageShell
      width="lg"
      back={{ to: "/dashboard", label: "Dashboard" }}
      title="AI Task Hub"
      subtitle="Pick a hands-on task for one of your skills, build it, then submit your evidence for review."
    >
      {content}
    </PageShell>
  );
}
