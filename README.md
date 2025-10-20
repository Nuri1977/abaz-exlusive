# Abaz Exclusive

A modern e-commerce platform for Abaz Exclusive, offering premium footwear and accessories. Built with Next.js 15.2.3, this full-featured online store provides a seamless shopping experience with comprehensive product management, secure checkout, and responsive design.

![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38bdf8)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)

## About Abaz Exclusive

Abaz Exclusive is a premier footwear and accessories retailer based in North Macedonia, known for offering high-quality, fashionable products. Visit our [Instagram](https://www.instagram.com/abazexclusive/) to see our latest collections.

## Features

### Shopping Experience

- 🛍️ **Product Catalog** - Extensive collection of shoes and accessories
- 🔍 **Smart Search** - Advanced product search with filtering
- 🛒 **Shopping Cart** - Seamless checkout with multiple payment options
- 👤 **User Accounts** - Personal profiles with order history
- 💳 **Multi-Currency** - Support for MKD, EUR, and USD

### Technical Features

- 🚀 **Modern Stack** - Built with Next.js 15.2.3 for optimal performance
- 🎨 **Beautiful Design** - Responsive UI with shadcn/ui and Tailwind CSS
- 🔒 **Secure Authentication** - User accounts and admin access with Better Auth
- 📦 **Inventory Management** - Complete product and stock management
- 📧 **Order Notifications** - Automated email updates for orders

## Tech Stack

- **Framework**: Next.js 15.2.3
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui
- **Authentication**: Better Auth
- **File Storage**: UploadThing
- **Email**: React Email with Brevo

## Connect With Us

- 📷 [Instagram](https://www.instagram.com/abazexclusive/)
- 🌐 Website: [www.molinishoes.com](https://www.molinishoes.com) (Coming Soon)
- 📍 Location: North Macedonia

## For Developers

### Prerequisites

- Node.js 18.18.0 or higher
- PostgreSQL database
- Environment variables configured

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/abaz-exclusive.git
cd abaz-exclusive
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

4. Set up the database

```bash
npx prisma migrate dev
```

5. Start development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the store.

### Project Structure

```
abaz-exclusive/
├── prisma/               # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components
│   ├── lib/           # Core utilities
│   └── types/         # TypeScript definitions
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed with modern web technologies:
  - [Next.js](https://nextjs.org/)
  - [shadcn/ui](https://ui.shadcn.com/)
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Prisma](https://www.prisma.io/)
  - [Better Auth](https://better-auth.dev/)
  - [UploadThing](https://uploadthing.com/)
  - [React Email](https://react.email/)

Changed text
