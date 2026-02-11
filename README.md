# Mr. X Steroid Application

## Overview
The Mr. X Steroid application is a comprehensive fitness and wellness platform designed to help users track their fitness journey, calculate macros, body fat percentage, and genetic potential. The application features advanced security, performance optimizations, and a rich user experience.

## Features
- **Fitness Calculators**: Macro calculator, body fat calculator, genetic potential calculator
- **AI Integration**: Advanced AI chat for fitness guidance
- **User Authentication**: Secure login and registration system
- **Progress Tracking**: Comprehensive progress monitoring
- **Social Features**: Challenges, leaderboards, and community features
- **Payment Integration**: Secure payment processing
- **Multilingual Support**: Arabic and English interfaces

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **UI Components**: Radix UI, Framer Motion
- **AI Integration**: Google Gemini, OpenAI
- **Build Tool**: Vite

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account for backend services

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MrXSteroid
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Supabase credentials and other API keys.

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

The application requires the following environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment Gateway (SpaceRemit)
VITE_SPACEREMIT_PUBLIC_KEY=your_public_key
VITE_SPACEREMIT_CALLBACK_URL=your_callback_url

# AI Services (Optional)
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests (when implemented)

## Project Structure

```
src/
├── components/          # Reusable UI components
├── features/            # Feature-specific modules
│   ├── auth/           # Authentication components
│   ├── calculators/    # Fitness calculators
│   └── chat/          # AI chat functionality
├── services/           # Business logic services
├── utils/             # Utility functions
├── lib/               # Third-party integrations
├── types/             # Type definitions
├── context/           # React context providers
├── security/          # Security enhancements
├── testing/           # Testing framework
└── features/
    └── rewards-social/ # Rewards and social features
```

## Key Enhancements Added

### 1. Security Enhancements
- Enhanced authentication with rate limiting
- Input validation and sanitization
- Session management improvements
- Security event logging

### 2. Performance Optimizations
- Debounce and throttle utilities
- Memoization for expensive calculations
- Lazy loading for images
- Virtual scrolling for large lists
- Performance monitoring tools

### 3. User Experience Improvements
- Rich notification system
- Progress tracking with visualization
- Personalization settings
- Achievement and rewards system
- Reminder scheduling

### 4. Database & Infrastructure
- Query optimization with caching
- Batch operations for efficiency
- Real-time synchronization
- Automated backup system
- Data cleanup utilities

### 5. Testing Framework
- Unit testing capabilities
- Integration testing
- Performance testing
- Mock utilities
- Custom assertion library

### 6. New Features
- Challenge system for community engagement
- Social posting and interaction
- Leaderboards and rankings
- Gamification elements

## API Integration

### Supabase Setup
The application uses Supabase for authentication, database, and real-time features. Make sure to set up your Supabase project and configure the environment variables accordingly.

### AI Integration
The application supports both Google Gemini and OpenAI for AI-powered features. Configure the appropriate API keys in your environment variables.

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Write clear, concise comments
- Maintain consistent formatting

### Security
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Encrypt sensitive data

### Performance
- Implement caching strategies
- Optimize database queries
- Use lazy loading where appropriate
- Monitor performance metrics

### Testing
- Write unit tests for critical functions
- Test edge cases and error conditions
- Verify performance under load
- Ensure cross-browser compatibility

## Deployment

### Building for Production
```bash
npm run build
```

### Deployment Options
- Vercel (recommended)
- Netlify
- Any static hosting service
- Self-hosted Node.js server

## Troubleshooting

### Common Issues
1. **Environment Variables**: Ensure all required environment variables are set
2. **Supabase Connection**: Verify your Supabase credentials and project settings
3. **CORS Errors**: Check your Supabase project's CORS settings
4. **API Limits**: Be aware of API rate limits for AI services

### Getting Help
- Check the documentation in `DOCUMENTATION.md`
- Review the source code and inline comments
- Contact the development team for support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

For more detailed technical information, see the `DOCUMENTATION.md` file.