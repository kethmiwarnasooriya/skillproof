package com.skillproof.api.exception;

/** The certificate page could not be read; the user can paste the certificate text instead. */
public class CertificateFetchException extends RuntimeException {
    public CertificateFetchException(String message) {
        super(message);
    }

    public CertificateFetchException(String message, Throwable cause) {
        super(message, cause);
    }
}
