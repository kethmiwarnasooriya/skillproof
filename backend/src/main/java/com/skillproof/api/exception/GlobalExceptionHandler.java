package com.skillproof.api.exception;

import com.skillproof.api.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), null, request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex,
            HttpServletRequest request) {
        // Same message for unknown email and wrong password so accounts can't be enumerated
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password.", null, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        String firstErrorMessage = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        return build(HttpStatus.BAD_REQUEST, firstErrorMessage, null, request);
    }

    @ExceptionHandler(InvalidCertificateUrlException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCertificateUrl(
            InvalidCertificateUrlException ex,
            HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), "INVALID_CERTIFICATE_URL", request);
    }

    @ExceptionHandler(CertificateFetchException.class)
    public ResponseEntity<ErrorResponse> handleCertificateFetch(
            CertificateFetchException ex,
            HttpServletRequest request) {
        return build(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage(), "CERTIFICATE_FETCH_FAILED", request);
    }

    @ExceptionHandler(SubmissionLimitExceededException.class)
    public ResponseEntity<ErrorResponse> handleSubmissionLimit(
            SubmissionLimitExceededException ex,
            HttpServletRequest request) {
        return build(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), "SUBMISSION_LIMIT_REACHED", request);
    }

    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ErrorResponse> handleAiService(
            AiServiceException ex,
            HttpServletRequest request) {
        return switch (ex.getReason()) {
            case AUTHENTICATION, QUOTA_EXCEEDED -> {
                // Our configuration problem, not the user's: log loudly, show a generic message
                log.error("AI provider rejected our credentials or quota: {}", ex.getMessage());
                yield build(HttpStatus.SERVICE_UNAVAILABLE,
                        "The AI service is temporarily unavailable. Please try again later.", "AI_UNAVAILABLE", request);
            }
            case RATE_LIMITED -> build(HttpStatus.SERVICE_UNAVAILABLE,
                    "The AI service is busy right now. Please try again in a minute.", "AI_BUSY", request);
            case TIMEOUT -> build(HttpStatus.GATEWAY_TIMEOUT,
                    "The AI took too long to respond. Please try again.", "AI_TIMEOUT", request);
            case UNAVAILABLE -> build(HttpStatus.BAD_GATEWAY,
                    "The AI service is temporarily unavailable. Please try again later.", "AI_UNAVAILABLE", request);
            case INVALID_RESPONSE -> build(HttpStatus.UNPROCESSABLE_CONTENT,
                    "We couldn't extract skills from this certificate. Try pasting the certificate text instead.",
                    "ANALYSIS_FAILED", request);
        };
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String message, String code,
                                                HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                code
        );
        return new ResponseEntity<>(error, status);
    }
}
