import { Avatar, Button, GlassCard, Spinner } from "../components/common";
import { PageShell } from "../components/layout";
import FeatureCard from "../components/dashboard/FeatureCard";
import { DASHBOARD_MODULES } from "../constants/content";
import { useAsync } from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";
import { analyzedOnly, useCertificates } from "../hooks/useCertificates";
import { getEvidenceByTask } from "../services/taskApi";

const RECENT_LIMIT = 3;

function firstName(fullName = "") {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function StatTile({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <GlassCard className="rounded-2xl px-5 py-4">
      <p className="text-3xl font-bold text-white">{loading ? <Spinner className="h-6 w-6 text-slate-500" /> : value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </GlassCard>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { certificates, loading, error } = useCertificates();
  const { data: evidence } = useAsync(getEvidenceByTask);

  const analyzed = analyzedOnly(certificates);
  const skillCount = analyzed.reduce((total, c) => total + c.skills.length, 0);
  const recent = analyzed.slice(0, RECENT_LIMIT);

  return (
    <PageShell width="lg">
      <section className="flex flex-col gap-6 md:flex-row md:items-center">
        <Avatar name={user?.fullName} size="lg" className="sp-fade" />
        <div>
          <p className="sp-fade text-sm font-semibold uppercase tracking-widest text-amber-300">Your dashboard</p>
          <h1 className="sp-fade mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl" style={{ animationDelay: ".1s" }}>
            Welcome back, {firstName(user?.fullName)}
          </h1>
          <p className="sp-fade mt-3 max-w-xl text-slate-400" style={{ animationDelay: ".2s" }}>
            Turn a certificate into skills, then prove each skill with a hands-on task.
          </p>
        </div>
      </section>

      <section aria-label="Your progress" className="sp-fade mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ animationDelay: ".3s" }}>
        <StatTile label="Certificates analysed" value={analyzed.length} loading={loading} />
        <StatTile label="Skills extracted" value={skillCount} loading={loading} />
        <StatTile label="Tasks submitted" value={Object.keys(evidence ?? {}).length} loading={!evidence} />
      </section>
      {error && <p className="mt-3 text-sm text-red-400">Couldn't load your certificates: {error}</p>}

      <section aria-labelledby="modules-heading" className="mt-14">
        <h2 id="modules-heading" className="text-xl font-semibold text-white">What would you like to do?</h2>
        <ul className="mt-6 grid gap-5 md:grid-cols-2">
          {DASHBOARD_MODULES.map((module, i) => (
            <li key={module.id}>
              <FeatureCard module={module} style={{ animationDelay: `${0.35 + i * 0.08}s` }} />
            </li>
          ))}
        </ul>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading" className="mt-14">
          <h2 id="recent-heading" className="text-xl font-semibold text-white">Recent certificates</h2>
          <ul className="mt-6 space-y-3">
            {recent.map((certificate) => (
              <GlassCard as="li" key={certificate.id} className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{certificate.courseName}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {certificate.issuer} · {certificate.skills.length} skills
                  </p>
                </div>
                <Button to={`/tasks?certificate=${certificate.id}`} state={{ certificate }} variant="outline" size="sm" className="shrink-0">
                  View tasks
                </Button>
              </GlassCard>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
