# Mediator

Mediator is a two-person conversation application built to help people work through disagreement, relationship tension, and emotionally difficult topics with an AI mediator in the middle.

The key product rule is simple: the two participants never see each other’s raw messages. Each person writes into a private thread, and the AI mediator interprets, reframes, and relays a response that is better suited for the recipient. This keeps one central mediated conversation while preserving two separate participant-facing chat experiences.

## Purpose

Mediator is designed for situations where direct back-and-forth can escalate, shut down, or become too emotionally loaded. Instead of exposing each participant to the other person’s unfiltered wording, Mediator:

- gives the inviter a structured way to describe the issue and the goal of the conversation
- lets the invited participant join through a secure email link
- enforces turn-taking so only one participant can reply at a time
- uses an AI mediator to translate each reply into a calmer, more constructive relay for the other person
- notifies the waiting participant by email when a new mediator message is ready

## Core User Flow

### 1. OTP login

The initial participant signs in with a one-time passcode sent by email.

### 2. Invitation

Once signed in, they create a conversation by providing:

- the other participant’s email address
- a description of the issue they want to discuss
- a pre-defined conversation goal

The first version includes these goals:

- Solve a disagreement
- Work out a relationship issue
- Get to know each other better
- Rebuild trust after a hurt
- Set healthier boundaries
- Make a shared decision

### 3. Pending conversation state

After sending the invitation, the inviter is taken to the conversation page. The conversation is marked as pending, and their chat input is disabled until the other participant joins and sends the first reply.

### 4. Invitation acceptance

The invited participant receives an email containing:

- the issue description
- the selected goal
- a secure accept link

When they click the link, they are automatically signed in and taken directly into the conversation.

### 5. First reply

The invited participant can write the first response. Once they send it, their input is disabled while the mediator prepares a reframed reply for the inviter.

### 6. Mediated relay

The backend sends the issue description and the private participant history to the AI mediator. The mediator generates a reply intended for the waiting participant without exposing the sender’s raw wording.

The waiting participant is then notified by email that a new mediator message is available.

### 7. Turn-based continuation

The inviter sees only:

- their own previously sent messages
- mediator messages addressed to them

The invitee sees only:

- their own previously sent messages
- mediator messages addressed to them

Each time someone replies:

1. their private message is saved to their own thread
2. the mediator generates the next relay for the other participant
3. the other participant becomes the only person allowed to respond

That loop continues until the conversation naturally stops.

## Privacy Model

Mediator intentionally separates internal context from participant-visible context.

### Internal context seen by the AI mediator

The mediator receives:

- the issue description
- the selected goal
- both participants’ private messages
- the mediator relays already sent

### Context shown to each participant

Each participant sees:

- the issue description
- their own sent messages
- mediator replies addressed to them

They never see the other participant’s private thread directly.

## Technology Stack

### Backend

- Node.js
- TypeScript
- Express
- MongoDB with Mongoose
- Nodemailer for SMTP email delivery
- JWT-based API authentication
- Anthropic Claude as the first mediator provider

### Frontend

- Angular 21
- PrimeNG
- Tailwind CSS 4

## AI Provider Design

The mediator integration is intentionally provider-agnostic.

The application reads `AGENT_MODEL` from the environment. The current expected format is:

```text
anthropic:claude-opus-4-6-v1
```

The provider prefix is parsed in the integration layer, and the current implementation routes `anthropic:*` models to the Anthropic client. This keeps the application ready for additional mediator providers later without spreading vendor-specific logic through the rest of the codebase.

## Architecture

The backend follows the server-oriented structure described in `architecture.md`.

### Entrypoints

- [`src/server/index.ts`](/d:/Projekt/mediator/src/server/index.ts)
- [`src/server/api/app.ts`](/d:/Projekt/mediator/src/server/api/app.ts)
- [`src/server/api/routes/auth-routes.ts`](/d:/Projekt/mediator/src/server/api/routes/auth-routes.ts)
- [`src/server/api/routes/conversation-routes.ts`](/d:/Projekt/mediator/src/server/api/routes/conversation-routes.ts)
- [`src/server/api/routes/meta-routes.ts`](/d:/Projekt/mediator/src/server/api/routes/meta-routes.ts)
- [`src/server/scheduled-workers/hourly/index.ts`](/d:/Projekt/mediator/src/server/scheduled-workers/hourly/index.ts)

These files stay thin. They receive HTTP or worker input, validate it, and hand off to reusable workflow modules.

### Workflow / orchestration helpers

- [`src/server/helpers/auth/request-otp.ts`](/d:/Projekt/mediator/src/server/helpers/auth/request-otp.ts)
- [`src/server/helpers/auth/verify-otp.ts`](/d:/Projekt/mediator/src/server/helpers/auth/verify-otp.ts)
- [`src/server/helpers/auth/accept-invitation.ts`](/d:/Projekt/mediator/src/server/helpers/auth/accept-invitation.ts)
- [`src/server/helpers/conversations/create-conversation.ts`](/d:/Projekt/mediator/src/server/helpers/conversations/create-conversation.ts)
- [`src/server/helpers/conversations/list-conversations.ts`](/d:/Projekt/mediator/src/server/helpers/conversations/list-conversations.ts)
- [`src/server/helpers/conversations/get-conversation.ts`](/d:/Projekt/mediator/src/server/helpers/conversations/get-conversation.ts)
- [`src/server/helpers/conversations/send-message.ts`](/d:/Projekt/mediator/src/server/helpers/conversations/send-message.ts)
- [`src/server/helpers/maintenance/prune-expired-artifacts.ts`](/d:/Projekt/mediator/src/server/helpers/maintenance/prune-expired-artifacts.ts)

These helpers coordinate state transitions such as:

- creating and emailing OTP challenges
- accepting invitation links and signing users in
- creating pending conversations
- enforcing turn-taking
- saving participant messages
- triggering mediator processing
- pruning expired OTP challenges and invitations

### Services

- [`src/server/services/tokens/jwt-service.ts`](/d:/Projekt/mediator/src/server/services/tokens/jwt-service.ts)
- [`src/server/services/mediator/build-mediator-reply.ts`](/d:/Projekt/mediator/src/server/services/mediator/build-mediator-reply.ts)
- [`src/server/services/mediator/process-conversation-turn.ts`](/d:/Projekt/mediator/src/server/services/mediator/process-conversation-turn.ts)
- [`src/server/services/mediator/types.ts`](/d:/Projekt/mediator/src/server/services/mediator/types.ts)

These modules handle token issuance and the mediated reply workflow.

### Integrations

- [`src/server/integrations/mongodb/connect-to-database.ts`](/d:/Projekt/mediator/src/server/integrations/mongodb/connect-to-database.ts)
- [`src/server/integrations/mongodb/models/user-model.ts`](/d:/Projekt/mediator/src/server/integrations/mongodb/models/user-model.ts)
- [`src/server/integrations/mongodb/models/otp-challenge-model.ts`](/d:/Projekt/mediator/src/server/integrations/mongodb/models/otp-challenge-model.ts)
- [`src/server/integrations/mongodb/models/conversation-model.ts`](/d:/Projekt/mediator/src/server/integrations/mongodb/models/conversation-model.ts)
- [`src/server/integrations/mongodb/models/conversation-message-model.ts`](/d:/Projekt/mediator/src/server/integrations/mongodb/models/conversation-message-model.ts)
- [`src/server/integrations/email/email-client.ts`](/d:/Projekt/mediator/src/server/integrations/email/email-client.ts)
- [`src/server/integrations/email/email-templates.ts`](/d:/Projekt/mediator/src/server/integrations/email/email-templates.ts)
- [`src/server/integrations/anthropic/create-mediator-provider.ts`](/d:/Projekt/mediator/src/server/integrations/anthropic/create-mediator-provider.ts)
- [`src/server/integrations/anthropic/anthropic-mediator-client.ts`](/d:/Projekt/mediator/src/server/integrations/anthropic/anthropic-mediator-client.ts)

All database, SMTP, and AI vendor concerns are isolated here.

### Utilities

- [`src/server/utils/app-error.ts`](/d:/Projekt/mediator/src/server/utils/app-error.ts)
- [`src/server/utils/async-handler.ts`](/d:/Projekt/mediator/src/server/utils/async-handler.ts)
- [`src/server/utils/crypto.ts`](/d:/Projekt/mediator/src/server/utils/crypto.ts)
- [`src/server/utils/dates.ts`](/d:/Projekt/mediator/src/server/utils/dates.ts)
- [`src/server/utils/email.ts`](/d:/Projekt/mediator/src/server/utils/email.ts)
- [`src/server/utils/object-id.ts`](/d:/Projekt/mediator/src/server/utils/object-id.ts)

## Data Model

### Users

Users are identified by email and created automatically when:

- a person verifies an OTP
- an invited participant accepts an invitation link

### OTP challenges

OTP challenges store:

- email
- hashed OTP code
- expiry time
- attempt count
- consumed timestamp

### Conversations

Each conversation stores:

- the issue description
- the selected goal
- status such as `pending`, `active`, or `expired`
- the currently allowed participant, if any
- mediator state such as `idle`, `processing`, or `failed`
- the embedded participant records for inviter and invitee
- the invitation token hash and acceptance metadata

### Conversation messages

Messages are stored per thread owner:

- participant messages are written only into the sender’s own visible thread
- mediator messages are written only into the recipient’s visible thread

This design preserves two distinct participant views while still allowing the backend to reconstruct the full mediated history for the AI model.

## Backend API Overview

### Auth

- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/accept-invitation`
- `GET /api/auth/me`

### Conversation metadata

- `GET /api/meta/goals`

### Conversations

- `GET /api/conversations`
- `POST /api/conversations`
- `GET /api/conversations/:conversationId`
- `POST /api/conversations/:conversationId/messages`

## Frontend Experience

The Angular application uses standalone components and a small signal-based auth store.

Important frontend areas:

- [`frontend/src/app/features/auth/login-page.component.ts`](/d:/Projekt/mediator/frontend/src/app/features/auth/login-page.component.ts)
- [`frontend/src/app/features/invitations/accept-invitation-page.component.ts`](/d:/Projekt/mediator/frontend/src/app/features/invitations/accept-invitation-page.component.ts)
- [`frontend/src/app/features/conversations/conversations-page.component.ts`](/d:/Projekt/mediator/frontend/src/app/features/conversations/conversations-page.component.ts)
- [`frontend/src/app/features/conversations/conversation-page.component.ts`](/d:/Projekt/mediator/frontend/src/app/features/conversations/conversation-page.component.ts)
- [`frontend/src/app/core/services/auth-store.service.ts`](/d:/Projekt/mediator/frontend/src/app/core/services/auth-store.service.ts)
- [`frontend/src/app/core/services/mediator-api.service.ts`](/d:/Projekt/mediator/frontend/src/app/core/services/mediator-api.service.ts)

The client uses:

- PrimeNG for high-level controls such as buttons, cards, tags, OTP input, spinner, and select
- Tailwind CSS for layout, spacing, responsive composition, and the custom visual language
- a bearer token stored in local storage for authenticated API calls
- route guards to protect conversation routes
- polling on the conversation page to keep the private thread updated while waiting for the next mediator reply

## Environment Variables

Create a `.env` file in the repository root. A sanitized example is provided in [`.env.example`](/d:/Projekt/mediator/.env.example).

Required variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_SECURE`
- `EMAIL_FROM`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `OTP_EXPIRY_MINUTES`
- `OTP_MAX_ATTEMPTS`
- `ANTHROPIC_API_KEY`
- `AGENT_MODEL`
- `MONGO_URL`

Optional variables:

- `PORT` defaults to `4000`
- `FRONTEND_URL` defaults to `http://localhost:4200`

## Running the Application

### Install dependencies

```bash
npm install
npm --prefix frontend install
```

### Start both applications in development

```bash
npm run dev
```

This starts:

- the backend on `http://localhost:4000`
- the Angular frontend on `http://localhost:4200`

The Angular dev server proxies `/api/*` requests to the backend.

### Build

```bash
npm run build
```

### Run the hourly cleanup worker

```bash
npm run worker:hourly
```

The worker removes expired OTP challenges and marks expired pending conversations.

## Current Operational Notes

- The current mediator provider implementation targets Anthropic Claude first, but the integration boundary is designed for other providers later.
- The frontend polls the conversation endpoint to detect new mediator replies.
- If the mediator provider fails during a turn, the conversation records the failure state so it can be surfaced clearly in the UI.
- Invitation acceptance currently uses a secure email link as the auto-login mechanism for the invited participant.

## Verification

The implementation has been verified with:

- `npm run build:server`
- `npm --prefix frontend run build`

## Future Improvements

- add a retry path for failed mediator turns
- add real-time updates with server-sent events or WebSockets
- add conversation closing/archival controls
- add rate limiting and abuse protection around OTP and invitation endpoints
- add automated tests for auth, invitation, and mediator turn orchestration
