package com.skillproof.api.exception;

/** A failed call to the AI provider. The reason decides the HTTP status returned to the client. */
public class AiServiceException extends RuntimeException {

    public enum Reason {
        AUTHENTICATION,
        QUOTA_EXCEEDED,
        RATE_LIMITED,
        TIMEOUT,
        UNAVAILABLE,
        INVALID_RESPONSE
    }

    private final Reason reason;

    public AiServiceException(Reason reason, String message) {
        super(message);
        this.reason = reason;
    }

    public AiServiceException(Reason reason, String message, Throwable cause) {
        super(message, cause);
        this.reason = reason;
    }

    public Reason getReason() {
        return reason;
    }
}
