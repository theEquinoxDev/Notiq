# Notiq

A full-stack notes application built with a React frontend and a Node.js/Express backend. Supports user authentication, note creation, editing, deletion, full-text search, and server-side pagination.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone the Repository](#clone-the-repository)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Backend Architecture](#backend-architecture)
  - [Entry Point](#entry-point)
  - [Database](#database)
  - [Models](#models)
  - [Middleware](#middleware)
  - [Routes](#routes)
  - [Controllers](#controllers)
  - [Error Handling](#error-handling)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Notes](#notes)
- [Frontend Architecture](#frontend-architecture)
  - [Routing and Auth](#routing-and-auth)
  - [API Client](#api-client)
  - [State Management](#state-management)
  - [Pages](#pages)
  - [Components](#components)
  - [Utilities](#utilities)
  - [Design System](#design-system)
- [Key Design Decisions](#key-design-decisions)

---

## Project Structure

```
NotesApp/
  client/                 React frontend (Vite)
    public/
      logo.jpg
    src/
      api/
        axios.js          Axios instance with interceptors
      components/
        EmptyState.jsx
        Footer.jsx
        Header.jsx
        NoteCard.jsx
        NoteModal.jsx
        ProtectedRoute.jsx
        Spinner.jsx
      context/
        AuthContext.jsx   Authentication state and actions
      hooks/
        useNotes.js       Notes data fetching and mutation
      pages/
        AuthPage.jsx      Login and register
        Dashboard.jsx     Main notes view
      utils/
        format.js         Shared date and word count helpers
      App.jsx
      index.css           Design tokens and global styles
      main.jsx
    index.html
    .env

  server/                 Express backend (TypeScript)
    src/
      config/
        db.ts             MongoDB connection
      controllers/
        auth.controller.ts
        notes.controller.ts
      middlewares/
        auth.middleware.ts
        error.middleware.ts
        rateLimit.middleware.ts
      models/
        note.model.ts
        user.model.ts
      routes/
        auth.routes.ts
        notes.routes.ts
      types/
        index.ts          Shared TypeScript types and Express augmentations
      app.ts              Express app setup
      server.ts           Server entry point
    .env
    .env.example
```

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---|---|---|
| express | ^5.2.1 | HTTP server and routing |
| mongoose | ^9.2.1 | MongoDB ODM |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT generation and verification |
| zod | ^4.3.6 | Request body validation |
| cors | ^2.8.6 | Cross-origin resource sharing |
| express-rate-limit | ^8.2.1 | Rate limiting on auth routes |
| dotenv | ^17.3.1 | Environment variable loading |
| tsx | ^4.21.0 | TypeScript execution in development |
| typescript | ^5.9.3 | Static typing |

### Frontend

| Package | Version | Purpose |
|---|---|---|
| react | ^19.2.0 | UI library |
| react-dom | ^19.2.0 | DOM rendering |
| react-router-dom | ^7.13.0 | Client-side routing |
| axios | ^1.13.5 | HTTP client |
| react-hot-toast | ^2.6.0 | Toast notifications |
| react-icons | ^5.5.0 | Icon library |
| tailwindcss | ^4.2.0 | Utility-first CSS |
| vite | ^8.0.0-beta.13 | Development server and bundler |

---

## Getting Started

### Prerequisites

- Node.js 18 or above
- A MongoDB database (local or MongoDB Atlas)

### Clone the Repository

```bash
git clone https://github.com/theEquinoxDev/Notiq.git
cd Notiq
```

### Backend Setup

```bash
cd server
npm install
```

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Run the development server:

```bash
npm run dev
```

The server starts on the port defined in `PORT` (default: `3000`).

To build for production:

```bash
npm run build
npm start
```

### Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

Run the development server:

```bash
npm run dev
```

The client runs on `http://localhost:5173` by default.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster/db` |
| `JWT_SECRET` | Secret key for signing JWTs | Any strong random string |
| `PORT` | Port the server listens on | `3000` |
| `CLIENT_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |

### Frontend (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL for all API requests | `http://localhost:3000/api/v1` |

---

## Backend Architecture

### Entry Point

`server.ts` loads environment variables with `dotenv`, connects to MongoDB via `connectDB()`, and starts Express listening on the configured port. The database connection must succeed before the server begins accepting requests — if it fails, the process exits.

### Database

`config/db.ts` exports a single async function that reads `MONGO_URI` from the environment, throws if it is missing, and calls `mongoose.connect()`. On failure it logs the error and calls `process.exit(1)` to prevent the server from running without a database.

### Models

**User (`user.model.ts`)**

| Field | Type | Notes |
|---|---|---|
| `email` | String | Required, unique, trimmed, lowercased |
| `password` | String | Required, excluded from queries by default (`select: false`) |
| `createdAt` | Date | Auto-managed by Mongoose timestamps |
| `updatedAt` | Date | Auto-managed by Mongoose timestamps |

The `select: false` on password means it is never returned in a query unless explicitly requested with `.select("+password")`. This prevents accidentally leaking hashed passwords in API responses.

**Note (`note.model.ts`)**

| Field | Type | Notes |
|---|---|---|
| `title` | String | Required, trimmed, max 200 characters |
| `content` | String | Optional, defaults to empty string |
| `userId` | ObjectId | Reference to the User model, indexed |
| `deletedAt` | Date | Null until soft-deleted, indexed |
| `createdAt` | Date | Auto-managed |
| `updatedAt` | Date | Auto-managed |

A compound text index is created on `title` and `content` to support MongoDB full-text search. The `deletedAt` field implements soft deletion — deleted notes are never removed from the database but are filtered out at the query level by checking `deletedAt: null`.

### Middleware

**`auth.middleware.ts`**

Reads the `Authorization` header, expects `Bearer <token>`. Verifies the token against `JWT_SECRET` using `jsonwebtoken`. On success, attaches the decoded payload (`{ id: string }`) to `req.user` and calls `next()`. On failure, returns `401`.

**`rateLimit.middleware.ts`**

Configured with a 15-minute window and a maximum of 50 requests per window. Applied only to the authentication routes (`/register` and `/login`) to limit brute-force attempts.

**`error.middleware.ts`**

A standard Express 4-argument error handler registered as the last middleware in `app.ts`. Any unhandled error passed to `next(err)` is caught here. It logs the HTTP method, path, and error message, then returns a consistent `500` JSON response.

### Routes

All routes are prefixed with `/api/v1`.

**Auth routes** (`/api/v1/auth`) — Rate limiting applied to both.

| Method | Path | Handler |
|---|---|---|
| POST | `/register` | `register` |
| POST | `/login` | `login` |

**Notes routes** (`/api/v1/notes`) — `authMiddleware` is applied to the router, so every route below requires a valid JWT.

| Method | Path | Handler |
|---|---|---|
| POST | `/` | `createNote` |
| GET | `/` | `getNotes` |
| GET | `/:id` | `getNoteById` |
| PATCH | `/:id` | `updateNote` |
| DELETE | `/:id` | `deleteNote` |

### Controllers

**`auth.controller.ts`**

Both `register` and `login` use Zod schemas to validate the request body before touching the database. A `ZodError` returns `400`; all other errors return `500`.

- `register`: Checks for an existing user with the same email (returns `409` if found), hashes the password with bcrypt using a salt round of 10, creates the user, generates a 7-day JWT, and returns the token and user object.
- `login`: Finds the user by email with `select("+password")`, compares the submitted password against the hash using `bcrypt.compare`, generates a JWT on success. Both "user not found" and "wrong password" return the same `401` message to prevent user enumeration.

**`notes.controller.ts`**

All note queries include `userId: req.user.id` and `deletedAt: null` to enforce user-level isolation and exclude soft-deleted notes.

- `createNote`: Validates title (required, 1–200 chars) and content (optional). Creates and returns the new note.
- `getNotes`: Accepts `page`, `limit`, and `search` query parameters. Clamps limit to a maximum of 100. If `search` is provided, uses MongoDB `$text` search. Runs the find query and a count query in parallel with `Promise.all`. Returns notes sorted by `updatedAt` descending, along with a pagination object containing `total`, `page`, `limit`, and `totalPages`.
- `getNoteById`: Finds a single note by `_id` scoped to the authenticated user. Returns `404` if not found or already deleted.
- `updateNote`: Validates the update payload (title and content are both optional). Uses `findOneAndUpdate` with `returnDocument: "after"` to return the updated document.
- `deleteNote`: Sets `deletedAt` to the current date via `findOneAndUpdate` rather than removing the document. Returns `404` if the note does not exist or is already deleted.

---

## API Reference

All responses follow this structure:

```json
{
  "success": true,
  "message": "Human-readable status",
  "data": {}
}
```

Error responses:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

### Authentication

#### POST /api/v1/auth/register

Creates a new user account.

Request body:

```json
{
  "email": "user@example.com",
  "password": "minimum6chars"
}
```

Success `201`:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "<objectId>",
      "email": "user@example.com"
    }
  }
}
```

| Status | Meaning |
|---|---|
| 201 | Account created |
| 400 | Validation failed (invalid email or password too short) |
| 409 | Email already in use |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

#### POST /api/v1/auth/login

Authenticates an existing user.

Request body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

Success `200`:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "<objectId>",
      "email": "user@example.com"
    }
  }
}
```

| Status | Meaning |
|---|---|
| 200 | Login successful |
| 400 | Validation failed |
| 401 | Invalid credentials |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

### Notes

All notes endpoints require the header:

```
Authorization: Bearer <token>
```

#### POST /api/v1/notes

Creates a new note.

Request body:

```json
{
  "title": "My Note",
  "content": "Optional body text"
}
```

Success `201`:

```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "_id": "<objectId>",
    "title": "My Note",
    "content": "Optional body text",
    "userId": "<objectId>",
    "deletedAt": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/v1/notes

Returns a paginated list of the authenticated user's notes.

Query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page (max 100) |
| `search` | string | — | Full-text search across title and content |

Success `200`:

```json
{
  "success": true,
  "message": "Notes fetched successfully",
  "data": [ /* array of note objects */ ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 12,
    "totalPages": 4
  }
}
```

Notes are sorted by `updatedAt` in descending order.

#### GET /api/v1/notes/:id

Returns a single note by ID.

Success `200`:

```json
{
  "success": true,
  "message": "Note fetched successfully",
  "data": { /* note object */ }
}
```

| Status | Meaning |
|---|---|
| 200 | Note returned |
| 401 | Missing or invalid token |
| 404 | Note not found or belongs to another user |

#### PATCH /api/v1/notes/:id

Updates a note's title and/or content. Both fields are optional.

Request body:

```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

Success `200` returns the updated note document.

| Status | Meaning |
|---|---|
| 200 | Note updated |
| 400 | Validation failed |
| 401 | Unauthorized |
| 404 | Note not found |

#### DELETE /api/v1/notes/:id

Soft-deletes a note by setting `deletedAt` to the current timestamp. The document remains in the database but is excluded from all subsequent queries.

Success `200`:

```json
{
  "success": true,
  "message": "Note deleted successfully"
}
```

| Status | Meaning |
|---|---|
| 200 | Note deleted |
| 401 | Unauthorized |
| 404 | Note not found |

---

## Frontend Architecture

### Routing and Auth

`App.jsx` sets up the React Router tree. The `/` route is wrapped in `ProtectedRoute`, which reads `AuthContext` and redirects unauthenticated users to `/auth`. While authentication state is being resolved from `localStorage`, `ProtectedRoute` renders nothing to prevent a flash of the login page.

`AuthContext.jsx` manages:
- `user` — the currently logged-in user object (`{ id, email }`)
- `token` — the JWT string from `localStorage`
- `loading` — true until the initial auth check from `localStorage` is complete

On mount, the context reads `token` and `user` from `localStorage` to restore session state without an API call. The `login`, `register`, and `logout` functions are exposed via the `useAuth` hook, which throws if used outside of `AuthProvider`.

### API Client

`api/axios.js` creates a configured Axios instance:

- `baseURL` is read from `VITE_API_URL`, falling back to `http://localhost:3000/api/v1`
- `timeout` is set to 10 seconds
- A **request interceptor** reads the JWT from `localStorage` and attaches it as `Authorization: Bearer <token>` on every outgoing request
- A **response interceptor** catches `401` responses globally: it clears `localStorage` and redirects the user to `/auth`, handling session expiry without any per-request handling

### State Management

There is no external state management library. All note-related state lives in the `useNotes` custom hook, which is consumed only by `Dashboard.jsx`.

**`hooks/useNotes.js`**

| Export | Description |
|---|---|
| `notes` | Current page of note objects |
| `pagination` | `{ total, page, limit, totalPages }` from the last API response |
| `loading` | True during any fetch |
| `page` | Current page number |
| `search` | Current search query string |
| `setPage` | Updates the page, triggering a refetch |
| `handleSearchChange` | Debounced (350ms) search input handler |
| `createNote` | POSTs a new note, optimistically prepends it to the list |
| `updateNote` | PATCHes a note and replaces it in local state |
| `deleteNote` | DELETEs a note, removes it from local state, shows a success toast |
| `fetchNoteById` | GETs a single note by ID |
| `refetch` | Re-runs the current fetch with the same page and search |

Optimistic updates for `createNote` and `deleteNote` also recalculate `totalPages` using `Math.ceil(total / limit)` so pagination controls appear and disappear immediately without requiring a page reload.

The search input is debounced inside `handleSearchChange` using `useRef` to hold the timer, avoiding unnecessary API calls while the user is still typing.

### Pages

**`AuthPage.jsx`**

Handles both login and registration via a toggle. Calls `login()` or `register()` from `AuthContext` and navigates to `/` on success. Errors from the API are displayed inline.

**`Dashboard.jsx`**

The main application view. Composes `Header`, `NoteCard`, `NoteModal`, `EmptyState`, `Footer`, and `Spinner`. Responsible for:

- Calling `useNotes` for all data
- `handleNew` — creates a note and immediately opens the modal (guarded against double-clicks with a `creating` boolean)
- `openNote` — opens the modal immediately with cached data, then fires `GET /notes/:id` in the background to silently refresh to the latest server state
- `handleUpdate` — delegates to `updateNote` and keeps `activeNote` in sync
- `handleDelete` — delegates to `deleteNote` and closes the modal if open

### Components

**`Header.jsx`**

Displays the Notiq wordmark, a debounced search input, the "New" button, and a "Sign out" link. The "New" button uses the `btn-slide` CSS class for a left-to-right fill animation on hover. It is disabled and shows a spinner while `creating` is true.

**`NoteCard.jsx`**

Renders a single note in the grid. Uses `role="button"` on the outer div to avoid invalid nested `<button>` HTML. On hover, a trash icon appears. Clicking it shows an inline confirmation bar at the bottom of the card with "Cancel" and "Delete" buttons. All click events inside the confirmation bar use `stopPropagation` so they do not trigger the card's `onClick`.

**`NoteModal.jsx`**

A full-screen overlay modal for reading and editing a note. Features:

- Auto-save: title and content changes are debounced by 700ms before firing `PATCH /notes/:id`. The save status cycles through `idle`, `saving`, and `saved`.
- Word count displayed in the toolbar.
- Last updated timestamp formatted from `updatedAt`.
- Delete with inline confirmation bar (same pattern as `NoteCard`).
- ESC key closes the modal.

**`EmptyState.jsx`**

Displayed when there are no notes. Renders different copy depending on whether a search is active (`hasSearch` prop) or the user simply has no notes yet.

**`ProtectedRoute.jsx`**

A wrapper component that redirects to `/auth` if the user is not authenticated. Renders nothing while `loading` is true.

**`Spinner.jsx`**

A simple animated loading indicator, accepting a `size` prop.

**`Footer.jsx`**

Displays "made with heart by Aditya" in DM Mono and a GitHub icon link to the repository.

### Utilities

**`utils/format.js`**

| Export | Description |
|---|---|
| `formatDate(dateStr, options?)` | Formats a date string to a short readable form (e.g. "Feb 23, 2025") |
| `formatDateTime(dateStr)` | Formats a date string with time (e.g. "Feb 23, 2025, 1:30 AM") |
| `wordCount(text)` | Returns the number of words in a string |

These are used in `NoteCard` and `NoteModal` to avoid duplicating the same formatting logic.

### Design System

All visual tokens are defined as CSS custom properties inside `@theme` in `index.css`. Tailwind v4 reads this block and generates utility classes from the token names automatically.

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#fef8ee` | Page background |
| `--color-surface` | `#fcefd8` | Card and panel backgrounds |
| `--color-border` | `#b87840` | Input borders, focused states |
| `--color-border-subtle` | `#e8cea0` | Dividers, card borders |
| `--color-ink` | `#180c04` | Primary text |
| `--color-ink-secondary` | `#4a2a10` | Secondary text |
| `--color-ink-muted` | `#8a6030` | Labels, hints |
| `--color-ink-faint` | `#c09858` | Timestamps, placeholders |
| `--color-fill` | `#c04808` | Primary action colour (buttons, selection) |
| `--color-fill-inverse` | `#fef8ee` | Text on fill-coloured backgrounds |
| `--color-danger` | `#c02818` | Destructive actions |
| `--color-danger-subtle` | `#fff2ee` | Delete confirmation backgrounds |
| `--color-success` | `#386820` | Save confirmation |
| `--font-family-sans` | DM Sans | All UI text |
| `--font-family-mono` | DM Mono | Timestamps, metadata, labels |
| `--font-family-serif` | Playfair Display | Note titles (card and modal), wordmark |

The `btn-slide` utility class creates a left-to-right fill animation on hover using a `200%`-wide CSS gradient positioned at the transparent half by default, sliding to the fill half on hover. This is a pure CSS technique with no JavaScript.

---

## Key Design Decisions

**Soft delete over hard delete.** Notes are never removed from the database. `deletedAt` is set to the current timestamp instead. This makes accidental deletion recoverable and preserves an audit trail.

**User isolation at the query level.** Every note query includes `userId: req.user.id`. A user cannot read, update, or delete another user's notes even if they know the note's ID.

**Same error message for login failures.** Whether the email does not exist or the password is wrong, the API returns `"Invalid credentials"`. This prevents an attacker from using the error message to determine whether a given email is registered.

**Zod as the single validation layer.** Input validation is handled entirely by Zod schemas in the controllers. There are no duplicate constraints in the Mongoose schema (except for database-level concerns like `unique` and `maxlength`).

**Optimistic UI with background refresh.** Opening a note shows cached data immediately (zero perceived latency), then fires `GET /notes/:id` in the background. The modal updates silently when the fresh response arrives. This covers the case where a note was edited from another session.

**JWT stored in localStorage.** The token is read on startup and attached to every request via an Axios interceptor. A global response interceptor handles token expiry by clearing storage and redirecting to the login page.

**CORS restricted to explicit origins.** The `CLIENT_URL` environment variable controls which origins the server accepts. Multiple origins can be specified as a comma-separated list. In development it falls back to `http://localhost:5173`.
