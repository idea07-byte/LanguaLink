-- =====================================================================
-- LinguaLink — Database Schema (PostgreSQL DDL)
-- Phase 3: Database Design with relationships, constraints & indexes
-- =====================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast user authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. PROFILES TABLE (1-to-1 with users)
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    bio TEXT,
    level VARCHAR(50) DEFAULT 'Beginner',
    avatar_url VARCHAR(500),
    streak INT NOT NULL DEFAULT 0,
    xp INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- 3. LANGUAGES TABLE
CREATE TABLE IF NOT EXISTS languages (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    flag VARCHAR(10)
);

CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);

-- 4. USER_LANGUAGES TABLE (Many-to-Many between users & languages with metadata)
CREATE TABLE IF NOT EXISTS user_languages (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    language_id BIGINT NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL DEFAULT 'BEGINNER', -- BEGINNER, INTERMEDIATE, ADVANCED, NATIVE
    type VARCHAR(20) NOT NULL DEFAULT 'LEARNING',              -- NATIVE, LEARNING
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_lang_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_lang_language FOREIGN KEY (language_id) REFERENCES languages(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_language_type UNIQUE (user_id, language_id, type)
);

CREATE INDEX IF NOT EXISTS idx_user_languages_user ON user_languages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_languages_lang ON user_languages(language_id);

-- 5. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL DEFAULT 'DIRECT', -- DIRECT, GROUP
    title VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONVERSATION_MEMBERS TABLE (Many-to-Many between conversations & users)
CREATE TABLE IF NOT EXISTS conversation_members (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_member_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_conversation_member UNIQUE (conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_members_user ON conversation_members(user_id);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'TEXT', -- TEXT, AI_CORRECTION, IMAGE, VOICE, SYSTEM
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 8. FLASHCARD_DECKS TABLE
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    language VARCHAR(50),
    color VARCHAR(20) DEFAULT '#7C3AED',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_deck_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_decks_user ON flashcard_decks(user_id);

-- 9. FLASHCARDS TABLE (with SM-2 Spaced Repetition fields)
CREATE TABLE IF NOT EXISTS flashcards (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    deck_id BIGINT,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    example TEXT,
    language VARCHAR(50),
    interval_days INT NOT NULL DEFAULT 1,
    repetitions INT NOT NULL DEFAULT 0,
    ease_factor DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mastered BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_card_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_card_deck FOREIGN KEY (deck_id) REFERENCES flashcard_decks(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_cards_user ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_deck ON flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_next_review ON flashcards(user_id, next_review);

-- 10. AI_CORRECTIONS TABLE
CREATE TABLE IF NOT EXISTS ai_corrections (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT,
    user_id BIGINT NOT NULL,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT,
    grammar_rule VARCHAR(255),
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_corr_message FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
    CONSTRAINT fk_ai_corr_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_corrections_user ON ai_corrections(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_corrections_msg ON ai_corrections(message_id);

-- 11. USER_INTERESTS TABLE
CREATE TABLE IF NOT EXISTS user_interests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    interest VARCHAR(100) NOT NULL,
    CONSTRAINT fk_interest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_interest UNIQUE (user_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);

-- 12. CONNECTIONS TABLE (Follow / Friend System - Phase 8)
CREATE TABLE IF NOT EXISTS connections (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_connection_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_connection_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_connection UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_sender ON connections(sender_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

-- 13. NOTIFICATIONS TABLE (Phase 16)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- CONNECTION_REQUEST, CONNECTION_ACCEPTED, MESSAGE, FLASHCARD_REMINDER, AI_LEARNING
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at);

