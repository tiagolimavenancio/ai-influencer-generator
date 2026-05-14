# AI Influencer Generator

A web application that enables users to create, manage, and generate content with AI-powered virtual influencers for social media platforms.

## Features

- **AI Model Management** - Create and customize virtual influencer profiles
- **Content Generation** - Generate social media posts with AI-created content
- **Account Management** - Manage multiple influencer accounts from a single dashboard
- **Content Calendar** - Plan and schedule posts across platforms
- **User Authentication** - Secure sign-in with Supabase authentication

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Supabase** - Backend-as-a-service for authentication and database
- **Lucide React** - Icon library

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local` with your Supabase credentials
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/page.tsx` - Landing page
- `app/dashboard/` - Protected dashboard area
- `app/auth/` - Authentication pages

## License

MIT