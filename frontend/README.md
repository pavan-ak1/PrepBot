# Job Prep Frontend

A modern React + TypeScript frontend for the Job Prep interview preparation platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## Features

- User authentication (login/register)
- Interview report generation with AI
- Interactive interview sessions
- Real-time answer evaluation
- Comprehensive results and feedback
- Responsive design with dark theme

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend services running (see backend README)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── GenerateReport.tsx
│   ├── InterviewSession.tsx
│   └── Results.tsx
├── services/       # API services
│   ├── api.ts
│   └── auth.ts
├── types/          # TypeScript type definitions
│   └── index.ts
├── lib/            # Utility functions
│   └── utils.ts
├── App.tsx         # Main application component
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## API Integration

The frontend communicates with the following backend services:

- **User Service** (port 8080) - Authentication
- **JobPrep Service** (port 8081) - Interview report generation
- **Interview Session Service** (port 8082) - Interactive sessions

## Features Overview

### Authentication
- User registration with username, email, and password
- Secure login with JWT tokens
- Token-based authentication with automatic logout

### Dashboard
- Overview of available features
- Quick access to report generation
- Navigation to interview sessions

### Interview Report Generation
- Upload resume (PDF)
- Provide job description
- Optional self-description
- AI-powered analysis and question generation

### Interview Session
- Interactive question flow
- Real-time answer evaluation
- Progress tracking
- Immediate feedback on answers

### Results
- Overall score display
- Detailed feedback breakdown
- Strengths and weaknesses analysis
- Personalized improvement plan
- Communication and technical feedback

## Development Notes

- The frontend uses Vite's proxy configuration to handle CORS during development
- All API calls include JWT authentication headers
- Token expiration is handled with automatic redirect to login
- Responsive design works on mobile, tablet, and desktop
