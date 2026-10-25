package com.skillproof.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SkillResponse {
    private Long id;
    private String name;
    private String level;
}
