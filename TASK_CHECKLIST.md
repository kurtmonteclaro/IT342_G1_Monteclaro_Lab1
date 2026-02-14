# Task Checklist - IT342 Lab 1

## DONE ✅

### Backend Implementation
- [x] Add Spring Security and JWT dependencies to pom.xml
- [x] Configure MySQL database connection in application.properties
- [x] Create User entity with JPA annotations (includes username, email)
- [x] Create DTOs (RegisterRequest, LoginRequest, LoginResponse, UserDto) with username support
- [x] Create UserRepository with custom queries (findByEmail, findByUsername, existsByEmail, existsByUsername)
- [x] Implement AuthenticationService with registration and login logic (username-based login)
- [x] Create JwtTokenProvider for token generation and validation
- [x] Implement JwtAuthenticationFilter for request processing
- [x] Configure SecurityConfig with CORS and authentication rules
- [x] Create AuthController with /api/auth/register and /api/auth/login endpoints
- [x] Create UserController with /api/user/me endpoint
- [x] Add Lombok dependency and annotations

### Frontend (Web) Implementation
- [x] Add React Router and Axios dependencies to package.json
- [x] Create AuthContext for state management
- [x] Create API service with Axios interceptor for JWT tokens
- [x] Create ProtectedRoute component for route protection
- [x] Create Register page with First Name, Last Name, Username, Email, Password
- [x] Create Login page with Username and Password (username-based login)
- [x] Create Dashboard/Profile page with user info (username, firstName, lastName, email)
- [x] Create Auth.css with dark copper theme styling
- [x] Create Dashboard.css with dark copper theme styling
- [x] Update App.jsx with routing configuration
- [x] Dark copper UI theme (background #0f0f12, accent #c67c4e, Outfit font)

### Mobile App Implementation
- [x] Android project structure with Kotlin
- [x] Retrofit + Gson for API communication
- [x] AuthModels with username (RegisterRequest, LoginRequest, LoginResponse, UserDto)
- [x] AuthApiService (register, login, getCurrentUser)
- [x] LoginActivity with username-based login
- [x] RegisterActivity with username field
- [x] DashboardActivity fetching /api/user/me with profile display
- [x] Dark copper UI theme matching web
- [x] Token storage in SharedPreferences

### Documentation
- [x] Created README.md with setup instructions
- [x] Created TASK_CHECKLIST.md

## IN-PROGRESS 🔄

(None)

## TODO 📋

### Testing & Deployment
- [ ] Unit tests for authentication service
- [ ] Integration tests for API endpoints
- [ ] Frontend component testing
- [ ] End-to-end testing
- [ ] Security audit

### Documentation (FRS)
- [ ] Create Entity Relationship Diagram (ERD)
- [ ] Update UML diagrams
- [ ] Capture screenshots of Register, Login, Dashboard (web + mobile)
- [ ] Create PDFs of FRS documentation in /docs folder

### Additional Features
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] User profile update endpoint
- [ ] Role-based access control (RBAC)
- [ ] Refresh token implementation
- [ ] API documentation with Swagger/OpenAPI

### Deployment
- [ ] Set up CI/CD pipeline
- [ ] Deploy backend to cloud
- [ ] Deploy frontend to static hosting
- [ ] Configure production environment variables

## Progress Summary

**Total Tasks**: ~50
**Completed**: 35+ (70%+)
**In Progress**: 0
**To Do**: 15

## Notes

- Backend API is fully functional with JWT authentication
- Login uses **username** (not email); register includes username field
- Web and mobile share dark copper UI theme (#0f0f12 background, #c67c4e accent)
- Frontend (React) and mobile (Android) both connect to backend API
- Database schema is auto-created by Hibernate (ddl-auto=update)
- CORS configured for http://localhost:5173 (web)
- Mobile emulator uses 10.0.2.2:8080; physical device needs host machine IP

## How to Run

1. **XAMPP**: Start MySQL
2. **Backend**: `cd backend` → `.\mvnw spring-boot:run`
3. **Web**: `cd web` → `npm install` → `npm run dev`
4. **Mobile**: Open `mobile` folder in Android Studio → Run on device/emulator
