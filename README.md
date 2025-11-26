# Brewly - Mob-API Auth Module

A NestJS monorepo project with a mobile API application implementing a complete authentication module, fully compatible with Vercel serverless deployment.

## Project Structure

```
brewly/
├── apps/
│   └── mob-api/                    # Mobile API application
│       ├── src/
│       │   ├── app/
│       │   │   ├── modules/
│       │   │   │   └── auth/       # Auth feature module
│       │   │   └── app.module.ts
│       │   └── main.ts
│       ├── api/
│       │   └── index.ts           # Vercel serverless handler
│       └── vercel.json             # Vercel configuration
│
├── libs/
│   ├── auth/                      # Auth library
│   ├── database/                  # Database configuration
│   ├── common/                    # Common utilities
│   ├── config/                    # Configuration management
│   ├── contract/                  # DTOs
│   ├── user/                      # User domain
│   ├── mail/                      # Email service (Nodemailer)
│   └── logger/                    # Logging
│
├── nx.json
├── tsconfig.base.json
└── package.json
```

## Features

- **Authentication**: Complete JWT-based authentication system
- **OTP via Email**: Password reset using OTP sent via Nodemailer
- **User Management**: User signup, login, profile management
- **Vercel Ready**: Fully configured for Vercel serverless deployment
- **TypeORM**: PostgreSQL database with TypeORM
- **Validation**: DTO validation with class-validator
- **Error Handling**: Global exception filter

## Tech Stack

- **NestJS** (v10.x) - Progressive Node.js framework
- **TypeScript** (v5.6.x) - Type-safe JavaScript
- **Nx** (v20.2.2) - Monorepo build system
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Database
- **JWT** - Token-based authentication
- **Nodemailer** - Email service for OTP
- **Vercel** - Serverless deployment platform

## Setup

### Prerequisites

- Node.js (v20+)
- pnpm (v10+)
- PostgreSQL (v16+)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file (create .env from .env.example)
# Configure your environment variables
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=brewly
DATABASE_SYNCHRONIZE=true
DATABASE_MAX_CONNECTIONS=10
DATABASE_SSL_ENABLED=false

# Auth
AUTH_SECRET=your-secret-key-change-in-production
AUTH_EXPIRES=7d

# Application
PORT=3000
API_PREFIX=api
NODE_ENV=development

# Mail Configuration (Nodemailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@brewly.com
MAIL_FROM_NAME=Brewly
```

### Database Setup

```bash
# Create database
createdb brewly

# Note: DATABASE_SYNCHRONIZE=true is set for development
# Set to false in production and use migrations instead
```

## Development

```bash
# Serve the application
pnpm serve:mob-api

# Build for production
pnpm build:mob-api

# Run the built application
pnpm start:mob-api
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - User registration
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

- `POST /api/v1/auth/login` - User login
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /api/v1/auth/password/reset` - Request password reset (sends OTP)
  ```json
  {
    "email": "user@example.com"
  }
  ```

- `POST /api/v1/auth/password/reset/confirm` - Confirm password reset with OTP
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }
  ```

- `GET /api/v1/auth/profile` - Get user profile (protected)
  - Requires: `Authorization: Bearer <token>`

## OTP Email Flow

1. **Password Reset Request**:
   - User requests password reset via `POST /api/v1/auth/password/reset`
   - System generates 6-digit OTP
   - OTP is stored in memory with expiration (10 minutes)
   - OTP is sent to user's email via Nodemailer
   - Response confirms email sent

2. **Password Reset Confirmation**:
   - User submits OTP and new password via `POST /api/v1/auth/password/reset/confirm`
   - System validates OTP (checks code and expiration)
   - If valid, password is updated and OTP is invalidated
   - User can now login with new password

## Vercel Deployment

### Build Settings

- **Build Command**: `pnpm build:mob-api`
- **Output Directory**: `dist/apps/mob-api`
- **Install Command**: `pnpm install`

### Environment Variables

Configure all environment variables in Vercel dashboard:
- Database connection variables
- JWT secret
- Mail/SMTP configuration

### Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

The application is configured to work as a serverless function on Vercel. The `api/index.ts` file handles the serverless function export.

## Project Structure Details

### Libraries

- **@./auth** - Authentication and authorization
- **@./database** - Database configuration
- **@./common** - Shared utilities and decorators
- **@./config** - Configuration management
- **@./contract** - DTOs and API contracts
- **@./user** - User domain
- **@./mail** - Email service with Nodemailer
- **@./logger** - Logging utilities

### Path Aliases

TypeScript path aliases are configured in `tsconfig.base.json`:

```typescript
import { AuthModule } from '@./auth';
import { DatabaseModule } from '@./database';
import { UserDto } from '@./contract';
```

## License

MIT
