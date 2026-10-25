import { useAsync } from "./useAsync";
import { getCertificates } from "../services/certificateApi";

/** The signed-in user's certificates from GET /api/certificates, newest first. */
export function useCertificates() {
  const { data, loading, error, reload } = useAsync(getCertificates);
  return { certificates: data ?? [], loading, error, reload };
}

/**
 * Only certificates whose skills were extracted successfully; these are the ones tasks can be built from.
 * @param {import("../services/certificateApi").Certificate[]} certificates
 */
export function analyzedOnly(certificates) {
  return certificates.filter((c) => c.status === "ANALYZED" && c.skills.length > 0);
}
