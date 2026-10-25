package com.skillproof.api.ai;

import java.util.List;

/** Validated result of the skill-extraction prompt. */
public record CertificateAnalysis(String courseName, String issuer, List<ExtractedSkill> skills) {
}
