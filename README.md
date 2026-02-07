"# IT342_G1_Monteclaro_Lab1

## Project Overview
This is a full-stack web application consisting of a Spring Boot backend with authentication, a React frontend, and mobile placeholder directory. The application provides user registration, login, and a protected dashboard with user profile information.

## Technology Stack

### Backend
- **Framework**: Spring Boot 4.0.2
- **Server**: Apache Tomcat
- **Database**: MySQL 8.0
- **Security**: Spring Security with JWT (JSON Web Tokens)
- **Password Encryption**: BCrypt
- **ORM**: Spring Data JPA / Hibernate
- **Language**: Java 21

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Router**: React Router 6.24.0
- **HTTP Client**: Axios 1.6.0
- **Styling**: CSS3

## Project Structure

```
IT342_G1_Monteclaro_Lab1/
├── backend/                 # Spring Boot application
│   ├── src/main/java/      # Source code
│   │   └── com/it342/g1/backend/
│   │       ├── controller/ # REST endpoints
│   │       ├── service/    # Business logic
│   │       ├── model/      # Entity classes
│   │       ├── dto/        # Data Transfer Objects
│   │       ├── repository/ # Data access layer
│   │       └── security/   # Security configuration
│   ├── src/main/resources/ # Configuration files
│   └── pom.xml            # Maven configuration
├── web/                    # React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API services
│   │   └── assets/        # Static assets
│   └── package.json       # NPM dependencies
├── mobile/                # Mobile app placeholder
├── docs/                  # Documentation
├── README.md             # This file
└── TASK_CHECKLIST.md     # Task tracking
```

## Features Implemented

### 1. Authentication & Authorization
- User registration with email validation
- User login with JWT token generation
- BCrypt password encryption
- JWT-based authentication for protected routes
- Automatic token refresh in API calls

### 2. Backend API Endpoints

#### Authentication Endpoints
- **POST** `/api/auth/register` - Register a new user
  - Request: `{ email, password, firstName, lastName }`
  - Response: Success message or error
  
- **POST** `/api/auth/login` - Authenticate user
  - Request: `{ email, password }`
  - Response: `{ token, email, firstName, lastName }`

#### Protected Endpoints
- **GET** `/api/user/me` - Get current user profile (requires JWT token)
  - Headers: `Authorization: Bearer <token>`
  - Response: User information

### 3. Frontend Pages

#### Register Page (`/register`)
- First Name input field
- Last Name input field
- Email input field
- Password input field
- Submit button
- Link to login page
- Form validation and error handling

#### Login Page (`/login`)
- Email input field
- Password input field
- Submit button
- Link to register page
- Form validation and error handling
- Automatic redirect to dashboard on successful login

#### Dashboard/Profile Page (`/dashboard`) - Protected
- User profile information display
  - First Name
  - Last Name
  - Email
- Logout button
- Automatic authentication check

### 4. Security Features
- CORS configuration for frontend-backend communication
- JWT token validation
- Protected routes using ProtectedRoute component
- Secure password encryption with BCrypt
- Token stored in localStorage
- Automatic token attachment to API requests

## Setup & Installation

### Prerequisites
- JDK 21 or higher
- Node.js 18+ and npm
- MySQL 8.0+

### Backend Setup

1. **Configure MySQL Database**
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE it342_lab1;
   ```

2. **Update Application Configuration**
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/it342_lab1
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. **Build and Run Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd web
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

## API Testing

### 1. Register a User
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 3. Get User Profile (with token)
```bash
curl -X GET http://localhost:8080/api/user/me \
  -H "Authorization: Bearer <your_token_here>"
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development Guidelines

### Code Structure
- **Models**: Entity classes with JPA annotations
- **DTOs**: Objects for API request/response
- **Services**: Business logic implementation
- **Controllers**: REST endpoint handlers
- **Security**: JWT filter and security configuration

### Commit Strategy
- Small, descriptive commits
- Reference task numbers in commit messages
- One feature per commit when possible

## Troubleshooting

### Backend Connection Issues
- Ensure MySQL is running
- Check database credentials in application.properties
- Verify port 8080 is available

### Frontend Connection Issues
- Ensure backend is running on port 8080
- Check CORS configuration in SecurityConfig
- Clear browser cache and localStorage if needed

### JWT Token Issues
- Token expires after 24 hours
- Clear localStorage if experiencing authentication issues
- Check Authorization header format: `Bearer <token>`

## Future Enhancements
- Email verification for registration
- Password reset functionality
- User profile update endpoint
- Role-based access control (RBAC)
- Refresh token implementation
- Mobile app development
- API documentation with Swagger

## Team Information
- **Group**: G1
- **Member**: Monteclaro
- **Subject**: IT342

## License
MIT License

## Support
For issues or questions, please create an issue in the repository.
"

