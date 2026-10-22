# Digital Library Management System

A full-stack digital library web application built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

The base URL is `http://localhost:5000/api` in local development. Protected member endpoints expect `x-user-id`; admin endpoints additionally require that the referenced user has `isAdmin: true`.

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Create a member account |
| POST | `/auth/login` | Public | Authenticate a member or administrator |
| GET | `/auth/me` | Member | Restore the current user |
| POST | `/auth/send-otp` | Public | Generate an OTP for password reset |
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

## Testing and Quality Checks

Run the available checks from the repository root:

```bash
npm run build


The build verifies that the React production bundle can be generated. The linter checks JavaScript and JSX for common problems. An integration test suite and API contract tests are recommended future additions.
| Screenshot | Suggested filename | What it should show |
| --- | --- | --- |
| Library home | `library-home.png` | Catalog hero, search, categories, and featured books |
| Book details | `book-details.png` | Metadata, availability, borrow, and favorite actions |
| My books | `my-books.png` | Active borrow records, due dates, and return action |
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
