# Copilot Instructions for Proudshop

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a comprehensive e-commerce platform called "Proudshop" built with:
- **Frontend**: Next.js 14+ with TypeScript, Tailwind CSS, and App Router
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js with role-based access control
- **Payments**: Stripe integration
- **Features**: Location-based pricing, AI integration, email notifications, chat support, analytics

## Key Features to Implement
1. **Admin Dashboard** with role-based permissions
2. **Location-based pricing** (Albania LEK vs Kosovo EUR based on IP geolocation)
3. **Multi-role admin system** with restricted permissions
4. **Email notifications** using SMTP for order confirmations and status updates
5. **Chat support system**
6. **AI features** including OpenAI image generation and product descriptions
7. **Marketing tools** with email campaigns and Facebook Ads integration
8. **Analytics dashboard** with sales statistics and product performance
9. **Order management** with status tracking and inventory management

## Admin Credentials
- **Security First**: Use `node scripts/setup-admin.js` to generate secure admin credentials
- **Email**: admin@proudshop.com
- **Role**: Super Admin with full access
- **Secondary admins**: Limited access to orders, products, and sales only

## Technical Requirements
- Use TypeScript for type safety
- Implement proper error handling and validation
- Use Tailwind CSS for styling with a modern, clean design
- Implement responsive design for mobile and desktop
- Use proper SEO optimization
- Implement proper security measures and data protection

## Code Style Guidelines
- Use functional components with React hooks
- Implement proper TypeScript interfaces and types
- Use descriptive variable and function names
- Follow Next.js best practices for file structure and routing
- Use proper error boundaries and loading states
- Implement proper form validation and user feedback
