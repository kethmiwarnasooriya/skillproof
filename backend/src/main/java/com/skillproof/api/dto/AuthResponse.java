package com.skillproof.api.dto;

public class AuthResponse {
    private String message;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String message, String email) {
        this.message = message;
        this.email = email;
    }
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
