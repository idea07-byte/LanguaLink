package com.lingualink.service;

import com.lingualink.dto.ConversationSummaryDto;
import com.lingualink.dto.MessageDto;
import com.lingualink.entity.*;
import com.lingualink.exception.BadRequestException;
import com.lingualink.exception.ResourceNotFoundException;
import com.lingualink.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final UserLanguageRepository userLanguageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public ChatService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository conversationMemberRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            ProfileRepository profileRepository,
            UserLanguageRepository userLanguageRepository,
            SimpMessagingTemplate messagingTemplate,
            NotificationService notificationService) {
        this.conversationRepository = conversationRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.userLanguageRepository = userLanguageRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> getUserConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Conversation> convs = conversationRepository.findConversationsByUserId(user.getId());
        List<ConversationSummaryDto> result = new ArrayList<>();

        for (Conversation c : convs) {
            List<ConversationMember> members = conversationMemberRepository.findByConversationId(c.getId());
            User partner = members.stream()
                    .map(ConversationMember::getUser)
                    .filter(u -> !u.getId().equals(user.getId()))
                    .findFirst()
                    .orElse(null);

            if (partner == null) continue;

            Profile partnerProfile = profileRepository.findByUserId(partner.getId()).orElse(null);

            // Fetch last message
            List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(c.getId());
            Message lastMsg = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);

            // Unread count
            long unread = msgs.stream()
                    .filter(m -> !m.getSender().getId().equals(user.getId()) && !Boolean.TRUE.equals(m.getRead()))
                    .count();

            // Partner languages
            String pNative = userLanguageRepository.findByUserIdAndType(partner.getId(), UserLanguage.LanguageType.NATIVE)
                    .stream().map(ul -> ul.getLanguage().getName()).findFirst().orElse("Unknown");
            String pLearning = userLanguageRepository.findByUserIdAndType(partner.getId(), UserLanguage.LanguageType.LEARNING)
                    .stream().map(ul -> ul.getLanguage().getName()).findFirst().orElse("Unknown");

            result.add(ConversationSummaryDto.builder()
                    .id(c.getId())
                    .type(c.getType().name())
                    .partnerId(partner.getId())
                    .partnerName(partnerProfile != null ? partnerProfile.getName() : partner.getEmail())
                    .partnerAvatar(partnerProfile != null ? partnerProfile.getAvatarUrl() : null)
                    .partnerStatus(partnerProfile != null && partnerProfile.getStreak() > 0 ? "online" : "away")
                    .partnerNative(pNative)
                    .partnerLearning(pLearning)
                    .lastMessage(lastMsg != null ? lastMsg.getContent() : "Conversation started")
                    .lastMessageTime(lastMsg != null ? lastMsg.getSentAt() : c.getCreatedAt())
                    .unreadCount((int) unread)
                    .build());
        }

        return result;
    }

    @Transactional
    public Long getOrCreateConversation(String userEmail, Long partnerId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getId().equals(partnerId)) {
            throw new BadRequestException("You cannot start a conversation with yourself");
        }

        User partner = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found: " + partnerId));

        // Check if existing conversation exists between these 2 users
        List<Conversation> myConvs = conversationRepository.findConversationsByUserId(user.getId());
        for (Conversation c : myConvs) {
            if (c.getType() == Conversation.ConversationType.DIRECT) {
                boolean hasPartner = conversationMemberRepository.existsByConversationIdAndUserId(c.getId(), partnerId);
                if (hasPartner) {
                    return c.getId();
                }
            }
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .type(Conversation.ConversationType.DIRECT)
                .build();
        Conversation savedConv = conversationRepository.save(conversation);

        // Add both members
        ConversationMember member1 = ConversationMember.builder()
                .conversation(savedConv)
                .user(user)
                .build();
        ConversationMember member2 = ConversationMember.builder()
                .conversation(savedConv)
                .user(partner)
                .build();

        conversationMemberRepository.save(member1);
        conversationMemberRepository.save(member2);

        return savedConv.getId();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, user.getId())) {
            throw new BadRequestException("You are not a member of this conversation");
        }

        List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        return msgs.stream().map(this::mapMessageToDto).toList();
    }

    @Transactional
    public MessageDto sendMessage(String senderEmail, Long conversationId, String content, String type) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversationMemberRepository.existsByConversationIdAndUserId(conversationId, sender.getId())) {
            throw new BadRequestException("You are not a member of this conversation");
        }

        Message.MessageType msgType = Message.MessageType.TEXT;
        try {
            if (type != null) msgType = Message.MessageType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ignored) {}

        Message msg = Message.builder()
                .conversation(conv)
                .sender(sender)
                .content(content)
                .type(msgType)
                .read(false)
                .sentAt(LocalDateTime.now())
                .build();

        Message savedMsg = messageRepository.save(msg);
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        MessageDto dto = mapMessageToDto(savedMsg);

        // Real-Time Broadcast via WebSocket
        // 1. Broadcast to the conversation topic: /topic/conversation/{conversationId}
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, dto);

        // 2. Also notify partner individually
        List<ConversationMember> members = conversationMemberRepository.findByConversationId(conversationId);
        String senderName = profileRepository.findByUserId(sender.getId())
                .map(Profile::getName).orElse("Someone");
        String preview = content.length() > 60 ? content.substring(0, 57) + "..." : content;

        for (ConversationMember m : members) {
            if (!m.getUser().getId().equals(sender.getId())) {
                messagingTemplate.convertAndSendToUser(
                        m.getUser().getEmail(),
                        "/queue/messages",
                        dto
                );
                notificationService.createNotification(
                        m.getUser(),
                        "New Message from " + senderName,
                        preview,
                        "MESSAGE",
                        "/chat?conversation=" + conversationId
                );
            }
        }

        return dto;
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        for (Message m : msgs) {
            if (!m.getSender().getId().equals(user.getId()) && !Boolean.TRUE.equals(m.getRead())) {
                m.setRead(true);
                messageRepository.save(m);
            }
        }
    }

    private MessageDto mapMessageToDto(Message m) {
        Profile p = profileRepository.findByUserId(m.getSender().getId()).orElse(null);
        return MessageDto.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(p != null ? p.getName() : m.getSender().getEmail())
                .content(m.getContent())
                .type(m.getType().name())
                .read(m.getRead())
                .sentAt(m.getSentAt())
                .build();
    }
}
