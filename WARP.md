# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sibon Booking Buddy is a React-based booking system for Ingwelala's Sibon accommodation (max capacity: 16 guests). Built with Vite, TypeScript, and modern UI components using shadcn/ui and Tailwind CSS. The project was created with Lovable and follows their standard React + Vite template structure.

## Development Commands

### Essential Commands
- `npm i` - Install dependencies
- `npm run dev` - Start development server (http://localhost:8080)
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Development Server
The Vite dev server runs on port 8080 and binds to all interfaces (::) as configured in vite.config.ts.

## Architecture & Structure

### Core Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Routing**: React Router v6 with BrowserRouter
- **State Management**: React Query (@tanstack/react-query) for server state
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theme extensions
- **Forms**: React Hook Form with Zod validation

### Directory Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BookingHeader.tsx
│   ├── Calendar.tsx    # Main calendar component with date selection
│   └── BookingForm.tsx # Booking form with guest input
├── pages/              # Route components
│   ├── Index.tsx       # Main booking page
│   └── NotFound.tsx    # 404 page
├── lib/                # Utilities
│   └── utils.ts        # cn() utility for className merging
└── hooks/              # Custom React hooks
```

### Key Components
- **Index**: Main layout with grid (Calendar + BookingForm)
- **Calendar**: Interactive date picker with availability display
- **BookingForm**: Guest count input, notes, and booking submission
- **BookingHeader**: Hero section with background image

### Styling System
- Custom Tailwind theme with booking-specific colors:
  - `hero-brown` for branding
  - `available`/`unavailable` for calendar states
  - `selected` with border variants
- Poppins font family as default sans
- CSS custom properties (HSL values) for theming

### Component Patterns
- Functional components with TypeScript
- shadcn/ui component imports from `@/components/ui/*`
- Path alias `@/*` maps to `src/*`
- Form handling with controlled inputs
- Toast notifications using Sonner

### State Management Approach
- Local component state with useState for UI interactions
- React Query setup for potential server state (currently no API calls)
- Form state managed by React Hook Form (not yet implemented)

## Lovable Integration

This project is connected to Lovable (lovable.dev) for collaborative development. Changes made in Lovable automatically commit to this repository. The project includes:
- `lovable-tagger` for component tagging in development mode
- Auto-deployment through Lovable's platform
- Custom domain connection available through Project Settings

## Key Dependencies

### UI & Styling
- All Radix UI primitives for accessible components
- Tailwind CSS with animate plugin
- shadcn/ui component system
- Lucide React icons

### Development
- Vite with React SWC plugin for fast development
- TypeScript with relaxed settings (allowing JS, no strict null checks)
- ESLint with React hooks and refresh plugins
- PostCSS with Autoprefixer