package com.skillproof.api.controller;

import com.skillproof.api.dto.CertificateRequest;
import com.skillproof.api.dto.CertificateResponse;
import com.skillproof.api.service.CertificateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    // Synchronous: the response arrives once the AI has finished (usually a few seconds)
    @PostMapping
    public ResponseEntity<CertificateResponse> submit(@Valid @RequestBody CertificateRequest request,
                                                      Authentication authentication) {
        CertificateResponse response = certificateService.submit(authentication.getName(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CertificateResponse>> list(Authentication authentication) {
        return ResponseEntity.ok(certificateService.listForUser(authentication.getName()));
    }
}
