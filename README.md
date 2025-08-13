# Teacher Mini App

Telegram Mini App for teachers to manage grades and attendance.

## Features

- 📱 Telegram Web App integration
- 👥 Group management
- 📊 Grade and attendance tracking
- 🔔 Automatic parent notifications
- 📱 Mobile-optimized interface

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
mini-app/
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # React contexts
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

## API Integration

The app communicates with the backend API through:
- Authentication via Telegram WebApp
- JWT token-based API calls
- Real-time updates for grades and attendance

## Telegram Integration

This app is designed to work as a Telegram Mini App:
1. Create a bot with @BotFather
2. Set up Mini App URL in bot settings
3. Users access through Telegram bot

## Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_TELEGRAM_BOT_TOKEN`: Telegram bot token
- `VITE_NODE_ENV`: Environment (development/production)