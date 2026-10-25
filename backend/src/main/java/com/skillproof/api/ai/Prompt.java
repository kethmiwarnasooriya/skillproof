package com.skillproof.api.ai;

/** A rendered prompt: fixed instructions (system) kept apart from untrusted data (user). */
public record Prompt(String system, String user) {
}
