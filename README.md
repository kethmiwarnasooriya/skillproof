# SkillProof

Turn course certificates into proof of skills. A user submits a certificate link, the backend reads the page and uses
the OpenAI API to extract the course name, issuer and the practical skills it covers.

| Part | Stack | Folder |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Axios | [`frontend/`](frontend/) |
| Backend | Spring Boot 4, Spring Security (JWT), JPA, PostgreSQL | [`backend/`](backend/) |

## Prerequisites

- Java 24+ (the Maven wrapper is included)
- Node.js 20+
- PostgreSQL with a database named `skillproof_db`
- An OpenAI API key: <https://platform.openai.com/api-keys>

## Configuration and secrets

The backend reads all secrets from environment variables. For local development, put them in `backend/.env`,
which is git-ignored and loaded automatically on startup. Real environment variables override it.

```bash
cd backend
cp .env.example .env
# then edit .env
```

| Variable | Required | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | yes | OpenAI API key, used only by the backend |
| `JWT_SECRET` | yes | Base64 HMAC key for signing logins. Generate with `openssl rand -base64 64` |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `OPENAI_MODEL` | no | Model for skill extraction (default `gpt-4o-mini`) |
| `DB_URL`, `DB_USERNAME` | no | Default to the local `skillproof_db` as `postgres` |
| `CORS_ALLOWED_ORIGINS` | no | Frontend origins (default `http://localhost:5173`) |

The backend refuses to start if a required variable is missing.

### Setting `OPENAI_API_KEY`

Either add it to `backend/.env`:

```
OPENAI_API_KEY=sk-...
```

or export it in the shell that starts the backend (this takes precedence over `.env`):

```bash
export OPENAI_API_KEY=sk-...
```

Never commit the key or put it in frontend code. The browser only talks to this backend, never to OpenAI. If a key
is ever committed or shared, revoke it in the OpenAI dashboard and create a new one.

## Running locally

```bash
# Terminal 1: backend on http://localhost:8080
cd backend
./mvnw spring-boot:run

# Terminal 2: frontend on http://localhost:5173
cd frontend
npm install
npm run dev
```

Tables are created automatically on first start (`spring.jpa.hibernate.ddl-auto=update`).

## Tests

```bash
cd backend && ./mvnw test        # unit tests; OpenAI is mocked, no key or network needed for these
cd frontend && npm run lint && npm run build
```

`ApiApplicationTests` starts the full application, so it needs PostgreSQL and the variables above.

## Certificate analysis

`POST /api/certificates` (JWT required) with `{"url": "...", "certificateText": "optional"}`:

1. The URL is checked against an SSRF guard: http/https only, ports 80/443, no private, loopback or link-local addresses,
   re-checked on every redirect.
2. The page is fetched server-side and reduced to plain text (truncated to 8,000 characters). If the page can't be read,
   which is common for JavaScript-heavy or bot-blocking sites like Coursera and Udemy, the API returns
   `422 CERTIFICATE_FETCH_FAILED` and the user can paste the certificate text instead.
3. The text is sent to OpenAI with the prompt in
   [`backend/src/main/resources/prompts/skill-extraction.txt`](backend/src/main/resources/prompts/skill-extraction.txt),
   which treats certificate content strictly as data.
4. The JSON answer is validated; an unusable answer is retried once, then the certificate is saved as `FAILED`.

`GET /api/certificates` lists the current user's certificates. Each user can submit up to 10 certificates per hour
(`app.certificates.max-submissions-per-hour`).

New AI features (task generation, evidence evaluation) are added as a new method on `AiService` with their own
prompt file in `resources/prompts/`.
