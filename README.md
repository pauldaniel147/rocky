# Rocky — AI Job Search Tracker

A beautiful, AI-powered job search companion built with React, Express, and Claude.

## Features

- 🌅 **Daily Digest** - AI-generated morning brief with personalized tasks
- 🎯 **Pre-Screen** - Analyze job descriptions with AI fit scoring
- 📊 **Pipeline Board** - Kanban-style job tracking with drag-and-drop
- 💬 **AI Coach** - Pipeline-aware career advisor
- 📈 **Dashboard** - Weekly insights and strategy audit

## Tech Stack

**Frontend:**
- React + Vite
- Framer Motion (animations)
- Tailwind CSS v4
- React Router

**Backend:**
- Express.js
- Anthropic Claude API (Sonnet 4)
- Vercel Serverless Functions (deployment)

## Local Development Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment

Create a \`.env\` file in the root directory:

\`\`\`env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
\`\`\`

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### 3. Run Development Servers

**Option A: Run both frontend and backend together:**

\`\`\`bash
npm run dev:all
\`\`\`

**Option B: Run separately (recommended for debugging):**

Terminal 1 - Backend:
\`\`\`bash
npm run server
\`\`\`

Terminal 2 - Frontend:
\`\`\`bash
npm run dev
\`\`\`

### 4. Open the App

Frontend: `http://localhost:5173`
Backend API: `http://localhost:3001`

## First Launch

1. **Profile Setup** - Enter your name, role, experience
2. **Daily Digest** - AI generates your personalized morning brief
3. **Pre-Screen** - Paste a job description to analyze fit

## Deployment (Vercel)

### 1. Install Vercel CLI

\`\`\`bash
npm i -g vercel
\`\`\`

### 2. Deploy

\`\`\`bash
vercel
\`\`\`

### 3. Add Environment Variable

In Vercel dashboard:
1. Go to your project settings
2. Add \`ANTHROPIC_API_KEY\` environment variable
3. Redeploy

## Project Structure

\`\`\`
Rocky/
├── src/                    # Frontend React app
│   ├── components/         # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # API client & prompts
│   └── pages/             # Route pages
├── server/                # Express backend
│   └── index.js          # API server
├── api/                   # Vercel serverless functions
│   └── claude.js         # Claude API proxy
└── vercel.json           # Vercel config
\`\`\`

## API Endpoints

### POST /api/claude

Proxy for Claude API calls (keeps API key secure on server).

**Request:**
\`\`\`json
{
  "systemPrompt": "You are Rocky...",
  "userMessage": "Generate digest",
  "maxTokens": 2000
}
\`\`\`

**Response:**
\`\`\`json
{
  "text": "AI response here"
}
\`\`\`

## Data Storage

All user data is stored in localStorage:
- \`rocky:profile\` - Name, role, experience
- \`rocky:pipeline\` - Job applications
- \`rocky:preferences\` - Fit preferences
- \`rocky:checkins\` - Daily check-in history
- \`rocky:career_story\` - Career narrative
- \`rocky:search_start\` - Search start date

**Export** your data anytime from Settings.

## Design

Based on warm editorial magazine aesthetic:
- **Colors**: Cream (#f1eadc), Terracotta (#c4784a), Near-black (#1a1714)
- **Typography**: Playfair Display (display), DM Sans (body), DM Mono (data)
- **Texture**: SVG grain overlays on all surfaces

## License

Private project. Not for distribution.
