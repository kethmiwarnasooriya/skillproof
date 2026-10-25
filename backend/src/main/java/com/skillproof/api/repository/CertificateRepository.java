package com.skillproof.api.repository;

import com.skillproof.api.entity.Certificate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    //newest first, skills loaded in the same query
    @EntityGraph(attributePaths = "skills")
    List<Certificate> findByUserIdOrderByCreatedAtDesc(Long userId);

    //used for the per-user hourly submission limit
    long countByUserIdAndCreatedAtAfter(Long userId, LocalDateTime since);
}
