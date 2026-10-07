# 🌐 LinguaLink — Full-Stack Language Exchange Platform

A modern language exchange platform connecting learners worldwide through real-time chat, AI tutoring, and spaced-repetition flashcards.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS / Vanilla CSS Design Tokens |
| **Backend** | Java 21 + Spring Boot 3.2.5 (Clean Architecture) |
| **Database** | PostgreSQL (Primary) / H2 In-Memory (Dev profile) |
| **Authentication** | Spring Security 6 + JWT (`io.jsonwebtoken` 0.12.5) + BCrypt |
| **ORM / Persistence** | Spring Data JPA + Hibernate |
| **Real-time Messaging** | WebSocket + STOMP Broker |
| **AI Integration** | Gemini API / Ollama grammar corrections |
| **Build & Tooling** | Vite, Maven, Git |

---

## 🏗️ Architecture & Project Structure

```
LinguaLink/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── api/                  # Axios HTTP client & JWT interceptors
│   │   ├── context/              # AuthContext & ToastContext
│   │   ├── layouts/              # Main layout & navigation
│   │   └── pages/                # Landing, Auth, Chat, AI Tutor, Flashcards, Profile
│   └── vite.config.js            # Reverse proxy (/api, /ws) to Spring Boot
│
├── backend/                      # Spring Boot REST API
│   ├── pom.xml                   # Maven dependencies
│   └── src/main/
│       ├── java/com/lingualink/
│       │   ├── controller/       # AuthController, ProfileController, HealthController
│       │   ├── service/          # AuthService, ProfileService
│       │   ├── repository/       # UserRepository, ProfileRepository, LanguageRepository...
│       │   ├── entity/           # User, Profile, Language, Message, Flashcard, AICorrection...
│       │   ├── dto/              # Request/Response data transfer objects
│       │   ├── exception/        # GlobalExceptionHandler & custom exceptions
│       │   ├── security/         # JwtUtils, AuthTokenFilter, CustomUserDetailsService
│       │   └── config/           # SecurityConfig, WebMvcConfig, WebSocketConfig
│       └── resources/
│           ├── application.properties      # PostgreSQL configuration
│           ├── application-dev.properties  # H2 in-memory dev profile
│           ├── schema.sql                  # PostgreSQL DDL table definitions & indexes
│           └── data.sql                    # Seed data for languages
│
└── README.md
```

---

## 🗄️ Database Design (Phase 3)

The PostgreSQL database is defined in [`schema.sql`](backend/src/main/resources/schema.sql) with the following relational model:

```
USER
 │
 ├── PROFILE (1:1)
 │
 ├── USER_LANGUAGES (1:N)
 │       └── LANGUAGE
 │
 ├── CONVERSATION_MEMBERS (N:M)
 │       └── CONVERSATIONS
 │               └── MESSAGES
 │                       └── AI_CORRECTIONS
 │
 ├── FLASHCARD_DECKS (1:N)
 │       └── FLASHCARDS (with SM-2 spaced repetition)
 │
 └── AI_CORRECTIONS
```

### Tables & Relationships
1. **`users`**: Authentication credentials, email, password hash, role (`ROLE_USER`), enabled flag.
2. **`profiles`**: 1-to-1 with `users`. Name, bio, level, avatar URL, streak, XP.
3. **`languages`**: System languages (code, name, flag). Seeded via [`data.sql`](backend/src/main/resources/data.sql).
4. **`user_languages`**: Join table with proficiency level (`BEGINNER`, `INTERMEDIATE`, `ADVANCED`, `NATIVE`) and type (`NATIVE`, `LEARNING`).
5. **`conversations` & `conversation_members`**: Direct & group chat dialogs.
6. **`messages`**: Chat messages with type (`TEXT`, `AI_CORRECTION`, `IMAGE`, `VOICE`) and read receipts.
7. **`flashcard_decks` & `flashcards`**: Decks and cards with SuperMemo SM-2 spaced repetition fields (`interval_days`, `repetitions`, `ease_factor`, `next_review`).
8. **`ai_corrections`**: AI grammar/spelling explanations attached to messages.

---

## 🔒 Authentication & Security (Phase 5)

* **Password Hashing**: BCrypt with salted rounds (`BCryptPasswordEncoder`).
* **JWT Tokens**: Signed with HMAC-SHA256 containing expiration and subject.
* **Filter Chain**: `AuthTokenFilter` intercepts every request, validates the Bearer token, and populates the `SecurityContext`.
* **Stateless**: Session creation is disabled (`SessionCreationPolicy.STATELESS`).

### Key Endpoints

| Method | Endpoint | Access | Phase / Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | Phase 4: System health status |
| `POST` | `/api/auth/register` | Public | Phase 5: Register & generate JWT |
| `POST` | `/api/auth/login` | Public | Phase 5: Authenticate & issue JWT |
| `GET` | `/api/profile` | Auth | Phase 6: User profile & language settings |
| `PUT` | `/api/profile` | Auth | Phase 6: Update profile, level, & interests |
| `GET`/`POST` | `/api/languages` | Public/Auth | Phase 6: Retrieve / register system languages |
| `GET` | `/api/partners` | Auth | Phase 7: Match discovery (50-20-20-10 algorithm) |
| `GET` | `/api/partners/{id}` | Auth | Phase 7: Partner detail & score breakdown |
| `POST` | `/api/connections/request/{id}` | Auth | Phase 8: Send connection request (`PENDING`) |
| `POST` | `/api/connections/{id}/accept` | Auth | Phase 8: Accept connection request (`ACCEPTED`) |
| `GET` | `/api/connections` | Auth | Phase 8: List active friends & connections |
| `GET` | `/api/conversations` | Auth | Phase 9: Conversation list with unread counters |
| `POST` | `/api/conversations/start/{id}`| Auth | Phase 9: Start 1-on-1 direct conversation |
| `GET` | `/api/conversations/{id}/messages`| Auth | Phase 9: Historical message logs |
| `POST` | `/api/conversations/{id}/messages`| Auth | Phase 9: REST message send fallback |
| `WS` | `/ws` (`/topic/conversation/{id}`) | Public/Auth | Phase 9: Real-time STOMP message broker |

---

## 🚀 Running the Project

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```
Accessible at: **http://localhost:5173**

### 2. Backend
To run with your local PostgreSQL:
1. Ensure PostgreSQL is running on port `5432` and create database `lingualink`.
2. Update `spring.datasource.password` in `backend/src/main/resources/application.properties`.
3. Start the server:
```bash
cd backend
mvn spring-boot:run
```
Accessible at: **http://localhost:8080**

To run in zero-config dev mode (H2 in-memory DB):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
H2 Web Console available at: `http://localhost:8080/h2-console`
