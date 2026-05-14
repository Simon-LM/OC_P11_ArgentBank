<!-- @format -->

# ArgentBank - Modern Banking Application Demonstration Project

> **Important Note:** The main project files are located in the [app](./app/) directory. This README provides an overview of the project.

![ArgentBank Logo](https://slm-argentbank.vercel.app/assets/argentBankLogo-DLOlZX8G.avif)

## 🏦 Project Overview

ArgentBank is a modern banking application with secure authentication, account dashboards, transaction browsing, and user profile management. Originally developed during an OpenClassrooms training, it has been significantly enhanced with TypeScript, a Vite/React frontend, a dedicated Flask API on VPS, and robust security features.

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

### API

- Flask API hosted on VPS (`https://db.lostintab.com/api`)
- PostgreSQL database managed by the API service
- Server-side CSRF storage and validation
- Server-side rate limiting via PostgreSQL advisory locks
- Username validation and sanitization on the server

## 🔒 Security Features

- CSRF Protection with unique tokens per user
- Server-side Rate Limiting via PostgreSQL advisory locks
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
cd OC_P11_ArgentBank/app

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```

### Environment Variables

Create a `.env` file inside `app/` with:

```env
# External API configuration
VITE_API_URL="https://db.lostintab.com/api"
```

The frontend does not require database, JWT, Prisma, or Redis secrets — all backend logic is handled by the Flask VPS API.

## 🧪 Test Account

You can use the following credentials to test the application:

- **Email:** [tony@stark.com](mailto:tony@stark.com)
- **Password:** password123

## 🚀 Deployment

This project is deployed on Vercel via Git integration. Every merge into `main` triggers an automatic production deployment after all CI/CD checks pass.

```bash
# Manual build
pnpm run build
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
