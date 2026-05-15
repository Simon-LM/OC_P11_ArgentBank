<!-- @format -->

# ArgentBank - Modern Banking Application Demonstration Project

![ArgentBank Logo](https://slm-argentbank.vercel.app/img/argentBankLogo.png)

## 🏦 Project Overview

ArgentBank is a modern banking application with secure authentication, account dashboards, transaction browsing, and user profile management. Originally developed during an OpenClassrooms training, it has been significantly enhanced with TypeScript, a Vite/React frontend, a dedicated Flask API, and robust security features.

## 🌐 Live Demo

[Live Demo Link](https://slm-argentbank.vercel.app/)

## ✨ Features

- Secure Authentication System with token-based sessions and CSRF protection
- User Profile Management with real-time validation
- Rate Limiting to protect against brute force attacks
- Account and transaction views backed by the external API
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

### API

- Flask API hosted separately from the frontend
- PostgreSQL database managed by the API service
- Server-side CSRF storage and validation
- Server-side rate limiting for login, profile updates, and default API traffic
- Username validation and sanitization on the server

## 🔒 Security Features

- CSRF Protection with unique tokens per user
- Server-side Rate Limiting for sensitive operations
- Input Sanitization to prevent XSS attacks
- Username Blacklisting to prevent inappropriate content
- Multi-level Validation on both client and server

## 📋 Getting Started

### Prerequisites

- Node.js 24.x and pnpm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Simon-LM/OC_P11_ArgentBank
cd argentbank

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

### Environment Variables

Create a `.env` file in the root directory with:

```env
# External API configuration
VITE_API_URL="https://db.lostintab.com/api"
```

For local development against another API instance, set `VITE_API_URL` to that API base URL. The frontend does not require database, JWT, Prisma, or Redis secrets.

## 🧪 Test Account

You can use the following credentials to test the application:

- **Email:** [tony@stark.com](mailto:tony@stark.com)
- **Password:** password123

## 🧪 Tests

```bash
# Unit tests with coverage (Vitest)
pnpm run test:coverage

# E2E tests (Cypress, headless)
pnpm run cypress:run

# Accessibility tests (Pa11y)
pnpm run pa11y

# Performance audit (Lighthouse)
pnpm run lighthouse
```

## 🚀 CI/CD & Deployment

Every push triggers the unified GitHub Actions workflow:

1. **CI tests** — ESLint, TypeScript, Vitest coverage, build
2. **Preview deployment** — Vercel preview URL created
3. **Accessibility & performance** — Pa11y, Cypress E2E, Lighthouse (blocking)
4. **Production deployment** — automatic on merge into `main` if all checks pass

The frontend is deployed on Vercel. The Flask VPS API runs independently at `https://db.lostintab.com/api`.

## 📱 Responsive Design

ArgentBank is fully responsive and tested on various devices:

- Desktop (1920px and above)
- Tablet (768px to 1024px)
- Mobile (320px to 767px)

## ♿ Accessibility Features

ArgentBank prioritizes digital accessibility:

- WCAG 2.1 AA compliant
- Compliant with RGAA standards (General Repository for Accessibility Improvement)
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
