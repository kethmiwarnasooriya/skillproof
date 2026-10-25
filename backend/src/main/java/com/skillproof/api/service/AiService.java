package com.skillproof.api.service;

import com.skillproof.api.ai.CertificateAnalysis;

/**
 * Every AI feature is one method here, backed by its own prompt file in resources/prompts/.
 * Planned: task generation by difficulty, evidence evaluation.
 */
public interface AiService {
    CertificateAnalysis extractSkills(String sourceUrl, String certificateText);
}
