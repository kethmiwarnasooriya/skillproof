package com.skillproof.api.service.impl;

import com.skillproof.api.ai.CertificateAnalysis;
import com.skillproof.api.config.CertificateProperties;
import com.skillproof.api.dto.CertificateRequest;
import com.skillproof.api.dto.CertificateResponse;
import com.skillproof.api.dto.SkillResponse;
import com.skillproof.api.entity.Certificate;
import com.skillproof.api.entity.CertificateSkill;
import com.skillproof.api.entity.User;
import com.skillproof.api.exception.AiServiceException;
import com.skillproof.api.exception.SubmissionLimitExceededException;
import com.skillproof.api.fetch.CertificatePageFetcher;
import com.skillproof.api.fetch.UrlSafetyValidator;
import com.skillproof.api.repository.CertificateRepository;
import com.skillproof.api.repository.UserRepository;
import com.skillproof.api.service.AiService;
import com.skillproof.api.service.CertificateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CertificateServiceImpl implements CertificateService {

    private static final Logger log = LoggerFactory.getLogger(CertificateServiceImpl.class);

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final UrlSafetyValidator urlSafetyValidator;
    private final CertificatePageFetcher pageFetcher;
    private final AiService aiService;
    private final CertificateProperties properties;

    public CertificateServiceImpl(CertificateRepository certificateRepository,
                                  UserRepository userRepository,
                                  UrlSafetyValidator urlSafetyValidator,
                                  CertificatePageFetcher pageFetcher,
                                  AiService aiService,
                                  CertificateProperties properties) {
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.urlSafetyValidator = urlSafetyValidator;
        this.pageFetcher = pageFetcher;
        this.aiService = aiService;
        this.properties = properties;
    }

    @Override
    public CertificateResponse submit(String userEmail, CertificateRequest request) {
        User user = findUser(userEmail);
        URI url = urlSafetyValidator.validate(request.getUrl());
        checkSubmissionLimit(user);

        // Fetch before saving: a fetch failure costs nothing and should not count against the limit
        String certificateText = resolveCertificateText(url, request.getCertificateText());

        Certificate certificate = certificateRepository.save(new Certificate(user, url.toString()));
        log.info("Analysing certificate id={} for user id={} (text length {})",
                certificate.getId(), user.getId(), certificateText.length());

        try {
            CertificateAnalysis analysis = aiService.extractSkills(url.toString(), certificateText);
            certificate.markAnalyzed(analysis.courseName(), analysis.issuer(), toSkillEntities(analysis));
        } catch (AiServiceException e) {
            certificate.markFailed("Analysis failed: " + describe(e.getReason()));
            certificateRepository.save(certificate);
            throw e;
        }
        return toResponse(certificateRepository.save(certificate));
    }

    @Override
    public List<CertificateResponse> listForUser(String userEmail) {
        User user = findUser(userEmail);
        return certificateRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(CertificateServiceImpl::toResponse)
                .toList();
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private void checkSubmissionLimit(User user) {
        long recentSubmissions = certificateRepository.countByUserIdAndCreatedAtAfter(
                user.getId(), LocalDateTime.now().minusHours(1));
        if (recentSubmissions >= properties.maxSubmissionsPerHour()) {
            throw new SubmissionLimitExceededException("You can analyse up to " + properties.maxSubmissionsPerHour()
                    + " certificates per hour. Please try again later.");
        }
    }

    /** Pasted text wins over fetching, since users paste it precisely when the page can't be read. */
    private String resolveCertificateText(URI url, String pastedText) {
        if (pastedText != null && !pastedText.isBlank()) {
            String normalized = normalizeWhitespace(pastedText);
            if (normalized.length() < properties.minPastedTextLength()) {
                throw new IllegalArgumentException("Pasted certificate text must be at least "
                        + properties.minPastedTextLength() + " characters.");
            }
            return truncate(normalized);
        }
        return truncate(pageFetcher.fetchText(url));
    }

    // Caps prompt size (and so cost); course name, issuer and main skills are near the top of the page
    private String truncate(String text) {
        return text.length() <= properties.maxTextLength() ? text : text.substring(0, properties.maxTextLength());
    }

    private static String normalizeWhitespace(String text) {
        return text.replaceAll("\\s+", " ").strip();
    }

    private static List<CertificateSkill> toSkillEntities(CertificateAnalysis analysis) {
        return analysis.skills().stream()
                .map(skill -> new CertificateSkill(skill.name(), skill.level()))
                .toList();
    }

    private static String describe(AiServiceException.Reason reason) {
        return switch (reason) {
            case INVALID_RESPONSE -> "the AI could not extract skills from this certificate.";
            case TIMEOUT -> "the AI took too long to respond.";
            case RATE_LIMITED -> "the AI service was busy.";
            default -> "the AI service was unavailable.";
        };
    }

    private static CertificateResponse toResponse(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .url(certificate.getUrl())
                .courseName(certificate.getCourseName())
                .issuer(certificate.getIssuer())
                .skills(certificate.getSkills().stream()
                        .map(skill -> new SkillResponse(skill.getId(), skill.getName(), skill.getLevel().name()))
                        .toList())
                .status(certificate.getStatus().name())
                .errorMessage(certificate.getErrorMessage())
                .createdAt(certificate.getCreatedAt())
                .build();
    }
}
