package com.lingualink.service;

import com.lingualink.dto.ConnectionDto;
import com.lingualink.entity.Connection;
import com.lingualink.entity.Profile;
import com.lingualink.entity.User;
import com.lingualink.exception.BadRequestException;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.ConnectionRepository;
import com.lingualink.repository.ProfileRepository;
import com.lingualink.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final NotificationService notificationService;

    public ConnectionService(
            ConnectionRepository connectionRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            NotificationService notificationService) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ConnectionDto sendRequest(String senderEmail, Long receiverId) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + senderEmail));

        if (sender.getId().equals(receiverId)) {
            throw new BadRequestException("You cannot connect with yourself");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found: " + receiverId));

        Optional<Connection> existing = connectionRepository.findBetweenUsers(sender.getId(), receiverId);
        if (existing.isPresent()) {
            Connection conn = existing.get();
            if (conn.getStatus() == Connection.Status.PENDING) {
                throw new BadRequestException("A connection request is already pending");
            }
            if (conn.getStatus() == Connection.Status.ACCEPTED) {
                throw new BadRequestException("You are already connected");
            }
            // If previously rejected, allow re-requesting
            conn.setSender(sender);
            conn.setReceiver(receiver);
            conn.setStatus(Connection.Status.PENDING);
            Connection saved = connectionRepository.save(conn);
            sendConnectionNotification(sender, receiver);
            return mapToDto(saved);
        }

        Connection newConn = Connection.builder()
                .sender(sender)
                .receiver(receiver)
                .status(Connection.Status.PENDING)
                .build();

        Connection saved = connectionRepository.save(newConn);
        sendConnectionNotification(sender, receiver);
        return mapToDto(saved);
    }

    private void sendConnectionNotification(User sender, User receiver) {
        String senderName = profileRepository.findByUserId(sender.getId())
                .map(Profile::getName)
                .orElse("A user");
        notificationService.createNotification(
                receiver,
                "New Connection Request",
                senderName + " sent you a connection request",
                "CONNECTION_REQUEST",
                "/partners"
        );
    }

    @Transactional
    public ConnectionDto acceptRequest(String receiverEmail, Long connectionId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Connection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection request not found: " + connectionId));

        if (!conn.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("You are not authorized to accept this connection request");
        }

        conn.setStatus(Connection.Status.ACCEPTED);
        Connection saved = connectionRepository.save(conn);

        String receiverName = profileRepository.findByUserId(receiver.getId())
                .map(Profile::getName)
                .orElse("A user");
        notificationService.createNotification(
                conn.getSender(),
                "Connection Accepted",
                receiverName + " accepted your connection request!",
                "CONNECTION_ACCEPTED",
                "/chat"
        );

        return mapToDto(saved);
    }

    @Transactional
    public ConnectionDto rejectRequest(String receiverEmail, Long connectionId) {
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Connection conn = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Connection request not found: " + connectionId));

        if (!conn.getReceiver().getId().equals(receiver.getId())) {
            throw new BadRequestException("You are not authorized to reject this connection request");
        }

        conn.setStatus(Connection.Status.REJECTED);
        return mapToDto(connectionRepository.save(conn));
    }

    @Transactional(readOnly = true)
    public List<ConnectionDto> getPendingReceivedRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return connectionRepository.findByReceiverIdAndStatus(user.getId(), Connection.Status.PENDING)
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ConnectionDto> getActiveConnections(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return connectionRepository.findAllActiveConnections(user.getId(), Connection.Status.ACCEPTED)
                .stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public String getConnectionStatus(String userEmail, Long targetUserId) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) return "NONE";
        return connectionRepository.findBetweenUsers(user.getId(), targetUserId)
                .map(c -> c.getStatus().name())
                .orElse("NONE");
    }

    private ConnectionDto mapToDto(Connection c) {
        Profile senderProfile = profileRepository.findByUserId(c.getSender().getId()).orElse(null);
        Profile receiverProfile = profileRepository.findByUserId(c.getReceiver().getId()).orElse(null);

        return ConnectionDto.builder()
                .id(c.getId())
                .senderId(c.getSender().getId())
                .senderName(senderProfile != null ? senderProfile.getName() : c.getSender().getEmail())
                .senderEmail(c.getSender().getEmail())
                .receiverId(c.getReceiver().getId())
                .receiverName(receiverProfile != null ? receiverProfile.getName() : c.getReceiver().getEmail())
                .receiverEmail(c.getReceiver().getEmail())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
