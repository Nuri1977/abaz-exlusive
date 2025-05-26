# Molini Shoes

A production-ready Next.js template with authentication, UI components, and essential tooling pre-configured to help you build modern web applications faster.

![Next.js Template](https://img.shields.io/badge/Next.js-15.2.3-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)

## Features

- 🔒 **Authentication System** - Complete authentication with Better Auth, including login, registration, password reset, and email verification
- 🎨 **UI Components** - Beautiful, accessible components built with shadcn/ui, Radix UI and Tailwind CSS
- 🗄️ **Database Integration** - Preconfigured with Prisma ORM and PostgreSQL support
- 👤 **User Management** - Complete user profile and settings system
- 🔐 **Role-Based Access Control** - Admin and user roles with appropriate access restrictions
- 📁 **File Uploads** - Integrated with UploadThing for easy file uploads and management
- 📧 **Email Templates** - Ready-to-use email templates for authentication flows and contact forms
- 📱 **Responsive Design** - Mobile-first responsive design for all pages and components
- 🏎️ **Performance Optimized** - Built with Next.js 15.2 features for optimal performance
- 🧪 **Type Safety** - Full TypeScript support throughout the codebase

## Tech Stack

- **Framework**: Next.js 15.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui & Radix UI
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better Auth
- **Form Handling**: React Hook Form + Zod
- **File Uploads**: UploadThing
- **Icons**: Lucide Icons
- **Charts**: Recharts (optional)
- **Email**: React Email

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- PostgreSQL database (or use a service like Neon.tech)

### Installation

1. Clone this repository to create a new project

```bash
git clone https://github.com/yourusername/my-nextjs-template.git my-project
cd my-project
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your database connection string and other required variables.

4. Set up the database with Prisma

```bash
npx prisma migrate dev --name init
```

5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
my-nextjs-template/
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/             # App router pages and API routes
│   │   ├── (pages)/      # Website pages organized by access level
│   │   ├── api/          # API routes
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── emails/       # Email templates
│   │   ├── shared/       # Reusable components
│   │   └── ui/           # shadcn/ui components
│   ├── helpers/          # Helper functions
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library code, utilities
│   ├── services/         # Service layer (API clients)
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── .env.example          # Example environment variables
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Authentication

This template uses Better Auth for authentication with the Prisma adapter. The auth system includes:

- Email/password authentication
- Remember me functionality
- Password reset flow
- Account verification
- Protected routes
- Role-based access control
- User sessions management

## Custom Components

The template includes a set of custom components on top of shadcn/ui:

- Custom upload button for file uploads
- Logo component
- Header with responsive navigation
- Footer with customizable links
- And more...

## Database Setup

The template is configured to work with PostgreSQL by default. The Prisma schema includes models for:

- User accounts
- User profiles
- Authentication sessions
- And more...

## Deployment

This template is ready for deployment to platforms like Vercel, Netlify, or your custom server.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Better Auth](https://better-auth.dev/)
- [UploadThing](https://uploadthing.com/)
- [React Email](https://react.email/)
