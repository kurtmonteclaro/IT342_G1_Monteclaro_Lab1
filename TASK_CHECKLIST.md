# Task Checklist - IT342 Lab 1

## Completed

### Backend
- [x] Spring Boot + Spring Security + JWT setup
- [x] MySQL configuration and JPA integration
- [x] User authentication endpoints (`/api/auth/register`, `/api/auth/login`)
- [x] JWT token generation and validation
- [x] Protected endpoint for current user (`/api/user/me`)
- [x] Pet, service, appointment, and admin endpoint implementation
- [x] Role-aware behavior for client/admin workflows
- [x] Google OAuth2 backend integration
- [x] OAuth success/failure handlers and JWT handoff to frontend
- [x] User model extension for auth provider and Google account linking

### Web Frontend
- [x] Routing with protected routes
- [x] Auth context + JWT persistence
- [x] Login/Register pages (username/password)
- [x] Google sign-in button on Login
- [x] Google sign-in button on Register
- [x] OAuth callback page (`/oauth/callback`)
- [x] Public landing page at `/`
- [x] App shell and dashboard UI refresh
- [x] Pet profiles, services, bookings, appointment history UI
- [x] Admin panel UI for approvals/settings/blocked dates
- [x] Auth page layout fix and visual consistency improvements

### Documentation
- [x] README updated with current architecture and OAuth setup
- [x] TASK_CHECKLIST updated
- [x] IMPLEMENTATION_SUMMARY updated

## In Progress
- [ ] None

## Remaining / Future Work

### Testing
- [ ] Backend unit tests for authentication and appointment logic
- [ ] Integration tests for key API flows
- [ ] Frontend component/integration tests
- [ ] End-to-end test coverage for login, booking, admin actions

### Security / Production Readiness
- [ ] Move JWT secret to environment-only configuration
- [ ] Add refresh token strategy
- [ ] Add rate limiting and auth abuse protection
- [ ] Review session/cookie strategy for OAuth production use

### Features
- [ ] Email verification and password reset
- [ ] User profile edit endpoint/UI
- [ ] Uploadable pet photo support
- [ ] Notification/reminder flow

### Documentation Deliverables
- [ ] ERD and UML updates in `/docs`
- [ ] Updated screenshots for web and mobile flows
- [ ] FRS PDF updates

## Run Checklist

1. Start MySQL and ensure `it342_lab1` exists.
2. Start backend (`cd backend`, `.\mvnw spring-boot:run`).
3. Start web (`cd web`, `npm install`, `npm run dev`).
4. For Google OAuth, configure:
   - Redirect URI: `http://localhost:8080/login/oauth2/code/google`
   - JS Origins: `http://localhost:8080`, `http://localhost:5173`
   - Env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
