# SavorSync - Restaurant Data Tracking Application

A comprehensive Next.js application for multi-location restaurant data tracking, analytics, and management.

## Features

### 🏢 Multi-Location Management

- Manage multiple restaurant locations from a single dashboard
- Real-time status monitoring and sync management
- Location-specific performance metrics

### 🔌 POS Integration

- Square POS integration with real-time webhook support
- Extensible architecture for Toast and other POS systems
- Automated data synchronization for orders, menu items, and staff

### 📊 Sales Analytics

- Comprehensive sales tracking and trend analysis
- Average Order Value (AOV) monitoring
- Order type distribution and hourly sales patterns
- Top-performing menu items analysis

### 💰 Cost Management

- Food cost percentage tracking
- Labor cost analysis by role
- Recipe-based cost calculations
- Cost variance alerts and optimization recommendations

### 🗑️ Wastage Analysis

- Track waste by ingredient and reason
- Expected vs actual usage monitoring
- Waste reduction opportunity identification
- Cost impact analysis

### 👥 Multi-Tenant Architecture

- Organization-based data isolation
- Role-based access control (Owner, Manager, Staff)
- Secure user authentication with Supabase

## Tech Stack

- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **UI Components**: ShadCN UI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **POS Integration**: Square API (extensible for others)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Square Developer account (for POS integration)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd SavorSync
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_ACCESS_TOKEN=your_square_access_token
```

4. Set up the database:

   - Create a new Supabase project
   - Run the SQL schema from `database-schema.sql` in the Supabase SQL editor
   - Enable Row Level Security (RLS) for all tables

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses a comprehensive database schema with the following key tables:

- **organizations**: Multi-tenant organization management
- **profiles**: User profiles with organization relationships
- **locations**: Restaurant locations with POS configuration
- **orders**: Order data from POS systems
- **menu_items**: Menu items and pricing
- **ingredients**: Organization-wide ingredient catalog
- **recipes**: Recipe-based cost calculations
- **wastage_records**: Waste tracking and analysis

## API Routes

### POS Integration

- `POST /api/pos/connect` - Connect POS system
- `POST /api/pos/sync` - Manual data synchronization
- `POST /api/webhooks/square` - Square webhook handler

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client configuration
│   ├── pos-integrations/ # POS integration classes
│   └── types/            # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## Key Features Implementation

### Authentication

- Supabase Auth with email/password
- Organization creation during registration
- Protected routes with middleware
- Role-based access control

### POS Integration

- Extensible architecture with base classes
- Square integration with webhook support
- Automatic data transformation and storage
- Error handling and retry logic

### Dashboard Analytics

- Real-time metrics cards
- Interactive charts with Recharts
- Location performance comparison
- Cost analysis and alerts

## Deployment

The application can be deployed to Vercel, Netlify, or any platform supporting Next.js:

1. Build the application:

```bash
npm run build
```

2. Set up environment variables in your deployment platform
3. Configure webhook URLs for POS integrations
4. Deploy the built application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
