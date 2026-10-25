package com.skillproof.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "certificate_skills")
public class CertificateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "certificate_id", nullable = false)
    private Certificate certificate;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SkillLevel level;

    public CertificateSkill() {}

    public CertificateSkill(String name, SkillLevel level) {
        this.name = name;
        this.level = level;
    }

    public Long getId() {
        return id;
    }

    public Certificate getCertificate() {
        return certificate;
    }

    void setCertificate(Certificate certificate) {
        this.certificate = certificate;
    }

    public String getName() {
        return name;
    }

    public SkillLevel getLevel() {
        return level;
    }
}
