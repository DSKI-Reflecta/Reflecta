# User Management Design

## Summary

Add email/password authentication to Reflecta so each user has private journal entries, goals, and analytics. Uses JWT tokens for session management. Minimal scope: register, login, logout.

## Decisions

- **Auth method:** Email + password (hashed with bcrypt via passlib)
- **Session:** JWT access tokens stored in localStorage, 7-day expiry, no refresh token
- **Scope:** Register, login, logout only. No password reset, email verification, or profile management.
- **Migration:** Wipe existing DB (dev data only). No migration scripts needed.
- **Libraries:** python-jose[cryptography], passlib[bcrypt]

## Backend

### New: UserModel

Table `users`:
- `id` - Integer, primary key, indexed
- `email` - String, unique, indexed, non-nullable
- `hashed_password` - String, non-nullable
- `created_at` - DateTime, defaults to UTC now

### Modified: JournalEntryModel and GoalModel

Both tables gain a `user_id` column:
- Integer, ForeignKey("users.id"), non-nullable
- Relationship back to UserModel

The `journal_goal_association` table is unchanged (scoped implicitly through parent records).

### New: Auth module (`app/auth/`)

- `app/auth/__init__.py` - empty
- `app/auth/passwords.py` - `hash_password(plain)` and `verify_password(plain, hashed)` using passlib bcrypt context
- `app/auth/tokens.py` - `create_access_token(user_id, email)` returns a signed JWT with `sub` = user_id, `email` claim, `exp` = now + 7 days. `decode_access_token(token)` returns payload or raises.
- `app/auth/dependencies.py` - `get_current_user` FastAPI dependency: extracts token from `Authorization: Bearer <token>` header via `OAuth2PasswordBearer(tokenUrl="auth/login")`, decodes it, looks up user in DB, returns UserModel instance. Raises 401 if invalid/expired.

### New: Auth routes (`app/routes/auth.py`)

Router prefix: `/auth/`

- `POST /auth/register` - Body: `{email, password}`. Validates email format, checks uniqueness, hashes password, creates user, returns `{access_token, token_type: "bearer"}`.
- `POST /auth/login` - Body: `{email, password}`. Verifies credentials, returns `{access_token, token_type: "bearer"}`. Returns 401 on bad credentials.
- `GET /auth/me` - Requires auth. Returns `{id, email, created_at}`.

### Modified: Existing routes

All handlers in journal.py, goal.py, chatbot.py, analytics.py gain `current_user: UserModel = Depends(get_current_user)`.

All CRUD operations filter by `user_id = current_user.id`. Create operations set `user_id` on new records.

### Configuration

JWT secret key loaded from environment variable `JWT_SECRET_KEY`. Added to `.env`.

## Frontend

### New: AuthContext (`src/context/AuthContext.js`)

React context providing:
- `user` - current user object or null
- `token` - JWT string or null
- `login(email, password)` - calls POST /auth/login, stores token in localStorage, sets user state
- `register(email, password)` - calls POST /auth/register, stores token, sets user state
- `logout()` - clears localStorage token, sets user/token to null

On mount, checks localStorage for existing token and validates via GET /auth/me. If invalid/expired, clears it.

### Modified: api.js

All fetch calls include `Authorization: Bearer <token>` header when a token exists in localStorage. Add a helper that reads the token and attaches it. On 401 response, clear stored token and redirect to login.

### New: LoginPage (`src/components/pages/LoginPage.js`)

Single page with two tabs: "Login" and "Sign Up". Each tab has email + password fields and a submit button. Displays error messages on failure. Styled with the existing brand design system (purple palette, DM Sans, card class).

### Modified: App.js

Wraps app in `AuthProvider`. Conditionally renders:
- If no token/user: show LoginPage
- If authenticated: show the existing sidebar + content layout

### Modified: Sidebar

Add a logout button at the bottom. Calls `logout()` from AuthContext.

## Security Considerations

- Passwords hashed with bcrypt (passlib auto-handles salt)
- JWT signed with HS256 using a strong secret key
- Token expiry enforced server-side on every request
- User can only access their own data (enforced at query level)
- No sensitive data in JWT payload (only user_id and email)
