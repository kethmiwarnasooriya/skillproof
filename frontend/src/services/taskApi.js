import { buildTasksForCertificate } from "./taskCatalog";
import { loadSession } from "./session";

/*
 * Task and evidence API used by the Task Hub pages.
 *
 * There is no backend for tasks or evidence yet, so for now:
 *  - tasks come from a local starter catalog built from the certificate's extracted skills;
 *  - submitted evidence is saved in this browser (file names only, not file contents).
 * When the backend endpoints exist, replace the bodies of these functions with apiClient calls
 * (e.g. GET /api/certificates/{id}/tasks, multipart POST /api/tasks/{id}/evidence). Pages only use this module.
 */

/**
 * @typedef {{ taskId: string, certificateId: number, repoUrl: string, demoUrl: string | null, notes: string | null,
 *   files: { name: string, size: number, type: string }[], status: "AWAITING_REVIEW", submittedAt: string }} EvidenceRecord
 */

const EVIDENCE_KEY_PREFIX = "skillproof.evidence.";

function evidenceStorageKey() {
  // Per user, so two people sharing a browser don't see each other's submissions
  return EVIDENCE_KEY_PREFIX + (loadSession()?.id ?? "anonymous");
}

function readEvidence() {
  try {
    return JSON.parse(localStorage.getItem(evidenceStorageKey())) ?? {};
  } catch {
    return {};
  }
}

function writeEvidence(all) {
  try {
    localStorage.setItem(evidenceStorageKey(), JSON.stringify(all));
  } catch {
    throw new Error("Couldn't save your submission in this browser. Check that site storage is allowed.");
  }
}

/** All tasks for an analyzed certificate. */
export async function getTasksForCertificate(certificate) {
  return buildTasksForCertificate(certificate);
}

/** One task of a certificate, or null if the id doesn't belong to it. */
export async function getTask(certificate, taskId) {
  return buildTasksForCertificate(certificate).find((task) => task.id === taskId) ?? null;
}

/**
 * Saved evidence for every task, keyed by task id.
 * @returns {Promise<Record<string, EvidenceRecord>>}
 */
export async function getEvidenceByTask() {
  return readEvidence();
}

/**
 * Records evidence for a task and marks it as awaiting verification.
 * @param {{ id: string, certificateId: number }} task
 * @param {{ repoUrl: string, demoUrl?: string, notes?: string, files: File[] }} evidence
 * @returns {Promise<EvidenceRecord>}
 */
export async function submitEvidence(task, { repoUrl, demoUrl, notes, files }) {
  const record = {
    taskId: task.id,
    certificateId: task.certificateId,
    repoUrl: repoUrl.trim(),
    demoUrl: demoUrl?.trim() || null,
    notes: notes?.trim() || null,
    files: files.map((file) => ({ name: file.name, size: file.size, type: file.type })),
    status: "AWAITING_REVIEW",
    submittedAt: new Date().toISOString(),
  };
  writeEvidence({ ...readEvidence(), [task.id]: record });
  return record;
}
