import apiClient from "./apiClient";

/**
 * Shapes of the backend's CertificateResponse / SkillResponse.
 * @typedef {{ id: number, name: string, level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" }} Skill
 * @typedef {{ id: number, url: string, courseName: string | null, issuer: string | null, skills: Skill[],
 *   status: "PENDING" | "ANALYZED" | "FAILED", errorMessage: string | null, createdAt: string }} Certificate
 */

// The AI analysis runs inside this request, so allow far longer than a normal API call
const ANALYSIS_TIMEOUT_MS = 90_000;

/**
 * Sends a certificate URL (plus optional pasted text) for AI skill extraction.
 * @returns {Promise<Certificate>}
 */
export const submitCertificate = async ({ url, certificateText }) => {
  const payload = { url: url.trim() };
  if (certificateText?.trim()) payload.certificateText = certificateText.trim();

  const response = await apiClient.post("/certificates", payload, { timeout: ANALYSIS_TIMEOUT_MS });
  return response.data;
};

/**
 * Lists the logged-in user's certificates, newest first.
 * @returns {Promise<Certificate[]>}
 */
export const getCertificates = async () => {
  const response = await apiClient.get("/certificates");
  return response.data;
};
