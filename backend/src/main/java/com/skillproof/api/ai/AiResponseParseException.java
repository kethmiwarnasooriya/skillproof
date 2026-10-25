package com.skillproof.api.ai;

/** The model answered, but not with usable JSON. Internal to the AI layer; triggers a retry. */
public class AiResponseParseException extends RuntimeException {
    public AiResponseParseException(String message) {
        super(message);
    }

    public AiResponseParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
