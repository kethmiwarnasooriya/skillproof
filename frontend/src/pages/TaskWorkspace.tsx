import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Chip, GlassCard, Spinner } from "../components/common";
import { PageShell } from "../components/layout";
import EvidenceForm from "../components/tasks/EvidenceForm";
import EvidenceSummary from "../components/tasks/EvidenceSummary";
import { getSkillLevel } from "../constants/skillLevels";
import { useAsync } from "../hooks/useAsync";
import { useSelectedCertificate } from "../hooks/useSelectedCertificate";
import type { Certificate } from "../services/certificateApi";
import { getEvidenceByTask, getTask } from "../services/taskApi";

type Task = {
  id: string; certificateId: number; title: string; description: string; difficulty: string; isStretch: boolean;
  estimate: string; steps: string[]; deliverables: string[]; skill: { name: string };
};
type EvidenceRecord = Parameters<typeof EvidenceSummary>[0]["record"];

function TaskBrief({ task }: { task: Task }) {
  const difficulty = getSkillLevel(task.difficulty);
  return (
    <GlassCard as="article" className="sp-card sp-fade rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap gap-2">
        <Chip tone={difficulty.tone} className="text-xs">{difficulty.label}{task.isStretch && " · Stretch"}</Chip>
        <Chip className="text-xs">{task.skill.name}</Chip>
        <Chip className="text-xs">⏱ {task.estimate}</Chip>
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">{task.title}</h2>
      <p className="mt-3 leading-relaxed text-slate-300">{task.description}</p>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-amber-300">Steps</h3>
      <ol className="mt-3 space-y-3">
        {task.steps.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-300">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-300/15 text-xs font-semibold text-amber-300">{i + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-amber-300">What to submit</h3>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-300 marker:text-slate-600">
        {task.deliverables.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </GlassCard>
  );
}

function Workspace({ certificate, taskId }: { certificate: Certificate; taskId: string }) {
  const loadTask = useCallback(() => getTask(certificate, taskId) as Promise<Task | null>, [certificate, taskId]);
  const { data: task, loading, error } = useAsync(loadTask);
  const { data: evidence } = useAsync(getEvidenceByTask);
  // Newly submitted evidence, or null while the user is replacing an earlier submission
  const [submission, setSubmission] = useState<EvidenceRecord | null | undefined>(undefined);

  if (loading) return <div className="mt-16 flex justify-center text-slate-400"><Spinner className="h-6 w-6" /></div>;
  if (error) return <Alert className="mt-10">{error}</Alert>;
  if (!task) {
    return (
      <GlassCard className="mt-10 rounded-3xl p-8 text-center">
        <p className="text-slate-300">This task doesn't exist for that certificate.</p>
        <Button to={`/tasks?certificate=${certificate.id}`} className="mt-6 text-sm">Back to tasks</Button>
      </GlassCard>
    );
  }

  const record = submission === undefined ? (evidence?.[task.id] as EvidenceRecord | undefined) : submission;

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3"><TaskBrief task={task} /></div>
      <GlassCard
        as="section" aria-labelledby="evidence-heading"
        className="sp-fade h-fit rounded-3xl p-6 md:p-8 lg:sticky lg:top-28 lg:col-span-2" style={{ animationDelay: ".15s" }}
      >
        <h2 id="evidence-heading" className="text-lg font-semibold text-white">Your evidence</h2>
        <p className="mt-1 text-sm text-slate-400">Share your work once you've completed the steps.</p>
        <div className="mt-6">
          {record
            ? <EvidenceSummary record={record} onResubmit={() => setSubmission(null)} />
            : <EvidenceForm task={task} onSubmitted={setSubmission} />}
        </div>
      </GlassCard>
    </div>
  );
}

export default function TaskWorkspace() {
  const { taskId = "" } = useParams();
  const { certificateId, certificate, loading, error } = useSelectedCertificate();

  let content;
  if (loading) content = <div className="mt-16 flex justify-center text-slate-400"><Spinner className="h-6 w-6" /></div>;
  else if (error) content = <Alert className="mt-10">Couldn't load your certificates: {error}</Alert>;
  else if (!certificate) {
    content = (
      <GlassCard className="mt-10 rounded-3xl p-8 text-center">
        <p className="text-slate-300">We couldn't find the certificate for this task.</p>
        <Button to="/tasks" className="mt-6 text-sm">Go to Task Hub</Button>
      </GlassCard>
    );
  } else content = <Workspace key={taskId} certificate={certificate} taskId={taskId} />;

  return (
    <PageShell
      width="lg"
      back={{ to: certificateId ? `/tasks?certificate=${certificateId}` : "/tasks", label: "All tasks" }}
      title={certificate ? "Task workspace" : undefined}
      subtitle={certificate ? `From ${certificate.courseName}` : undefined}
    >
      {content}
    </PageShell>
  );
}
