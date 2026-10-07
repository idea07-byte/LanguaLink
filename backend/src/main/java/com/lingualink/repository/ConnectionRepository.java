package com.lingualink.repository;

import com.lingualink.entity.Connection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {

    Optional<Connection> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    @Query("SELECT c FROM Connection c WHERE (c.sender.id = :u1 AND c.receiver.id = :u2) OR (c.sender.id = :u2 AND c.receiver.id = :u1)")
    Optional<Connection> findBetweenUsers(@Param("u1") Long user1Id, @Param("u2") Long user2Id);

    List<Connection> findByReceiverIdAndStatus(Long receiverId, Connection.Status status);

    List<Connection> findBySenderIdAndStatus(Long senderId, Connection.Status status);

    @Query("SELECT c FROM Connection c WHERE (c.sender.id = :userId OR c.receiver.id = :userId) AND c.status = :status")
    List<Connection> findAllActiveConnections(@Param("userId") Long userId, @Param("status") Connection.Status status);
}
