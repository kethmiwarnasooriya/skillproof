package com.skillproof.api.ai;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Loads prompt files from classpath:prompts/ at startup.
 * Each file has a "[system]" section and a "[user]" section; {{name}} placeholders are filled at render time.
 * To add a prompt (e.g. task generation), add its file and its name to PROMPT_NAMES.
 */
@Component
public class PromptTemplates {

    public static final String SKILL_EXTRACTION = "skill-extraction";

    private static final List<String> PROMPT_NAMES = List.of(SKILL_EXTRACTION);
    private static final String SYSTEM_MARKER = "[system]";
    private static final String USER_MARKER = "[user]";
    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{(\\w+)}}");

    private final Map<String, Prompt> templates = new HashMap<>();

    public PromptTemplates() {
        PROMPT_NAMES.forEach(name -> templates.put(name, load(name)));
    }

    public Prompt render(String name, Map<String, String> variables) {
        Prompt template = templates.get(name);
        if (template == null) {
            throw new IllegalStateException("Unknown prompt: " + name);
        }
        return new Prompt(fill(template.system(), variables), fill(template.user(), variables));
    }

    // Single pass, so placeholder-like text inside a value (e.g. certificate text) is never expanded again
    private static String fill(String template, Map<String, String> variables) {
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String key = matcher.group(1);
            if (!variables.containsKey(key)) {
                throw new IllegalArgumentException("Missing value for prompt placeholder: " + key);
            }
            matcher.appendReplacement(result, Matcher.quoteReplacement(variables.get(key)));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private static Prompt load(String name) {
        String path = "prompts/" + name + ".txt";
        String content;
        try {
            content = new ClassPathResource(path).getContentAsString(StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("Prompt file not found: " + path, e);
        }
        int systemStart = content.indexOf(SYSTEM_MARKER);
        int userStart = content.indexOf(USER_MARKER);
        if (systemStart < 0 || userStart < systemStart) {
            throw new IllegalStateException(path + " must contain a [system] section followed by a [user] section");
        }
        return new Prompt(
                content.substring(systemStart + SYSTEM_MARKER.length(), userStart).strip(),
                content.substring(userStart + USER_MARKER.length()).strip());
    }
}
