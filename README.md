# Digital Library Management System

A full-stack digital library web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## 📁 Project Structure

Digital Library Management System/
├── src/                         # Primary React application
│   ├── App.jsx                  # Member-facing routes and views
│   ├── App.css                  # Main application styles
│   ├── main.jsx                 # React entry point
│   ├── admin/                   # Admin shell and admin pages
│   │   ├── AdminApp.jsx
│   │   └── pages/
│   ├── context/AuthContext.jsx  # Authentication state and actions
│   └── services/api-backend.js  # Primary API client and local session helpers
├── server.js                    # Primary Express API, schemas, seed data, and routes
├── public/                      # Primary static assets
├── frontend/                    # Alternate standalone Vite frontend
├── backend/                     # Alternate minimal Express backend
├── api.js                       # Additional API/server implementation kept in the project
├── .env.example                 # Safe environment-variable template
├── package.json                 # Root scripts and dependencies
├── package-lock.json            # Reproducible root dependency lockfile
└── vite.config.js               # Root Vite configuration
```

## System Architecture

```mermaid
flowchart LR
	Browser[Member or Admin Browser] --> React[React + Vite Client]
	React --> Context[AuthContext and API Client]
	Context --> Express[Express REST API]
	Express --> Auth[Auth and role checks]
	Express --> Mongo[(MongoDB)]
	Express -. optional .-> Gemini[Google Gemini API]
	Express --> Logs[Activity and notification records]
```

## How the Application Works

1. Vite serves the React client during development and builds static assets for production.
2. The client calls the Express API under `/api` and sends the current user ID in the `x-user-id` header.
3. Express validates request data, applies member or admin authorization, and executes Mongoose queries.
4. MongoDB stores users, books, borrow records, favorites, notifications, and admin activity logs.
5. Borrowing changes a book from `Available` to `Borrowed` and creates a 14-day borrow record.
6. Returning a book changes the record to `Returned` and restores the book to `Available`.
7. The admin dashboard calculates live totals and circulation aggregates from MongoDB.
8. AI features call Gemini only from the server, so the API key is never sent to the browser.

## User and Admin Flows

### Application workflow

```mermaid
flowchart TD
	Start[Open application] --> Session{Saved session?}
	Session -- No --> Auth[Register or log in]
	Session -- Yes --> Home[Load library home]
	Auth --> Home
	Home --> Browse[Browse and search catalog]
	Browse --> Details[Open book details]
	Details --> Borrow{Book available?}
	Borrow -- Yes --> Borrowed[Create borrow record and notification]
	Borrow -- No --> Browse
	Home --> Favorites[Manage favorites]
	Home --> MyBooks[View borrowed books]
	MyBooks --> Return[Return book]
	Return --> Available[Book becomes available]
```

### Admin workflow

```mermaid
flowchart TD
	Login[Admin login] --> Guard{isAdmin = true?}
	Guard -- No --> Denied[Return 403 access denied]
	Guard -- Yes --> Dashboard[Admin dashboard]
	Dashboard --> Users[Manage users]
	Dashboard --> Books[Manage catalog]
	Dashboard --> Borrows[Review borrow records]
	Dashboard --> Activity[Review activity logs]
	Dashboard --> AI[Use optional AI tools]
	Users --> Log[Write activity log]
	Books --> Log
	Borrows --> Log
```

## API Reference

The base URL is `http://localhost:5000/api` in local development. Protected member endpoints expect `x-user-id`; admin endpoints additionally require that the referenced user has `isAdmin: true`.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a member account |
| POST | `/auth/login` | Public | Authenticate a member or administrator |
| GET | `/auth/me` | Member | Restore the current user |
| POST | `/auth/send-otp` | Public | Generate an OTP for password reset |
| POST | `/auth/verify-otp` | Public | Verify a password-reset OTP |
| POST | `/auth/reset-password` | Public | Set a new password |
| PUT | `/auth/profile` | Member | Update editable profile fields |

### Member operations

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/books` | List books sorted by numeric book ID |
| GET | `/books/:id` | Get a book by MongoDB ID or numeric book ID |
| POST | `/books/:id/borrow` | Borrow an available book for 14 days |
| GET | `/my-books` | List the current member's borrow records |
| PUT | `/my-books/:id/return` | Return one of the member's books |
| GET | `/favorites` | List the member's favorite books |
| POST | `/books/:id/favorite` | Add a book to favorites |
| DELETE | `/books/:id/favorite` | Remove a book from favorites |
| GET | `/notifications` | List the latest notifications |
| PUT | `/notifications/:id/read` | Mark one notification as read |
| PUT | `/notifications/read-all` | Mark all notifications as read |

### Admin operations

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/stats` | Dashboard totals and circulation aggregates |
| GET | `/admin/users` | Search and paginate users |
| POST | `/admin/users` | Create a user |
| PUT | `/admin/users/:id` | Update a user or password |
| DELETE | `/admin/users/:id` | Delete a user and related records |
| POST | `/admin/books` | Create a catalog entry |
| PUT | `/admin/books/:id` | Update a catalog entry |
| DELETE | `/admin/books/:id` | Delete a catalog entry and related records |
| GET | `/admin/borrow-records` | Search and paginate circulation records |
| PUT | `/admin/borrow-records/:id/return` | Mark a borrow as returned |
| GET | `/admin/activity-logs` | Read administrator activity history |

### AI operations

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/admin/ai/generate-description` | Generate a book description |
| POST | `/admin/ai/recommend-category` | Suggest a catalog category |
| POST | `/admin/ai/chat` | Ask the library admin assistant a question |
| GET | `/admin/ai/insights` | Generate a library health summary |

### API flow

```mermaid
sequenceDiagram
	participant UI as React Client
	participant API as Express API
	participant DB as MongoDB
	participant AI as Gemini API

	UI->>API: Request with x-user-id header
	API->>DB: Validate user and query data
	DB-->>API: User, book, or report data
	alt Admin AI request
		API->>AI: Server-side prompt with library context
		AI-->>API: Generated result
	end
	API-->>UI: JSON success or error response
```

## Database Design

### Collections

| Collection | Important fields | Relationships |
| --- | --- | --- |
| `users` | `fullName`, `email`, `passwordHash`, profile fields, `isAdmin` | Referenced by borrows, favorites, notifications, and activity logs |
| `books` | `bookId`, `title`, `author`, `category`, `availability`, metadata | Referenced by borrows and favorites |
| `borrowrecords` | `userId`, `bookId`, `borrowDate`, `dueDate`, `returnDate`, `status` | References one user and one book |
| `favorites` | `userId`, `bookId` | Unique compound index prevents duplicate favorites |
| `notifications` | `userId`, `message`, `type`, `read` | Belongs to one user |
| `activitylogs` | `adminId`, `adminName`, `action`, `target`, `details` | Records administrator actions |

### Entity relationship diagram

```mermaid
erDiagram
	USER ||--o{ BORROW_RECORD : creates
	BOOK ||--o{ BORROW_RECORD : appears_in
	USER ||--o{ FAVORITE : saves
	BOOK ||--o{ FAVORITE : is_saved
	USER ||--o{ NOTIFICATION : receives
	USER ||--o{ ACTIVITY_LOG : writes

	USER {
		ObjectId _id PK
		string fullName
		string email UK
		string passwordHash
		boolean isAdmin
	}
	BOOK {
		ObjectId _id PK
		int bookId UK
		string title
		string author
		string category
		string availability
	}
	BORROW_RECORD {
		ObjectId _id PK
		ObjectId userId FK
		ObjectId bookId FK
		date borrowDate
		date dueDate
		date returnDate
		string status
	}
	FAVORITE {
		ObjectId _id PK
		ObjectId userId FK
		ObjectId bookId FK
	}
	NOTIFICATION {
		ObjectId _id PK
		ObjectId userId FK
		string message
		boolean read
	}
	ACTIVITY_LOG {
		ObjectId _id PK
		ObjectId adminId FK
		string action
		string target
		string details
	}
```

## Authentication and Security

Current safeguards include:

- `.env`, `.env.*`, and local dependency/build directories are excluded by Git ignore rules.
- Password hashes, rather than plaintext passwords, are stored in MongoDB.
- Serialized user responses omit `passwordHash`.
- Admin endpoints use a dedicated `requireAdmin` middleware.
- Users cannot delete their own admin account through the admin API.
- User and book deletion cleans up related borrow, favorite, and notification data where applicable.
- The Gemini key is read server-side and is never exposed in client code.
- Request body limits reduce the risk of unexpectedly large JSON or form payloads.

Before production deployment, address these hardening items:

- Replace the current SHA-256 password hashing with a slow password KDF such as Argon2id or bcrypt.
- Replace the client-controlled `x-user-id` session approach with signed, expiring HTTP-only cookies or short-lived JWT access tokens with refresh-token rotation.
- Remove hard-coded development admin credentials and provision the first administrator through a secure migration or deployment secret.
- Add rate limiting, stricter CORS origins, request validation, HTTPS, CSRF protection where cookie auth is used, and centralized error monitoring.
- Keep MongoDB credentials and the Gemini key in the deployment provider's secret manager.
- Never upload `.env`, database dumps, private keys, or service-account files.

## Testing and Quality Checks

Run the available checks from the repository root:

```bash
npm run build
npm run lint
```

The build verifies that the React production bundle can be generated. The linter checks JavaScript and JSX for common problems. An integration test suite and API contract tests are recommended future additions.

## Deployment

The application can be deployed as separate frontend and API services or behind one reverse proxy.

### API deployment

1. Provision a Node.js service from the repository.
2. Set the start command to `npm run server`.
3. Configure `MONGODB_URI` with a private MongoDB Atlas connection string.
4. Configure `PORT` from the provider's injected port, if required.
5. Add `GEMINI_API_KEY` only when AI features are enabled.
6. Restrict CORS to the deployed frontend origin and enable HTTPS.

### Frontend deployment

1. Provision a static Node/Vite site.
2. Install dependencies with `npm install`.
3. Build with `npm run build`.
4. Serve the generated `dist/` directory.
5. Configure the production API base URL in the client service before building, or route `/api` through the same domain using a reverse proxy.
6. Configure SPA fallback to serve `index.html` for client-side routes.

### Deployment checklist

- [ ] Production MongoDB database and least-privilege database user configured
- [ ] Secrets stored in provider environment settings, never in Git
- [ ] Development admin seed credentials removed or replaced
- [ ] Production CORS and API URL configured
- [ ] HTTPS enabled
- [ ] Logs and health monitoring configured
- [ ] `npm run build` and `npm run lint` pass in CI

## Screenshots

The repository currently includes the application UI assets but does not yet contain a committed screenshot gallery. For a GitHub presentation, capture these views after starting the app and place optimized images in `docs/screenshots/`:

| Screenshot | Suggested filename | What it should show |
| --- | --- | --- |
| Library home | `library-home.png` | Catalog hero, search, categories, and featured books |
| Book details | `book-details.png` | Metadata, availability, borrow, and favorite actions |
| My books | `my-books.png` | Active borrow records, due dates, and return action |
| Admin dashboard | `admin-dashboard.png` | Summary cards, circulation metrics, and charts |
| Admin catalog | `admin-books.png` | Book management table and create/edit form |

Embed them in this section once captured:

```markdown
![Library home](docs/screenshots/library-home.png)
![Admin dashboard](docs/screenshots/admin-dashboard.png)
```

## Future Enhancements

- Migrate authentication to secure cookie-based sessions with refresh-token rotation.
- Use Argon2id or bcrypt with password policy and account lockout controls.
- Add automated unit, integration, and end-to-end tests.
- Add book search indexing, server-side filtering, and richer pagination.
- Add reservation queues and automatic due-date reminders.
- Add email delivery for OTPs, receipts, and overdue notices.
- Add Docker and Docker Compose configurations for repeatable local setup.
- Add CI workflows for linting, builds, dependency auditing, and deployment.
- Add image upload storage with validation and content scanning.
- Add fine-grained roles such as librarian, catalog editor, and reporting-only administrator.
- Add accessibility audits, keyboard navigation tests, and internationalization.
- Add observability with structured logs, health checks, metrics, and alerting.

## Contributing

1. Create a feature branch.
2. Keep secrets in local environment files and never commit them.
3. Run `npm run build` and `npm run lint` before opening a pull request.
4. Explain API, schema, or workflow changes in the pull request description.

## License

No license file is currently included. Add a license before accepting external contributions or distributing the project.
