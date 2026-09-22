package com.skillproof.api.repository;

import com.skillproof.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    //looj up user by email
    Optional<User> findByEmail(String email);

    //check if user already exists by email
    boolean existsByEmail(String email);
}