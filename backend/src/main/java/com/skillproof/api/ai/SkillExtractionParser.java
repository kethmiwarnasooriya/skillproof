package com.skillproof.api.ai;

import com.skillproof.api.entity.SkillLevel;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

/** Turns the model's JSON answer into a validated CertificateAnalysis. */
@Component
public class SkillExtractionParser {

    static final int MAX_SKILLS = 12;
    static final int MAX_FIELD_LENGTH = 255;
    static final int MAX_SKILL_NAME_LENGTH = 100;

    private final ObjectMapper objectMapper;

    public SkillExtractionParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public CertificateAnalysis parse(String json) {
        JsonNode root = readJson(json);
        String courseName = requiredText(root, "courseName", MAX_FIELD_LENGTH);
        String issuer = requiredText(root, "issuer", MAX_FIELD_LENGTH);
        List<ExtractedSkill> skills = parseSkills(root.path("skills"));
        return new CertificateAnalysis(courseName, issuer, skills);
    }

    private JsonNode readJson(String json) {
        if (json == null || json.isBlank()) {
            throw new AiResponseParseException("AI response was empty");
        }
        try {
            JsonNode root = objectMapper.readTree(stripCodeFence(json));
            if (!root.isObject()) {
                throw new AiResponseParseException("AI response is not a JSON object");
            }
            return root;
        } catch (JacksonException e) {
            throw new AiResponseParseException("AI response is not valid JSON", e);
        }
    }

    private static String requiredText(JsonNode root, String field, int maxLength) {
        JsonNode node = root.path(field);
        if (!node.isString() || node.stringValue().isBlank()) {
            throw new AiResponseParseException("AI response is missing \"" + field + "\"");
        }
        return truncate(node.stringValue().strip(), maxLength);
    }

    private static List<ExtractedSkill> parseSkills(JsonNode skillsNode) {
        if (!skillsNode.isArray()) {
            throw new AiResponseParseException("AI response is missing the \"skills\" array");
        }
        List<ExtractedSkill> skills = new ArrayList<>();
        Set<String> seenNames = new HashSet<>();
        for (JsonNode skillNode : skillsNode) {
            parseSkill(skillNode)
                    .filter(skill -> seenNames.add(skill.name().toLowerCase(Locale.ROOT)))
                    .ifPresent(skills::add);
            if (skills.size() == MAX_SKILLS) {
                break;
            }
        }
        if (skills.isEmpty()) {
            throw new AiResponseParseException("AI response contains no valid skills");
        }
        return skills;
    }

    // Malformed individual entries are skipped rather than failing the whole answer
    private static Optional<ExtractedSkill> parseSkill(JsonNode skillNode) {
        JsonNode name = skillNode.path("name");
        if (!name.isString() || name.stringValue().isBlank()) {
            return Optional.empty();
        }
        return parseLevel(skillNode.path("level"))
                .map(level -> new ExtractedSkill(truncate(name.stringValue().strip(), MAX_SKILL_NAME_LENGTH), level));
    }

    private static Optional<SkillLevel> parseLevel(JsonNode levelNode) {
        if (!levelNode.isString()) {
            return Optional.empty();
        }
        try {
            return Optional.of(SkillLevel.valueOf(levelNode.stringValue().strip().toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    // Some models wrap JSON in ```json ... ``` even when told not to
    private static String stripCodeFence(String text) {
        String trimmed = text.strip();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }
        int firstNewline = trimmed.indexOf('\n');
        int closingFence = trimmed.lastIndexOf("```");
        if (firstNewline < 0 || closingFence <= firstNewline) {
            return trimmed;
        }
        return trimmed.substring(firstNewline + 1, closingFence).strip();
    }

    private static String truncate(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }
}
