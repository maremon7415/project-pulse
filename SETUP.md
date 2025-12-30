# ProjectPulse - Setup Guide

## Overview

ProjectPulse is a complete internal project health monitoring system with:

- JWT-based authentication with role-based access control (Admin, Employee, Client)
- Automatic health score calculation based on check-ins and risks
- Real-time project tracking and activity timelines
- MongoDB database with Mongoose ODM
- Modern UI built with Next.js 15+ and Tailwind CSS

## Prerequisites

- Node.js 18+ installed
- MongoDB instance (local or cloud like MongoDB Atlas)
- Basic understanding of Next.js and React

## Installation Steps

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/projectpulse
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/projectpulse

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Base URL (optional, for server-side API calls)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed the Database

This will create demo users and a sample project:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

After running the seed script, you can log in with:

### Admin Account

- **Email**: admin@projectpulse.com
- **Password**: admin123
- **Features**: View all projects, see system-wide metrics, access all data

### Client Account

- **Email**: client@example.com
- **Password**: client123
- **Features**: View assigned projects, submit weekly feedback

### Employee Accounts

- **Email**: sarah@projectpulse.com
- **Password**: employee123
- **Features**: View assigned projects, submit check-ins, log risks

OR

- **Email**: mike@projectpulse.com
- **Password**: employee123

## Application Features

### Health Score Algorithm

The system automatically calculates a Project Health Score (0-100) using:

**Base Score Components:**

- Client Satisfaction (40% weight) - from recent client feedback (1-5 scale)
- Employee Confidence (30% weight) - average from employee check-ins (1-5 scale)
- Schedule Progress (30% weight) - latest progress percentage

**Risk Penalties:**

- Each open "High" severity risk deducts 10 points

**Status Determination:**

- On Track: 80-100 points
- At Risk: 60-79 points
- Critical: Below 60 points

### Role-Based Dashboards

**Admin Dashboard**

- View all projects grouped by health status
- See high-risk projects and missing check-ins
- System-wide metrics and monitoring

**Employee Dashboard**

- View assigned projects
- Submit weekly check-ins (progress, confidence, blockers)
- Log and manage project risks
- Track open risks count

**Client Dashboard**

- View project health scores
- Submit weekly feedback (satisfaction, communication quality)
- See project timeline and team members

### Project Details Page

- Comprehensive health score display
- Project timeline and dates
- Team members and client information
- Activity timeline with all check-ins and risks

## Project Structure

```
projectpulse/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # Login, logout, current user
│   │   ├── projects/     # Project CRUD operations
│   │   ├── checkins/     # Check-in submissions
│   │   └── risks/        # Risk management
│   ├── admin/            # Admin dashboard
│   ├── employee/         # Employee dashboard
│   ├── client/           # Client dashboard
│   ├── projects/[id]/    # Project details page
│   ├── page.tsx          # Login page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # App header with logout
│   ├── login-form.tsx    # Login form
│   ├── project-card.tsx  # Project card component
│   ├── health-score-display.tsx
│   ├── activity-timeline.tsx
│   ├── checkin-form.tsx
│   ├── risk-form.tsx
│   └── client-feedback-form.tsx
├── lib/
│   ├── mongodb.ts        # Database connection
│   ├── auth.ts           # JWT helpers and user auth
│   ├── health-score.ts   # Health score calculation
│   └── utils.ts          # Utility functions
├── models/
│   ├── User.ts           # User model with bcrypt
│   ├── Project.ts        # Project model
│   ├── CheckIn.ts        # Check-in model
│   └── Risk.ts           # Risk model
├── scripts/
│   └── seed.ts           # Database seeding script
└── README.md             # Main documentation
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Projects

- `GET /api/projects` - List projects (filtered by role)
- `GET /api/projects/[id]` - Get project details with activity

### Check-Ins

- `POST /api/checkins` - Submit employee update or client feedback

### Risks

- `GET /api/risks` - List risks for a project
- `POST /api/risks` - Create new risk
- `PATCH /api/risks/[id]` - Update risk status

## Database Models

### User

- name, email, password (hashed with bcrypt)
- role: admin | employee | client

### Project

- name, description, dates, status, healthScore
- References: client (User), employees (User[])

### CheckIn

- type: employee_update | client_feedback
- Employee fields: progress, confidence, blockers
- Client fields: satisfaction, communication, comments

### Risk

- title, severity (Low/Medium/High), mitigation, status (Open/Resolved)
- References: project, user

## Security Features

- JWT-based authentication with HTTP-only cookies
- Bcrypt password hashing with salt
- Role-based access control on all API routes
- Protected server components with redirect
- Secure session management (7-day expiry)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   `MONGODB_URI=your_mongodb_connection_string`
   `JWT_SECRET=your_jwt_secret_key`
   `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
4. Deploy

### Other Platforms

Ensure your platform supports:

- Node.js 18+
- Environment variables
- MongoDB connection

## Troubleshooting

**Database Connection Issues**

- Verify your MONGODB_URI is correct
- For MongoDB Atlas, ensure your IP is whitelisted
- Check that the database user has proper permissions

**Authentication Problems**

- Clear browser cookies
- Verify JWT_SECRET is set
- Check that seed script ran successfully

**Missing Data**

- Run `npm run seed` to populate the database
- Check MongoDB connection in the console logs

## Next Steps

1. Customize the theme in `app/globals.css`
2. Add more projects in the seed script or via the admin panel
3. Invite real users (currently no public registration)
4. Set up automated email notifications for critical projects
5. Add export functionality for reports

## Support

For issues or questions:

- Check the README.md for detailed documentation
- Review the code comments in key files
- Ensure all environment variables are properly set
