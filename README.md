# AI Influencer Generator

A web application that enables users to create, manage, and generate AI-powered virtual influencers for social media content. Build virtual influencers, generate engaging posts, and schedule content across multiple platforms.

## Features

- **AI Model Management** - Create customizable virtual influencer profiles with appearance details (gender, body type, skin tone, age range, hair style, hair color, eye color, and vibe)
- **AI Image Generation** - Generate high-quality influencer images using Luma AI with customizable visual direction (scene, outfit mood, lighting, props)
- **Content Generation** - Generate social media posts with AI-created images and auto-generated captions with customizable tone, CTA, hashtags, and emoji density
- **Multi-Platform Support** - Connect and publish to Instagram, TikTok, Twitter/X, LinkedIn, Facebook, and YouTube
- **Post Scheduling** - Schedule posts for future publication or publish immediately
- **Content Calendar** - Visual calendar to plan and manage scheduled posts
- **Credit System** - Usage-based credit system for AI-generated content
- **User Authentication** - Secure sign-in with Supabase authentication
- **Subscription Management** - Stripe-powered subscription plans (Free, Pro, Enterprise)

## Technologies

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Supabase** - Backend-as-a-service for authentication, database, and storage
- **Stripe** - Payment processing for subscriptions
- **Luma AI** - Image generation API
- **Zernio** - Social media publishing and scheduling
- **Lucide React** - Icon library
- **date-fns** - Date manipulation library

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env.local` with your Supabase credentials and API keys
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `app/page.tsx` - Landing page with hero, features, and pricing
- `app/dashboard/` - Protected dashboard area
- `components/` - Reusable UI components
- `components/ui/` - shadcn/ui components
- `components/dashboard/` - Dashboard-specific components
- `context/` - React context providers (AuthContext)
- `hooks/` - Custom React hooks
- `lib/` - Utilities and database functions
- `types/` - TypeScript type definitions
- `supabase/migrations/` - Database migrations

## Database Schema

- **profiles** - User profiles with credits, subscription plan, and Stripe integration
- **models** - AI influencer models with appearance configuration and generated images
- **posts** - Generated posts with captions, images, and scheduling status
- **credit_transactions** - Credit purchase, usage, refund, and bonus transactions
- **social_accounts** - Connected social media accounts per platform

## License

MIT