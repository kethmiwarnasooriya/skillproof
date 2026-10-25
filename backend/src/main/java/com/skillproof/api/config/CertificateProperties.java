package com.skillproof.api.config;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

@Validated
@ConfigurationProperties(prefix = "app.certificates")
public record CertificateProperties(
        @Positive int maxSubmissionsPerHour,
        @Positive int maxTextLength,
        @Positive int minPageTextLength,
        @Positive int minPastedTextLength,
        @NotNull Duration fetchTimeout,
        @NotNull DataSize maxPageSize
) {
}
