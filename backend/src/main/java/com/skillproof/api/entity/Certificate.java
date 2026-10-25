package com.skillproof.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "certificates")
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 2048)
    private String url;

    private String courseName;

    private String issuer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CertificateStatus status;

    @Column(length = 500)
    private String errorMessage;

    // Skills are separate rows so later features (task generation, evaluation) can reference one skill by id
    @OneToMany(mappedBy = "certificate", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<CertificateSkill> skills = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = CertificateStatus.PENDING;
        }
    }

    public Certificate() {}

    public Certificate(User user, String url) {
        this.user = user;
        this.url = url;
        this.status = CertificateStatus.PENDING;
    }

    public void markAnalyzed(String courseName, String issuer, List<CertificateSkill> newSkills) {
        this.courseName = courseName;
        this.issuer = issuer;
        this.skills.clear();
        newSkills.forEach(this::addSkill);
        this.status = CertificateStatus.ANALYZED;
        this.errorMessage = null;
    }

    public void markFailed(String errorMessage) {
        this.status = CertificateStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    private void addSkill(CertificateSkill skill) {
        skill.setCertificate(this);
        this.skills.add(skill);
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getUrl() {
        return url;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getIssuer() {
        return issuer;
    }

    public CertificateStatus getStatus() {
        return status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public List<CertificateSkill> getSkills() {
        return skills;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
