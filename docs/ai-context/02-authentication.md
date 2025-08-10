# Authentication System - Better Auth

## Overview

The application uses Better Auth, a modern authentication library that provides secure and flexible authentication with TypeScript support.

## Configuration

### Server Configuration (`src/lib/auth.ts`)

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        default: false,
      },
    },
  },
});
```

### Client Configuration (`src/lib/auth-client.ts`)

```typescript
export const authClient = createAuthClient({
  // Client configuration
});
```

## Features

### Email/Password Authentication

- **Registration**: User signup with email verification
- **Login**: Secure password-based authentication
- **Password Reset**: Secure password reset flow via email
- **Email Verification**: Required before account activation

### Social Authentication

- **Google OAuth**: Social login with Google
- **Extensible**: Easy to add more providers (Facebook, Twitter, etc.)

### Session Management

- **Secure Sessions**: Encrypted session cookies
- **Session Persistence**: "Remember me" functionality
- **Auto Sign-in**: Automatic sign-in after email verification

### Role-Based Access Control

- **User Roles**: Admin and regular user roles
- **Protected Routes**: Server and client-side route protection
- **Permission Checks**: Fine-grained permission system

## Authentication Flows

### Registration Flow

1. User submits registration form
2. Password is hashed with bcrypt (10 salt rounds)
3. Account created with `emailVerified: false`
4. Verification email sent automatically
5. User clicks verification link
6. Account activated and auto sign-in

### Login Flow

1. User submits credentials
2. Password verified against stored hash
3. Session created with secure cookie
4. User redirected to dashboard or intended page

### Password Reset Flow

1. User requests password reset
2. Reset token generated (1-hour expiry)
3. Reset email sent with secure link
4. User clicks link and sets new password
5. Password updated and all sessions invalidated

## Database Schema

### User Model

```prisma
model User {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified Boolean?
  image         String?
  password      String?
  isAdmin       Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  // ... other relations
}
```

### Session Model

```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
}
```

### Account Model (for social logins)

```prisma
model Account {
  id                    String    @id @default(uuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  // ... other fields
}
```

## Usage Patterns

### Server-Side Authentication

```typescript
// Get session in server components
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
// Check if user is admin
import { isAdminServer } from "@/helpers/isAdminServer";

const session = await auth.api.getSession({
  headers: await headers(),
});

const isAdmin = await isAdminServer();
```

### Client-Side Authentication

```typescript
// Use session in client components
import { authClient } from "@/lib/auth-client";
// Check if user is admin
import { useIsAdmin } from "@/helpers/isAdminClient";

const { data: session, isPending, error } = authClient.useSession();

const isAdmin = useIsAdmin();
```

### Protected Routes

```typescript
// Server-side protection
const session = await auth.api.getSession({ headers: await headers() });
if (!session) {
  redirect("/login");
}

// Admin protection
const isAdmin = await isAdminServer();
if (!isAdmin) {
  return new NextResponse("Unauthorized", { status: 401 });
}
```

## Authentication Components

### Login Form (`src/app/(pages)/(auth)/login/_components/LoginForm.tsx`)

- Email/password fields with validation
- Remember me checkbox
- Social login buttons
- Error handling and loading states
- Password visibility toggle

### Registration Form (`src/app/(pages)/(auth)/register/_components/RegisterForm.tsx`)

- Name, email, password fields
- Password confirmation validation
- Social registration options
- Success and error messaging

### Password Change (`src/app/(pages)/(protected)/dashboard/change-password/_components/ChangePasswordClient.tsx`)

- Current password verification
- New password with confirmation
- OAuth user restrictions (Google users can't change password)

## Email Templates

### Verification Email (`src/components/emails/EmailConfirmEmail.tsx`)

- Welcome message
- Account activation link
- Branded email template

### Password Reset Email (`src/components/emails/EmailResetPassword.tsx`)

- Reset instructions
- Secure reset link with token
- Expiry information

## Security Features

### Password Security

- **Hashing**: bcrypt with 10 salt rounds
- **Strength Requirements**: Minimum 8 characters
- **Secure Storage**: Never stored in plain text

### Session Security

- **Secure Cookies**: HttpOnly, Secure, SameSite attributes
- **Token Rotation**: Regular session token rotation
- **Expiry Management**: Configurable session lifetimes

### Rate Limiting

- **Login Attempts**: Protection against brute force
- **Password Reset**: Limited reset attempts per time window
- **Email Sending**: Rate limits on verification emails

## Environment Variables

```env
# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Admin Configuration
ADMIN_EMAIL=admin@example.com
```

## Type Definitions

### Better Auth Extensions (`src/types/better-auth.d.ts`)

```typescript
declare module "better-auth" {
  interface User {
    isAdmin?: boolean;
  }
}
```

### Authentication Schemas (`src/schemas/auth.ts`)

```typescript
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword);
```

## Error Handling

### Authentication Errors

- Invalid credentials handling
- Email verification requirements
- Account lockout scenarios
- OAuth provider errors

### User Feedback

- Toast notifications for success/error states
- Form validation error messages
- Loading states during authentication
- Redirect handling after authentication

## Best Practices

1. **Always use `useSession` hook** for client-side session access
2. **Server-side session checking** with proper headers
3. **Optional chaining** for all user property access
4. **Type safety** with TypeScript throughout
5. **Error boundaries** for authentication failures
6. **Secure redirects** to prevent open redirect vulnerabilities
