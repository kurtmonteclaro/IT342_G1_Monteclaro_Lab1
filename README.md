# IT342_G1_Monteclaro_Lab1

## Project Overview

Full-stack user registration and authentication application with:
- **Backend**: Spring Boot REST API with JWT
- **Web**: React SPA with dark copper theme
- **Mobile**: Android app (Kotlin) with matching UI

Authentication uses **username** for login (email remains for registration/profile).

## Technology Stack

### Backend
- **Framework**: Spring Boot
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Password Encryption**: BCrypt
- **ORM**: Spring Data JPA / Hibernate
- **Language**: Java 21

### Frontend (Web)
- **Framework**: React 19 + Vite
- **Router**: React Router 6
- **HTTP Client**: Axios
- **Styling**: CSS3, dark copper theme (#0f0f12, #c67c4e), Outfit font

### Mobile
- **Platform**: Android
- **Language**: Kotlin
- **HTTP**: Retrofit + Gson
- **UI**: Material3 Dark, copper accent theme

## Project Structure

```
IT342_G1_Monteclaro_Lab1/
├── backend/                 # Spring Boot API
│   ├── src/main/java/.../
│   │   ├── controller/     # AuthController, UserController
│   │   ├── service/        # AuthenticationService, JwtTokenProvider
│   │   ├── model/          # User entity
│   │   ├── dto/            # RegisterRequest, LoginRequest, etc.
│   │   ├── repository/     # UserRepository
│   │   └── security/       # JWT filter, SecurityConfig
│   └── src/main/resources/
├── web/                    # React application
│   └── src/
│       ├── pages/          # Login, Register, Dashboard
│       ├── context/        # AuthContext
│       └── services/       # API service
├── mobile/                 # Android app
│   └── app/src/main/
│       ├── java/.../       # LoginActivity, RegisterActivity, DashboardActivity
│       ├── res/            # layouts, colors, themes
│       └── network/        # RetrofitClient, AuthApiService
└── docs/                   # Documentation
```

## Features Implemented

### Authentication
- User registration (username, email, firstName, lastName, password)
- Login with **username** and password
- JWT token storage (localStorage for web, SharedPreferences for mobile)
- Protected dashboard with profile info
- Logout

### Pages
- **Register**: First Name, Last Name, Username, Email, Password
- **Login**: Username, Password
- **Dashboard**: Username, First Name, Last Name, Email, Logout

### UI Theme
- Dark background (#0f0f12)
- Copper accent (#c67c4e)
- Outfit font (web)
- Consistent styling across web and mobile

## Setup & Installation

### Prerequisites
- JDK 21+
- Node.js 18+ and npm
- MySQL 8.0 (or XAMPP)
- Android Studio (for mobile)

### 1. Database (XAMPP)
1. Start XAMPP Control Panel
2. Start **MySQL**
3. Create database: `CREATE DATABASE it342_lab1;` (or via phpMyAdmin)

### 2. Backend
```bash
cd backend
# Edit application.properties if MySQL password differs
.\mvnw spring-boot:run
```
Backend runs on `http://localhost:8080`

### 3. Web Frontend
```bash
cd web
npm install
npm run dev
```
Web runs on `http://localhost:5173`

### 4. Mobile
1. Open **Android Studio**
2. **File → Open** → select `mobile` folder
3. Wait for Gradle sync
4. Run on emulator or device

**Note**: For a physical device, ensure it’s on the same network and update the base URL in `RetrofitClient.kt` to your PC’s IP (e.g. `http://192.168.1.x:8080/`). Emulator uses `10.0.2.2:8080`.

## API Reference

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

### Get Profile (authenticated)
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer <token>"
```

## Database Schema

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MySQL connection failed | Start XAMPP MySQL; verify credentials in `application.properties` |
| CORS errors | Backend allows `http://localhost:5173`; ensure backend is running |
| Mobile can't reach API | Emulator: use `10.0.2.2:8080`. Device: use your PC's LAN IP |
| JWT expired | Tokens last 24 hours; log in again |

## Team
- **Group**: G1
- **Member**: Monteclaro
- **Subject**: IT342
