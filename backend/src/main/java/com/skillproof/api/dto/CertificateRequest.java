package com.skillproof.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CertificateRequest {
    @NotBlank(message = "Certificate URL is required")
    @Size(max = 2048, message = "Certificate URL is too long")
    private String url;

    // Optional fallback when the page can't be fetched (JavaScript-rendered or bot-blocking sites)
    @Size(max = 20000, message = "Certificate text must be at most 20000 characters")
    private String certificateText;
}
