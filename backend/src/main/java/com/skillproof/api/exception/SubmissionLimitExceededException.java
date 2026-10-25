package com.skillproof.api.exception;

public class SubmissionLimitExceededException extends RuntimeException {
    public SubmissionLimitExceededException(String message) {
        super(message);
    }
}
