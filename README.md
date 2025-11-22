# TinyLink - URL Shortener

A modern URL shortener web application built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Create Short Links**: Shorten long URLs with optional custom codes
- **URL Validation**: Ensures all URLs are valid before saving
- **Global Code Uniqueness**: Custom codes must be unique across all users
- **Click Tracking**: Automatically tracks total clicks and last clicked time
- **Redirect**: HTTP 302 redirects to original URLs
- **Delete Links**: Remove links (returns 404 after deletion)
- **Dashboard**: View all links in a sortable, filterable table
- **Statistics**: View detailed stats for individual links
- **Health Check**: System health and uptime monitoring

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Hosting**: Compatible with Vercel, Render, Railway

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Neon)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd New_project_aganitha
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your database URL:
```
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

- `GET /api/links` - List all links
- `POST /api/links` - Create a new link (returns 409 if code exists)
- `GET /api/links/:code` - Get stats for a specific code
- `DELETE /api/links/:code` - Delete a link
- `GET /healthz` - Health check endpoint

## Routes

- `/` - Dashboard (list, add, delete links)
- `/code/:code` - Statistics page for a specific link
- `/:code` - Redirect to original URL (302) or 404 if not found
- `/healthz` - Health check

## Code Rules

- Codes must follow the pattern: `[A-Za-z0-9]{6,8}`
- Custom codes are globally unique
- URLs must be valid HTTP/HTTPS URLs

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy!

### Railway

1. Create a new project
2. Add PostgreSQL service
3. Add Node.js service
4. Connect your repository
5. Set environment variables
6. Deploy!

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_BASE_URL` - Base URL of your application

## License

MIT

