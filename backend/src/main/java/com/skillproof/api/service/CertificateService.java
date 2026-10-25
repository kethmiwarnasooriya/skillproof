package com.skillproof.api.service;

import com.skillproof.api.dto.CertificateRequest;
import com.skillproof.api.dto.CertificateResponse;

import java.util.List;

public interface CertificateService {
    CertificateResponse submit(String userEmail, CertificateRequest request);
    List<CertificateResponse> listForUser(String userEmail);
}
