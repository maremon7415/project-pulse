# ProjectPulse

ProjectPulse is an internal project health monitoring system built with Next.js 15+, TypeScript, MongoDB, and Tailwind CSS. It provides real-time project health tracking with role-based dashboards for Admins, Employees, and Clients.

## Features

- **Role-Based Access Control**: Three distinct user roles (Admin, Employee, Client) with specific permissions and dashboards
- **Real-Time Health Scoring**: Automatic project health calculation based on multiple factors
- **Weekly Check-Ins**: Structured updates from employees and feedback from clients
- **Risk Management**: Track and manage project risks with severity levels and mitigation plans
- **Activity Timeline**: Comprehensive project history with all updates and changes

## Health Score Algorithm

The system calculates a Project Health Score (0-100) using the following formula:

### Base Score Components:

- **Client Satisfaction** (40% weight): Based on the most recent client feedback rating (1-5 scale)
- **Employee Confidence** (30% weight): Average confidence level from recent employee check-ins (1-5 scale)
- **Schedule Progress** (30% weight): Latest progress percentage reported by employees

### Risk Penalties:

- Each open "High" severity risk deducts 10 points from the base score

### Status Determination:

- **On Track**: Score 80-100
- **At Risk**: Score 60-79
- **Critical**: Score below 60

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with bcrypt password hashing
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Seed the database:

   ```bash
   npm run seed
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Demo Login Credentials

After running the seed script, use these credentials to log in:

### Admin Account

- **Email**: admin@projectpulse.com
- **Password**: admin123
- **Access**: View all projects, manage system

### Client Account

- **Email**: client@example.com
- **Password**: client123
- **Access**: View assigned projects, submit feedback

### Employee Accounts

- **Email**: sarah@projectpulse.com or mike@projectpulse.com
- **Password**: employee123
- **Access**: View assigned projects, submit check-ins and risks

## Project Structure

```
projectpulse/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   ├── admin/               # Admin dashboard
│   ├── employee/            # Employee dashboard
│   ├── client/              # Client dashboard
│   └── projects/            # Project details pages
├── components/              # React components
├── lib/                     # Utility functions
│   ├── mongodb.ts          # Database connection
│   └── health-score.ts     # Health score calculation
├── models/                  # Mongoose models
│   ├── User.ts
│   ├── Project.ts
│   ├── CheckIn.ts
│   └── Risk.ts
└── scripts/                 # Database scripts
    └── seed.ts             # Initial data seeding
```

## API Routes

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/projects` - List projects (filtered by role)
- `GET /api/projects/[id]` - Get project details
- `POST /api/checkins` - Submit check-in
- `POST /api/risks` - Create risk
- `PATCH /api/risks/[id]` - Update risk status
