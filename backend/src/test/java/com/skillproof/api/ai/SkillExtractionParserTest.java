package com.skillproof.api.ai;

import com.skillproof.api.entity.SkillLevel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import tools.jackson.databind.json.JsonMapper;

import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SkillExtractionParserTest {

    private final SkillExtractionParser parser = new SkillExtractionParser(JsonMapper.builder().build());

    @Test
    void parsesValidResponse() {
        CertificateAnalysis analysis = parser.parse("""
                {"courseName": "Spring Boot Fundamentals", "issuer": "VMware via Coursera",
                 "skills": [
                   {"name": "Building REST APIs with Spring Boot", "level": "INTERMEDIATE"},
                   {"name": "Spring Data JPA repositories", "level": "BEGINNER"}
                 ]}
                """);

        assertThat(analysis.courseName()).isEqualTo("Spring Boot Fundamentals");
        assertThat(analysis.issuer()).isEqualTo("VMware via Coursera");
        assertThat(analysis.skills()).containsExactly(
                new ExtractedSkill("Building REST APIs with Spring Boot", SkillLevel.INTERMEDIATE),
                new ExtractedSkill("Spring Data JPA repositories", SkillLevel.BEGINNER));
    }

    @Test
    void trimsValuesAndAcceptsLowercaseLevels() {
        CertificateAnalysis analysis = parser.parse("""
                {"courseName": "  SQL Basics ", "issuer": " Udemy ", "skills": [{"name": " Joins ", "level": "advanced"}]}
                """);

        assertThat(analysis.courseName()).isEqualTo("SQL Basics");
        assertThat(analysis.issuer()).isEqualTo("Udemy");
        assertThat(analysis.skills()).containsExactly(new ExtractedSkill("Joins", SkillLevel.ADVANCED));
    }

    @Test
    void stripsMarkdownCodeFence() {
        CertificateAnalysis analysis = parser.parse("""
                ```json
                {"courseName": "Docker", "issuer": "IBM", "skills": [{"name": "Writing Dockerfiles", "level": "BEGINNER"}]}
                ```
                """);

        assertThat(analysis.courseName()).isEqualTo("Docker");
    }

    @Test
    void skipsInvalidSkillsAndDuplicates() {
        CertificateAnalysis analysis = parser.parse("""
                {"courseName": "Python", "issuer": "Google", "skills": [
                  {"name": "Writing Python scripts", "level": "BEGINNER"},
                  {"name": "writing python scripts", "level": "ADVANCED"},
                  {"name": "", "level": "BEGINNER"},
                  {"name": "Unit testing with pytest", "level": "EXPERT"},
                  {"level": "BEGINNER"},
                  "not an object",
                  {"name": "Regular expressions", "level": "INTERMEDIATE"}
                ]}
                """);

        assertThat(analysis.skills()).extracting(ExtractedSkill::name)
                .containsExactly("Writing Python scripts", "Regular expressions");
    }

    @Test
    void capsNumberOfSkills() {
        String skills = IntStream.rangeClosed(1, 20)
                .mapToObj(i -> "{\"name\": \"Skill " + i + "\", \"level\": \"BEGINNER\"}")
                .collect(Collectors.joining(","));

        CertificateAnalysis analysis = parser.parse(
                "{\"courseName\": \"Big course\", \"issuer\": \"X\", \"skills\": [" + skills + "]}");

        assertThat(analysis.skills()).hasSize(SkillExtractionParser.MAX_SKILLS);
    }

    @Test
    void truncatesOverlongSkillNames() {
        String longName = "a".repeat(300);

        CertificateAnalysis analysis = parser.parse(
                "{\"courseName\": \"C\", \"issuer\": \"I\", \"skills\": [{\"name\": \"" + longName + "\", \"level\": \"BEGINNER\"}]}");

        assertThat(analysis.skills().getFirst().name()).hasSize(SkillExtractionParser.MAX_SKILL_NAME_LENGTH);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "",
            "   ",
            "not json at all",
            "{\"courseName\": \"Unclosed\"",
            "[1, 2, 3]",
            "\"just a string\""
    })
    void rejectsNonObjectOrBrokenJson(String response) {
        assertThatThrownBy(() -> parser.parse(response)).isInstanceOf(AiResponseParseException.class);
    }

    @Test
    void rejectsNull() {
        assertThatThrownBy(() -> parser.parse(null)).isInstanceOf(AiResponseParseException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"issuer\": \"X\", \"skills\": [{\"name\": \"S\", \"level\": \"BEGINNER\"}]}",
            "{\"courseName\": \"  \", \"issuer\": \"X\", \"skills\": [{\"name\": \"S\", \"level\": \"BEGINNER\"}]}",
            "{\"courseName\": 42, \"issuer\": \"X\", \"skills\": [{\"name\": \"S\", \"level\": \"BEGINNER\"}]}",
            "{\"courseName\": \"C\", \"skills\": [{\"name\": \"S\", \"level\": \"BEGINNER\"}]}"
    })
    void rejectsMissingRequiredText(String response) {
        assertThatThrownBy(() -> parser.parse(response))
                .isInstanceOf(AiResponseParseException.class)
                .hasMessageContaining("missing");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"courseName\": \"C\", \"issuer\": \"I\"}",
            "{\"courseName\": \"C\", \"issuer\": \"I\", \"skills\": \"Java\"}",
            "{\"courseName\": \"C\", \"issuer\": \"I\", \"skills\": []}",
            "{\"courseName\": \"C\", \"issuer\": \"I\", \"skills\": [{\"name\": \"S\", \"level\": \"GURU\"}]}"
    })
    void rejectsMissingOrEmptySkills(String response) {
        assertThatThrownBy(() -> parser.parse(response)).isInstanceOf(AiResponseParseException.class);
    }
}
