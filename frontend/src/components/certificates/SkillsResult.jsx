import { Alert, Chip, GlassCard } from "../common";
import { getSkillLevel } from "../../constants/skillLevels";

function SkillChip({ skill }) {
  const level = getSkillLevel(skill.level);
  return (
    <Chip as="li" tone={level.tone}>
      <span className="font-medium">{skill.name}</span>
      <span className="text-xs uppercase tracking-wide opacity-70">{level.label}</span>
    </Chip>
  );
}

/**
 * Course, issuer and extracted skills for one certificate (a CertificateResponse from the API).
 * Works on its own page or inside a list of certificates.
 * @param {{ certificate: import("../../services/certificateApi").Certificate, className?: string,
 *   children?: import("react").ReactNode }} props  children: optional actions shown under the skills
 */
export default function SkillsResult({ certificate, className = "", children }) {
  const failed = certificate.status === "FAILED";

  return (
    <GlassCard as="article" className={`sp-card rounded-3xl p-6 md:p-8 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">
        {failed ? "Analysis failed" : "Skills found"}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
        {certificate.courseName || "Unknown course"}
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        {certificate.issuer && <>Issued by <span className="text-slate-200">{certificate.issuer}</span> · </>}
        <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="break-all text-slate-400 hover:text-amber-300 hover:underline">
          View certificate
        </a>
      </p>

      {failed ? (
        <Alert className="mt-6">{certificate.errorMessage || "We couldn't analyse this certificate."}</Alert>
      ) : (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Skills">
          {certificate.skills.map((skill) => <SkillChip key={skill.id ?? skill.name} skill={skill} />)}
        </ul>
      )}
      {children && <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-800 pt-6">{children}</div>}
    </GlassCard>
  );
}
