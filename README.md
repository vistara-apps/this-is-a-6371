# Enrichly - CRM Data Enrichment Platform

Enrichly is a web application designed to help early-stage founders and solo builders automatically enrich their CRM data and automate follow-up sequences.

## 🚀 Features

### Core Features
- **Automated Prospect Data Enrichment**: Automatically finds and adds missing contact information to CRM records
- **Intelligent Lead Scoring**: AI-powered lead scoring and prioritization using OpenAI
- **Automated Follow-up Cadences**: Create and automate multi-step follow-up sequences
- **CRM Data Health Monitoring**: Identifies data quality issues and suggests improvements

### Technical Features
- **Modern React Architecture**: Built with React 18, React Router, and Context API
- **Real-time Database**: Supabase integration for authentication and data persistence
- **AI Integration**: OpenAI GPT-3.5 for intelligent lead scoring and data enrichment
- **Payment Processing**: Stripe integration for subscription management
- **Dark Theme UI**: Professional dark theme with Tailwind CSS
- **Responsive Design**: Mobile-first responsive design

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **AI**: OpenAI GPT-3.5 Turbo
- **Payments**: Stripe
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Stripe account (for payments)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-6371.git
cd this-is-a-6371
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Update `.env` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=your-openai-api-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# App Configuration
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=Enrichly

# Feature Flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_PAYMENTS=true
```

### 4. Database Setup

Create the following tables in your Supabase database:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'Free',
  crm_integration_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Records table
CREATE TABLE crm_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crm_provider TEXT,
  external_id TEXT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin_profile TEXT,
  enriched_data JSONB,
  lead_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'new',
  last_contacted TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrichment Jobs table
CREATE TABLE enrichment_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  records_processed INTEGER DEFAULT 0,
  records_enriched INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follow-up Cadences table
CREATE TABLE follow_up_cadences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_condition TEXT,
  steps JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cadence Steps table
CREATE TABLE cadence_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cadence_id UUID REFERENCES follow_up_cadences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'email' or 'task'
  content TEXT,
  delay_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_cadences ENABLE ROW LEVEL SECURITY;
ALTER TABLE cadence_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own CRM records" ON crm_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own CRM records" ON crm_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CRM records" ON crm_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CRM records" ON crm_records FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, Modal, etc.)
│   ├── AppShell.jsx    # Main app layout
│   ├── Header.jsx      # App header
│   └── Sidebar.jsx     # Navigation sidebar
├── pages/              # Page components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── CRMRecords.jsx  # CRM records management
│   ├── LeadScoring.jsx # Lead scoring interface
│   ├── FollowUpCadences.jsx # Cadence management
│   ├── DataHealth.jsx  # Data quality monitoring
│   └── Login.jsx       # Authentication
├── services/           # API service layers
│   ├── authService.js  # Authentication service
│   ├── enrichmentService.js # Data enrichment
│   └── leadScoringService.js # Lead scoring
├── context/            # React Context providers
│   └── AppContext.jsx  # Global app state
├── config/             # Configuration files
│   └── api.js          # API configuration
└── App.jsx             # Main app component
```

## 🔧 API Integration

### Supabase Setup

1. Create a new Supabase project
2. Run the database setup SQL (see above)
3. Get your project URL and anon key from Settings > API
4. Update your `.env` file

### OpenAI Setup

1. Get an API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file
3. Monitor usage to control costs

### Stripe Setup

1. Create a Stripe account
2. Get your publishable key from the dashboard
3. Set up products and pricing in Stripe dashboard
4. Add webhook endpoints for subscription events

## 🎨 Design System

The app uses a comprehensive design system with:

- **Colors**: Primary, accent, background, surface, text colors
- **Typography**: Display, heading, body text styles
- **Components**: Button, Card, Modal, Input, DataTable, etc.
- **Spacing**: Consistent spacing scale (xs, sm, md, lg)
- **Shadows**: Card and modal shadows
- **Motion**: Smooth transitions and animations

## 🔐 Authentication

The app uses Supabase Auth with:

- Email/password authentication
- User profile management
- Row Level Security (RLS) for data protection
- Session management
- Password reset functionality

## 📊 Data Model

### User
- `id`: UUID (primary key)
- `email`: User email
- `subscription_tier`: Free/Pro/Business
- `crm_integration_token`: For CRM integrations

### CRM Record
- `id`: UUID (primary key)
- `user_id`: Foreign key to users
- `name`: Contact name
- `company`: Company name
- `email`: Contact email
- `phone`: Phone number
- `linkedin_profile`: LinkedIn URL
- `enriched_data`: JSON object with additional data
- `lead_score`: Calculated score (0-100)
- `status`: Lead status (new, qualified, hot, etc.)

### Enrichment Job
- `id`: UUID (primary key)
- `user_id`: Foreign key to users
- `status`: Job status (pending, running, completed, failed)
- `records_processed`: Number of records processed
- `records_enriched`: Number of records successfully enriched

### Follow-up Cadence
- `id`: UUID (primary key)
- `user_id`: Foreign key to users
- `name`: Cadence name
- `trigger_condition`: When to trigger the cadence
- `steps`: JSON array of cadence steps

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment

```bash
# Build the Docker image
docker build -t enrichly .

# Run the container
docker run -p 3000:3000 enrichly
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Monitoring

- **Error Tracking**: Integrate with Sentry for error monitoring
- **Analytics**: Add Google Analytics or Mixpanel
- **Performance**: Monitor Core Web Vitals
- **API Usage**: Monitor OpenAI and Supabase usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

- [ ] Advanced CRM integrations (Salesforce, HubSpot, Pipedrive)
- [ ] Email automation with SendGrid/Mailgun
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Advanced AI features (GPT-4, custom models)

---

Built with ❤️ for early-stage founders and solo builders.
