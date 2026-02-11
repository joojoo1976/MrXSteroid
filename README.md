# Mr. X Steroid - Application Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Security Features](#security-features)
7. [API Endpoints](#api-endpoints)
8. [Environment Variables](#environment-variables)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)

## Overview

Mr. X Steroid is an enterprise-grade fitness and wellness application that provides users with tools for calculating macros, body fat percentage, genetic potential, and other health metrics. The application integrates with Supabase for authentication and database management, and SpaceRemit for payment processing.

## Features

- **Macro Calculator**: Calculate daily nutritional requirements based on body metrics and goals
- **Body Fat Calculator**: Estimate body fat percentage using scientifically validated formulas
- **Genetic Potential Calculator**: Estimate natural muscular potential based on skeletal measurements
- **Half-Life Visualizer**: Visual representation of steroid half-lives and optimal dosing schedules
- **Injection Map**: Interactive map for proper injection sites and techniques
- **Cycle Calendar Exporter**: Export steroid cycle schedules to calendar applications
- **Smart Lab Reference**: Comprehensive reference for interpreting lab results
- **Steroid Readiness Quiz**: Assessment to determine readiness for steroid use
- **AI-Powered Assistance**: Integration with Gemini and OpenAI for personalized recommendations
- **Multi-Language Support**: Full Arabic and English localization
- **Responsive Design**: Mobile-first responsive interface
- **Secure Authentication**: Supabase-based authentication with role management
- **Payment Integration**: Secure payment processing via SpaceRemit

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom themes
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Routing**: React Router DOM

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Payment Gateway**: SpaceRemit
- **AI Integration**: Google Gemini, OpenAI
- **Hosting**: Vercel

### Development Tools
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library
- **Linting**: ESLint with TypeScript
- **Formatting**: Prettier
- **Type Checking**: TypeScript

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/mrxsteroid.git
   cd mrxsteroid
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase and SpaceRemit credentials

5. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

The application requires the following environment variables:

#### Supabase Configuration
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### SpaceRemit Configuration
- `VITE_SPACEREMIT_PUBLIC_KEY`: SpaceRemit public key (for client-side)
- `VITE_SPACEREMIT_CALLBACK_URL`: Payment callback URL
- `VITE_PAYMENT_SUCCESS_URL`: Success redirect URL
- `VITE_PAYMENT_CANCEL_URL`: Cancel redirect URL

#### Server-Side Only (Vercel Environment Variables)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for server-side operations)
- `SPACEREMIT_SECRET_KEY`: SpaceRemit secret key (for server-side operations)
- `SPACEREMIT_WEBHOOK_SECRET`: Webhook verification secret

#### Optional AI Configuration
- `VITE_GEMINI_API_KEY`: Google Gemini API key
- `VITE_OPENAI_API_KEY`: OpenAI API key

### Database Setup

The application uses Supabase for database management. You'll need to set up the following tables:

1. `profiles` - User profile information
2. `subscriptions` - User subscription status
3. `payments` - Payment transaction records
4. `user_history` - User calculation history
5. `contact_messages` - Contact form submissions

## Security Features

### Data Protection
- All sensitive API keys are stored in environment variables and never committed to the repository
- Input validation is performed on all user inputs
- XSS protection is implemented in all HTML rendering functions
- IDOR (Insecure Direct Object Reference) protection is implemented in payment callbacks

### Authentication & Authorization
- Supabase-based authentication with secure session management
- Role-based access control (user, delegate, admin)
- Secure password requirements (minimum 8 characters, uppercase, lowercase, number, special character)
- Rate limiting for authentication attempts

### Payment Security
- Secure payment processing via SpaceRemit
- Webhook signature verification
- Transaction ID validation
- Proper authorization checks in payment callbacks

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Payments
- `POST /api/payments/create` - Create payment session
- `POST /api/payments/callback` - Payment callback handler
- `GET /api/payments/status/:id` - Get payment status

### Calculators
- `POST /api/calculators/macro` - Calculate macros
- `POST /api/calculators/body-fat` - Calculate body fat
- `POST /api/calculators/genetic-potential` - Calculate genetic potential

### User Data
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/history` - Get calculation history

## Environment Variables

### Required Variables
The following variables are required for the application to function:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SpaceRemit Configuration
VITE_SPACEREMIT_PUBLIC_KEY=your_spaceremit_public_key
VITE_SPACEREMIT_CALLBACK_URL=https://yourdomain.com/api/payments/callback
VITE_PAYMENT_SUCCESS_URL=https://yourdomain.com/success
VITE_PAYMENT_CANCEL_URL=https://yourdomain.com/cancel
```

### Server-Side Only Variables (Set in Vercel/Hosting Platform)
```env
# Server-side only (never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SPACEREMIT_SECRET_KEY=your_spaceremit_secret_key
SPACEREMIT_WEBHOOK_SECRET=your_webhook_verification_secret
```

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
- Make sure your `.env` file is in the root directory
- Verify that environment variable names match exactly (case-sensitive)
- Restart the development server after adding new environment variables

#### 2. Supabase Connection Issues
- Verify that your Supabase URL and keys are correct
- Check that your Supabase project is active
- Ensure that Row Level Security (RLS) policies are properly configured

#### 3. Payment Processing Issues
- Verify that SpaceRemit keys are correctly configured
- Check that callback URLs are properly set
- Ensure that webhook secrets are configured for verification

#### 4. Build Issues
- Run `npm run build` to check for build errors
- Verify that all dependencies are properly installed
- Check that TypeScript compilation passes

### Debugging Tips

1. Enable debug logging by adding `?debug=true` to the URL
2. Check browser console for JavaScript errors
3. Monitor network requests for API failures
4. Use the diagnostic page at `/diagnostic` to check system status

## Contributing

We welcome contributions to the Mr. X Steroid project! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm run test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Write clear, descriptive comments
- Add tests for new functionality
- Ensure all tests pass before submitting a PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Note**: This application is intended for educational purposes only. Consult with a healthcare professional before making any decisions related to fitness or health.