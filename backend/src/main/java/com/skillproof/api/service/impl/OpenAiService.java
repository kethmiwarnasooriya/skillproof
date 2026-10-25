package com.skillproof.api.service.impl;

import com.skillproof.api.ai.AiResponseParseException;
import com.skillproof.api.ai.CertificateAnalysis;
import com.skillproof.api.ai.Prompt;
import com.skillproof.api.ai.PromptTemplates;
import com.skillproof.api.ai.SkillExtractionParser;
import com.skillproof.api.config.OpenAiProperties;
import com.skillproof.api.exception.AiServiceException;
import com.skillproof.api.exception.AiServiceException.Reason;
import com.skillproof.api.service.AiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;

import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/** AiService backed by the OpenAI Chat Completions API. */
@Service
public class OpenAiService implements AiService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);

    private static final String CHAT_COMPLETIONS_PATH = "/chat/completions";
    private static final int MAX_PARSE_ATTEMPTS = 2;
    // Stops certificate text from closing the <certificate> data block in the prompt early
    private static final Pattern DATA_TAG = Pattern.compile("</?certificate>", Pattern.CASE_INSENSITIVE);

    private final RestClient openAiRestClient;
    private final OpenAiProperties properties;
    private final PromptTemplates promptTemplates;
    private final SkillExtractionParser skillExtractionParser;

    public OpenAiService(RestClient openAiRestClient,
                         OpenAiProperties properties,
                         PromptTemplates promptTemplates,
                         SkillExtractionParser skillExtractionParser) {
        this.openAiRestClient = openAiRestClient;
        this.properties = properties;
        this.promptTemplates = promptTemplates;
        this.skillExtractionParser = skillExtractionParser;
    }

    @Override
    public CertificateAnalysis extractSkills(String sourceUrl, String certificateText) {
        Prompt prompt = promptTemplates.render(PromptTemplates.SKILL_EXTRACTION, Map.of(
                "certificate_url", sanitize(sourceUrl),
                "certificate_text", sanitize(certificateText)));

        // Retry once on an unusable answer; provider errors (401, 429, timeouts) are not retried
        for (int attempt = 1; attempt <= MAX_PARSE_ATTEMPTS; attempt++) {
            try {
                return skillExtractionParser.parse(complete(prompt));
            } catch (AiResponseParseException e) {
                log.warn("Skill extraction attempt {}/{} returned an unusable answer: {}",
                        attempt, MAX_PARSE_ATTEMPTS, e.getMessage());
            }
        }
        throw new AiServiceException(Reason.INVALID_RESPONSE,
                "AI returned an unusable answer after " + MAX_PARSE_ATTEMPTS + " attempts");
    }

    /** Sends one chat completion request in JSON mode and returns the message content. */
    private String complete(Prompt prompt) {
        Map<String, Object> body = Map.of(
                "model", properties.model(),
                "messages", List.of(
                        Map.of("role", "system", "content", prompt.system()),
                        Map.of("role", "user", "content", prompt.user())),
                "response_format", Map.of("type", "json_object"),
                "max_completion_tokens", properties.maxCompletionTokens());

        JsonNode response;
        try {
            response = openAiRestClient.post()
                    .uri(CHAT_COMPLETIONS_PATH)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);
        } catch (RestClientResponseException e) {
            throw fromErrorResponse(e);
        } catch (ResourceAccessException e) {
            throw fromNetworkError(e);
        } catch (RestClientException e) {
            throw new AiServiceException(Reason.UNAVAILABLE, "Unexpected response from OpenAI", e);
        }
        return messageContent(response);
    }

    private static String messageContent(JsonNode response) {
        if (response == null) {
            throw new AiResponseParseException("OpenAI returned an empty body");
        }
        JsonNode message = response.path("choices").path(0).path("message");
        if (message.path("refusal").isString()) {
            throw new AiResponseParseException("Model refused the request");
        }
        JsonNode content = message.path("content");
        if (!content.isString()) {
            throw new AiResponseParseException("OpenAI response has no message content");
        }
        return content.stringValue();
    }

    private static AiServiceException fromErrorResponse(RestClientResponseException e) {
        HttpStatusCode status = e.getStatusCode();
        String detail = "OpenAI returned HTTP " + status.value();
        log.warn("{}: {}", detail, openAiErrorType(e));

        if (status.value() == 401 || status.value() == 403) {
            return new AiServiceException(Reason.AUTHENTICATION, detail + " (check OPENAI_API_KEY)", e);
        }
        if (status.value() == 429) {
            // OpenAI uses 429 both for short-term rate limits and for an exhausted billing quota
            Reason reason = "insufficient_quota".equals(openAiErrorType(e)) ? Reason.QUOTA_EXCEEDED : Reason.RATE_LIMITED;
            return new AiServiceException(reason, detail, e);
        }
        return new AiServiceException(Reason.UNAVAILABLE, detail, e);
    }

    private static AiServiceException fromNetworkError(ResourceAccessException e) {
        Throwable cause = e.getCause();
        if (cause instanceof SocketTimeoutException || cause instanceof HttpTimeoutException) {
            return new AiServiceException(Reason.TIMEOUT, "OpenAI request timed out", e);
        }
        return new AiServiceException(Reason.UNAVAILABLE, "Could not reach OpenAI", e);
    }

    // OpenAI error bodies look like {"error": {"type": "...", "code": "...", "message": "..."}}
    private static String openAiErrorType(RestClientResponseException e) {
        try {
            JsonNode error = e.getResponseBodyAs(JsonNode.class);
            if (error == null) {
                return "unknown";
            }
            JsonNode code = error.path("error").path("code");
            return code.isString() ? code.stringValue() : error.path("error").path("type").asString("unknown");
        } catch (RuntimeException parseFailure) {
            return "unknown";
        }
    }

    private static String sanitize(String value) {
        return value == null ? "" : DATA_TAG.matcher(value).replaceAll("");
    }
}
