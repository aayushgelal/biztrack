# BizTrack — Business Earnings Dashboard

A modern, mobile-first business dashboard built with **Next.js 14**, **Prisma**, and **Supabase**. Track your daily and monthly earnings, manage device subscriptions, and get insights with beautiful charts.

---

## ✨ Features

- 📊 **Dashboard** — Daily & monthly earnings with live charts
- 📋 **Records** — Add, filter, search, and manage all transactions
- 📈 **Reports** — Advanced analytics with category breakdowns
- 💳 **Subscriptions** — Track device subscriptions, days remaining, renew plans
- ⚙️ **Settings** — Manage devices and account info
- 📱 **Mobile-first PWA** — Works great on phone browsers
- 🔐 **Simple Auth** — Username + password, JWT-based

---

## 🚀 Quick Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. In Project Settings → Database, copy the connection strings
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
JWT_SECRET="your-random-secret-at-least-32-chars"
```

### 3. Set up database
```bash
# Push schema to Supabase
npm run db:push

# (Optional) Seed with demo data
npm run db:seed
```

### 4. Run the app
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Demo login** (if seeded): `demo` / `demo123`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # Login/register/logout
│   │   ├── earnings/      # Earning records CRUD
│   │   ├── records/       # Records with filters + device management
│   │   └── subscription/  # Subscription management
│   ├── dashboard/
│   │   ├── page.tsx       # Main dashboard
│   │   ├── records/       # Transaction records
│   │   ├── reports/       # Analytics & charts
│   │   ├── subscription/  # Subscription management
│   │   └── settings/      # Account & device settings
│   ├── login/             # Auth page
│   └── layout.tsx
├── components/
│   ├── charts/            # Recharts components
│   ├── layout/            # Sidebar navigation
│   └── ui/                # StatCard, AddRecordModal, etc.
├── lib/
│   ├── auth.ts            # JWT auth utilities
│   ├── prisma.ts          # DB client
│   └── utils.ts           # Helpers, formatters, chart generators
└── types/                 # TypeScript types
```

---

## 🔌 Device Integration (API)

Devices can post earnings directly via the API:

```bash
# Add earning from device
POST /api/earnings
Content-Type: application/json
Cookie: biztrack_token=<token>

{
  "amount": 49.99,
  "category": "Sales",
  "deviceId": "device-id-here",
  "description": "Product sale"
}
```

---

## 📱 Mobile / PWA

The app is designed for mobile use. To install on phone:
1. Open in mobile browser
2. Tap "Add to Home Screen"
3. App opens in full-screen mode

---

## 🛠 Tech Stack

| Tech | Purpose |
|------|---------|
| Next.js 14 (App Router) | Framework |
| TypeScript | Type safety |
| Prisma | ORM |
| Supabase (PostgreSQL) | Database |
| Tailwind CSS | Styling |
| Recharts | Charts |
| bcryptjs + jsonwebtoken | Auth |
| react-hot-toast | Notifications |
| date-fns | Date utilities |
| lucide-react | Icons |
