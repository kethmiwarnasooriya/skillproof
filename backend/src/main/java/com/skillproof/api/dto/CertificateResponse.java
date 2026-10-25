package com.skillproof.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class CertificateResponse {
    private Long id;
    private String url;
    private String courseName;
    private String issuer;
    private List<SkillResponse> skills;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
}
