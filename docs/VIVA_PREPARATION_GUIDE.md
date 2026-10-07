# LinguaLink: Comprehensive Viva & Technical Interview Guide
**Mastery of Full-Stack Architecture, Spring Boot, React, Security & Algorithms**

---

### Core Architecture & Frameworks

#### Q1: What is the overall architecture of LinguaLink?
**Answer:** LinguaLink follows a decoupled, 4-tier client-server architecture:
1. **Presentation Layer:** React 18 Single Page Application (SPA) styled with Tailwind CSS and custom CSS tokens, bundled with Vite.
2. **Gateway / Security Layer:** Spring Security with a custom `OncePerRequestFilter` inspecting Bearer JWTs, enforcing CORS and method-level authorization (`@PreAuthorize`).
3. **Application & Business Logic Layer:** Spring Boot 3.2 services (`AuthService`, `PartnerMatchingService`, `ChatService`, `AIService`, `FlashcardService`).
4. **Persistence & Data Access Layer:** Spring Data JPA with Hibernate ORM communicating with a normalized PostgreSQL 16 database.
5. **Real-Time Communication:** Full-duplex WebSocket STOMP protocol backed by an in-memory message broker.

---

#### Q2: Why did you choose Spring Boot over Node.js / Express for the backend?
**Answer:**
* **Type Safety & Enterprise Structure:** Java's strict static typing and Spring's standardized MVC structure minimize runtime defects in large college projects.
* **Declarative Security:** Spring Security provides industry-standard filter chains, BCrypt hashing, and method-level access controls out of the box.
* **Data Integrity:** Spring Data JPA and Hibernate provide compile-time entity relationships, automated schema management, and transaction boundaries (`@Transactional`).
* **Built-in WebSocket Support:** Spring provides native STOMP protocol support over WebSockets without requiring external Socket.IO packages.

---

#### Q3: How does React communicate with Spring Boot?
**Answer:**
1. **REST APIs (HTTP/HTTPS):** Via an `Axios` instance configured with a base URL of `/api`. An Axios request interceptor injects the Bearer JWT token from `localStorage` into the `Authorization` header of every outgoing HTTP request.
2. **Real-time WebSocket (WSS):** Via `@stomp/stompjs` and `sockjs-client` connected to the `/ws` endpoint for bidirectional instant messaging.

---

### Authentication, Security & JWT

#### Q4: How does JWT authentication work in LinguaLink?
**Answer:**
1. When a user submits credentials to `POST /api/auth/login`, Spring Security's `AuthenticationManager` authenticates the user via `DaoAuthenticationProvider`.
2. Upon success, `JwtUtils` generates a cryptographically signed HMAC-SHA256 JWT containing the username (subject), issued-at date, and expiration timestamp.
3. The server sends this token back in `AuthResponse`. The frontend stores it in `localStorage`.
4. On subsequent requests, `AuthTokenFilter` extracts the Bearer token, validates its signature and expiration using `JwtUtils`, loads the `UserDetails`, and populates the `SecurityContextHolder`.

---

#### Q5: What is the difference between Authentication and Authorization?
**Answer:**
* **Authentication:** Verifies *who* you are (identity verification via username/password and JWT validation).
* **Authorization:** Verifies *what* you are allowed to do (permissions/roles). In LinguaLink, `@PreAuthorize("isAuthenticated()")` ensures that unauthenticated guests cannot invoke protected endpoints such as `/api/chat` or `/api/flashcards`.

---

#### Q6: How does LinguaLink protect against SQL Injection?
**Answer:**
We use Spring Data JPA repository interfaces (`JpaRepository`). Hibernate generates parameterized SQL queries using prepared statements (`PreparedStatement`) where user inputs are treated strictly as data literals rather than executable SQL code. We avoid string concatenation in queries.

---

#### Q7: Where are AI API keys stored, and why should they never be in React?
**Answer:**
API keys (like `GEMINI_API_KEY`) are stored strictly in server-side `.env` files and system environment variables in Spring Boot. If an API key were stored in React, anyone could view it using their browser's Developer Tools (`F12` $\rightarrow$ Network / Sources), leading to quota theft and financial liability.

---

### Real-Time Chat & WebSocket

#### Q8: What is WebSocket, and why did you use STOMP over raw WebSockets?
**Answer:**
* **WebSocket:** A full-duplex, persistent TCP connection that allows the server to push data to the client instantly without the overhead of HTTP polling.
* **STOMP (Simple Text Oriented Messaging Protocol):** A sub-protocol on top of WebSockets that provides standardized messaging semantics (like `SEND`, `SUBSCRIBE`, `MESSAGE`, destination headers). It allows message routing to topic destinations (e.g., `/topic/conversation/{id}`) and user queues (e.g., `/user/{username}/queue/messages`).

---

#### Q9: What happens when User A sends a message to User B?
**Answer:**
1. User A sends a STOMP message frame to `/app/chat.sendMessage`.
2. `ChatWebSocketController` captures the payload and invokes `ChatService.sendMessage()`.
3. `ChatService`:
   * Persists the message into PostgreSQL's `messages` table.
   * Updates conversation's `updated_at` timestamp.
   * Broadcasts the message to the conversation room topic: `/topic/conversation/{conversationId}`.
   * Dispatches a live notification to User B via `NotificationService`.
4. User B's active React client receives the STOMP message frame and appends it immediately to the active chat thread.

---

### Algorithms & Business Logic

#### Q10: How does the 50-20-20-10 Partner Matching Algorithm work?
**Answer:**
It computes a weighted 100-point compatibility score:
* **50% Language Reciprocity:** Full 50 points if User A's native language matches User B's learning language AND vice versa. 25 points for partial overlap.
* **20% Skill Compatibility:** Evaluates proficiency level distance. Complementary pairings (e.g. Intermediate with Advanced) score highest.
* **20% Shared Interests:** Jaccard-weighted overlap of user interests (technology, music, sports, travel) up to 20 points.
* **10% Activity Streak:** Rewards daily active users up to 10 points based on their current streak count.

---

#### Q11: Explain the SM-2 Spaced Repetition Algorithm implemented in Flashcards.
**Answer:**
Based on the SuperMemo-2 algorithm:
* After viewing a card, the user grades their recall: `AGAIN` (blackout), `HARD`, `GOOD`, `EASY`.
* **Interval Growth:**
  * For `AGAIN`: Repetitions reset to 0; interval resets to 1 day; ease factor decreases.
  * For `GOOD`: Interval $I_1 = 1$, $I_2 = 6$, $I_n = I_{n-1} \times \text{EaseFactor}$.
  * For `EASY`: Interval expands by $1.3 \times \text{EaseFactor}$, ease factor increases.
* `next_review` is calculated as `now() + intervalDays`. This optimizes memory retention according to Ebbinghaus's forgetting curve.

---

### Database Design & JPA / Hibernate

#### Q12: What is the relationship between `User`, `Profile`, and `UserLanguage`?
**Answer:**
* `User` to `Profile`: `@OneToOne` bidirectional mapping.
* `User` to `UserLanguage`: `@OneToMany` mapping.
* `Language` to `UserLanguage`: `@ManyToOne` mapping. `UserLanguage` is an association entity with extra attributes (`proficiency_level`, `type`: `NATIVE` or `LEARNING`).

---

#### Q13: What is the purpose of `@Transactional` in Spring?
**Answer:**
`@Transactional` defines an atomic database transaction boundary. If an unchecked exception occurs during the method execution (for example, if saving a message fails after creating a conversation), all preceding database operations are automatically rolled back, preserving database consistency.

---

#### Q14: How does the AI Grammar Correction feature work?
**Answer:**
1. User enters a sentence into the frontend (e.g., *"I didn't went to college."*).
2. React calls `POST /api/ai/grammar`.
3. `AIService` prompts the Gemini API or local Ollama model to analyze the sentence.
4. If an external API is offline, our built-in rule engine parses common linguistic patterns and returns:
   * **Corrected:** *"I didn't go to college."*
   * **Rule:** *Past Simple Negative Auxiliary*
   * **Explanation:** *"After the auxiliary verb 'didn't', always use the base form of the verb."*
5. The result is automatically stored in the `ai_corrections` table for future review.
