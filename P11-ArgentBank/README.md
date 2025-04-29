<!-- @format -->

# ArgentBank - Modern Banking Application Demonstration Project

![ArgentBank Logo](https://slm-argentbank.vercel.app/assets/argentBankLogo-DLOlZX8G.avif)

## 🏦 Project Overview

ArgentBank is a modern banking application with secure authentication and comprehensive user profile management. Originally developed during an OpenClassrooms training, it has been significantly enhanced with TypeScript, Vercel serverless functions, PostgreSQL database integration, and robust security features.

## 🌐 Live Demo

[Live Demo Link](https://slm-argentbank.vercel.app/)

## ✨ Features

- Secure Authentication System with JWT and CSRF protection
- User Profile Management with real-time validation
- Rate Limiting to protect against brute force attacks
- Session Management with automatic timeout
- Responsive Design following WCAG/RGAA accessibility guidelines
- Green IT Practices for optimized performance and reduced carbon footprint

## 🛠️ Technologies

### Frontend

- React 18 with TypeScript for type safety
- Redux Toolkit for state management
- Zod for schema validation
- SCSS & BEM for structured styling
- Vitest for unit testing

### Backend

- Vercel Serverless Functions
- PostgreSQL database hosted on VPS
- Prisma ORM for database interactions
- bcrypt for password hashing
- JWT for secure authentication

## 🔒 Security Features

- CSRF Protection with unique tokens per user
- Rate Limiting for sensitive operations
- Input Sanitization to prevent XSS attacks
- Username Blacklisting to prevent inappropriate content
- Multi-level Validation on both client and server

## 📋 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Simon-LM/OC_P11_ArgentBank
cd argentbank

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
# Database connection
DATABASE_URL="postgresql://username:password@hostname:port/database?schema=public"

# Authentication
JWT_SECRET="your_secret_key"

# Rate limiting (for production with Upstash)
KV_REST_API_URL="your_upstash_url"
KV_REST_API_TOKEN="your_upstash_token"
KV_REST_API_READ_ONLY_TOKEN="your_readonly_token"

# API configuration
VITE_API_URL="/api"
```

## 🧪 Test Account

You can use the following credentials to test the application:

- **Email:** [tony@stark.com](mailto:tony@stark.com)
- **Password:** password123

## 🚀 Deployment

This project is configured for easy deployment on Vercel:

```bash
npm run build
vercel --prod
```

## 📱 Responsive Design

ArgentBank is fully responsive and tested on various devices:

- Desktop (1920px and above)
- Tablet (768px to 1024px)
- Mobile (320px to 767px)

## ♿ Accessibility Features

ArgentBank prioritizes digital accessibility:

- WCAG 2.1 AA compliant
- Conforme aux normes RGAA (Référentiel Général d'Amélioration de l'Accessibilité)
- Proper semantic HTML structure
- Keyboard navigation support
- ARIA attributes for complex components
- Color contrasts meeting accessibility standards
- Focus management for enhanced user experience
- Screen reader friendly content and navigation

## 🌱 Green IT Practices

- Code splitting and lazy loading for reduced bandwidth
- Optimized images and assets
- Efficient CSS using BEM methodology
- Server-side caching strategies

## 👥 Author

- Developed by Simon LM : [www.simon-lm.dev](https://www.simon-lm.dev)

This project demonstrates advanced React architecture patterns, security best practices, and modern web development techniques while providing a secure and accessible banking experience.
