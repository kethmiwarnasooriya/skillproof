import { useLocation, useSearchParams } from "react-router-dom";
import { analyzedOnly, useCertificates } from "./useCertificates";

/**
 * The certificate whose skills drive the task pages, chosen by the ?certificate=<id> query parameter.
 * A certificate handed over in router state (e.g. straight after analysis) renders instantly; the backend list is
 * the source of truth, so the page also works after a reload or from a bookmarked link.
 */
export function useSelectedCertificate() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { certificates, loading, error, reload } = useCertificates();

  const certificateId = searchParams.get("certificate");
  const analyzed = analyzedOnly(certificates);
  const handedOff = location.state?.certificate;
  const certificate =
    analyzed.find((c) => String(c.id) === certificateId)
    ?? (handedOff && String(handedOff.id) === certificateId && analyzedOnly([handedOff]).length ? handedOff : null);

  return { certificateId, certificate, analyzedCertificates: analyzed, loading: loading && !certificate, error, reload };
}
