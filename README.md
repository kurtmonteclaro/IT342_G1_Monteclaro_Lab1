# IT342_G1_Monteclaro_Lab1

## Project Overview

Full-stack veterinary scheduling system with:
- **Backend**: Spring Boot REST API (JWT + Google OAuth)
- **Web**: React + Vite (responsive dashboard and public landing page)
- **Mobile**: Android app (Kotlin)

Core users:
- **Client** (pet owner): manage pets, book appointments, track status
- **Admin**: review requests, manage clinic settings and blocked dates

## Technology Stack

### Backend
- Java 21
- Spring Boot 4.0.2
- Spring Security + JWT
- Spring OAuth2 Client (Google sign-in)
- Spring Data JPA / Hibernate
- MySQL

### Web Frontend
- React 19 + Vite
- React Router
- Axios
- Custom CSS styling (pet-owner focused dark warm theme)

### Mobile
- Kotlin
- Retrofit + Gson
- Material3 dark theme

## Project Structure

```text
IT342_G1_Monteclaro_Lab1/
|- backend/
|  |- src/main/java/com/it342/g1/backend/
|  |  |- controller/
|  |  |- service/
|  |  |- security/
|  |  |- model/
|  |  |- repository/
|  |  |- dto/
|  |- src/main/resources/application.properties
|- web/
|  |- src/
|  |  |- pages/
|  |  |- components/
|  |  |- context/
|  |  |- services/
|- mobile/
|- docs/
|- README.md
|- TASK_CHECKLIST.md
|- IMPLEMENTATION_SUMMARY.md
```

## Implemented Features

### Authentication
- Register with username/email/password
- Login with username/password
- JWT-based protected API access
- Google OAuth login flow integrated into web login/register pages
- Auto account creation/linking for Google-authenticated users

### Web
- Public landing page at `/`
- Login and Register pages with Google button
- Protected dashboard with sidebar shell
- Pet profile management (create, update, delete)
- Service listing
- Appointment booking, cancellation, rescheduling
- Appointment history
- Admin panel for approvals and clinic settings

### Backend API
- `/api/auth/register`
- `/api/auth/login`
- `/api/user/me`
- `/api/pets/**`
- `/api/services`
- `/api/appointments/**`
- `/api/admin/**`
- OAuth endpoints: `/oauth2/authorization/google`, `/login/oauth2/code/google`

## Setup

## 1) Prerequisites
- JDK 21+
- Node.js 18+
- MySQL running locally

## 2) Database
Create database:

```sql
CREATE DATABASE it342_lab1;
```

## 3) Backend

Update `backend/src/main/resources/application.properties` as needed for your MySQL credentials.

Run:

```bash
cd backend
.\mvnw spring-boot:run
```

Backend default URL: `http://localhost:8080`

## 4) Web

```bash
cd web
npm install
npm run dev
```

Web default URL: `http://localhost:5173`

## Google OAuth Setup (Web)

Create a Google OAuth **Web application** client and configure:

- **Authorized redirect URI**:
  - `http://localhost:8080/login/oauth2/code/google`
- **Authorized JavaScript origins**:
  - `http://localhost:8080`
  - `http://localhost:5173`

Keep secrets out of git. Use environment variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

`application.properties` already supports env placeholders:

- `spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID:replace-me}`
- `spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET:replace-me}`

## Notes

- Do not commit real OAuth client secret values.
- CORS is configured for `http://localhost:5173`.
- Hibernate is set to `ddl-auto=update`.

## Recent Major Updates

- `b4a50fd`: web landing page + visual refresh
- `0565107`: Google OAuth login flow + auth UI polish
