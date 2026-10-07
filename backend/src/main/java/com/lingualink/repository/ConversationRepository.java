package com.lingualink.repository;

import com.lingualink.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT cm.conversation FROM ConversationMember cm WHERE cm.user.id = :userId ORDER BY cm.conversation.updatedAt DESC")
    List<Conversation> findConversationsByUserId(@Param("userId") Long userId);
}
