package com.skillproof.api.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "openai")
public record OpenAiProperties(
        @NotBlank(message = "OPENAI_API_KEY environment variable is not set") String apiKey,
        @NotBlank String model,
        @NotBlank String baseUrl,
        @NotNull Duration connectTimeout,
        @NotNull Duration readTimeout,
        @Positive int maxCompletionTokens
) {
    // Records print every field by default; keep the key out of logs and error messages
    @Override
    public String toString() {
        return "OpenAiProperties[model=" + model + ", baseUrl=" + baseUrl + ", apiKey=****]";
    }
}
