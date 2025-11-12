# Auth System API

An authentication system built with Node.js, Express, TypeScript, and MongoDB. Features JWT access tokens with automatic refresh mechanism, role-based access control, and secure password management using bcrypt.

## Quick Start

```bash
npm install
npm start
```

Server runs on `http://localhost:3000`

## TODOS
- Add email verification support (for account creation and email confirmation)
- Implement two-factor authentication (2FA) using TOTP or SMS
- Add password reset functionality with secure reset tokens
- Implement rate limiting
- Audit logging for security events
- Proper CORS configuration

### Might add (not sure)
- Session management and device tracking
- Implement OAuth 2.0 server for third-party integrations
- Add webhook support for auth events
- Implement backup codes for 2FA recovery
- Analytics and security insights

## Architecture

Core components:
- **JWT Access Tokens**: Short-lived (15 minutes), used for API requests
- **Refresh Tokens**: Long-lived (7 days), stored in database, used to get new access tokens
- **Role-Based Access Control**: User and Admin roles with middleware protection
- **Cron Job**: Hourly cleanup of expired tokens from database

## API Endpoints

### Authentication
- `POST /auth/login` - Login user
- `POST /auth/signup` - Register new user
- `POST /auth/logout` - Logout and revoke refresh token
- `POST /auth/refresh` - Get new access token using refresh token
- `POST /auth/revoke` - Revoke refresh token

### Users
- `GET /user/` - Get all users (admin only)
- `GET /user/:id` - Get user by ID (self or admin)
- `POST /user/admin` - Create admin user (admin only)
- `PUT /user/:id` - Update user (self or admin)
- `DELETE /user/:id` - Delete user (self or admin)

## Environment variables

`.env` file in backend root:

```
DB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=2m
REFRESH_TOKEN_EXPIRY_DAYS=7
VERIFICATION_TOKEN_EXPIRY_HOURS=24
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=1
```

## Token Refresh Flow

1. User logs in and receives access token (15 minutes) and refresh token (7 days)
2. Frontend automatically refreshes access token 1 minute before expiry
3. When access token expires and user makes a request, automatic retry after refresh
4. User is never logged out unless refresh token expires or is revoked
5. Expired tokens are cleaned up hourly by cron job

## Database Schema

### User Collection
- email (unique)
- username (unique)
- password (hashed with bcrypt)
- role (user or admin)
- isVerified (boolean)
- timestamps

### Token Collection
- userId (references User)
- token (unique, random 48-byte string)
- type (refresh, verification, passwordReset)
- expiresAt (TTL index for auto-cleanup)
- timestamps

## Testing

You can test the API using tools like Postman, cURL, or any API client. The endpoints accept JSON payloads and require the access token in the Authorization header for protected routes.

Example request:
```bash
curl -X PUT http://localhost:3000/user/:id \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isVerified": true}'
```

## Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWTs signed with secret key
- Access tokens are short-lived
- Refresh tokens stored in database (not in JWT)
- Role-based access control on protected routes
- Passwords excluded from all API responses
- CORS and Helmet security headers enabled
- Validation on all inputs

## Project Structure

```
src/
  controllers/     - Request handlers
  services/        - Business logic
  models/          - MongoDB schemas
  routes/          - API routes
  middlewares/     - Auth and validation
  config/          - Configuration constants
  jobs/            - Cron jobs
  app.ts           - Express app setup
  server.ts        - Server entry point
package.json       - Dependencies
```

## Notes

- The cron job runs every hour to clean up expired tokens
- MongoDB TTL index provides additional auto-cleanup