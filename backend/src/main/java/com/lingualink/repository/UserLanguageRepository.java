package com.lingualink.repository;

import com.lingualink.entity.User;
import com.lingualink.entity.UserLanguage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserLanguageRepository extends JpaRepository<UserLanguage, Long> {
    List<UserLanguage> findByUser(User user);
    List<UserLanguage> findByUserId(Long userId);
    List<UserLanguage> findByUserIdAndType(Long userId, UserLanguage.LanguageType type);
}
