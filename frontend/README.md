# Proudshop - E-commerce Platform

Një platformë e plotë e-commerce e ndërtuar me Next.js 14, TypeScript, dhe Tailwind CSS për Shqipërinë dhe Kosovën.

## Karakteristikat Kryesore

- 🛍️ **E-commerce e plotë** - Katalog produktesh, shporta, porositë
- 👨‍💼 **Panel administrimi** - Dashboard komplet me role të ndryshme
- 🌍 **Çmime të lokalizuara** - LEK për Shqipërinë, EUR për Kosovën (bazuar në IP)
- 🤖 **Integrimi i AI-së** - OpenAI për gjenerimin e imazheve dhe përmbajtjes
- 📧 **Sistema e email-ave** - Njoftimet dhe marketingu automatik
- 💬 **Chat support** - Sistem i integruar i suportit për klientë
- 📊 **Analitika** - Dashboard me statistika të detajuara
- 🎯 **Marketing tools** - Facebook Ads integration dhe email campaigns
- 🔒 **Siguria** - Autentifikimi dhe autorizimi i sigurt
- 📱 **Responsive design** - Funksion i plotë në të gjitha pajisjet

## Teknologjitë e Përdorura

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MongoDB
- **Authentication**: NextAuth.js with JWT
- **Payment**: Stripe integration
- **Email**: Nodemailer with SMTP
- **AI**: OpenAI GPT-4 dhe DALL-E 3
- **State Management**: React Query (TanStack Query)

## Fillimi i Shpejtë

1. **Klononi repository-n**:
```bash
git clone <repository-url>
cd onlineshop
```

2. **Instaloni dependency-t**:
```bash
npm install
```

3. **Konfiguroni environment variables**:
Kopjoni `.env.local` dhe përditësoni me të dhënat tuaja:
```bash
# Database
DATABASE_URL="mongodb://localhost:27017/proudshop"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="proudchannel2024@gmail.com"
SMTP_PASSWORD="your-email-password"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Admin Setup
ADMIN_EMAIL="proudchannel2024@gmail.com"
ADMIN_PASSWORD="lolinr123"
```

4. **Gjeneroni Prisma Client**:
```bash
npx prisma generate
```

5. **Nisni serverin e zhvillimit**:
```bash
npm run dev
```

6. **Hapni aplikacionin**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Admin Panel: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Kredencialet e Administratorit

⚠️ **SIGURIA E PARË**: Përdorni script-in e sigurisë për të krijuar admin:

```bash
node scripts/setup-admin.js
```

Ky script do të krijojë një admin me email `admin@proudshop.com` dhe një password të gjeneruar automatikisht të sigurt.

## Struktura e Projektit

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   └── page.tsx        # Homepage
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── home/           # Homepage components
│   └── layout/         # Layout components
├── lib/                # Utility libraries
│   ├── db.ts           # Database connection
│   ├── email.ts        # Email utilities
│   ├── openai.ts       # AI integration
│   └── utils.ts        # General utilities
└── prisma/
    └── schema.prisma   # Database schema
```

## Karakteristikat e Planit të Administratorit

### Super Admin (admin@proudshop.com)
- Qasje e plotë në të gjitha funksionet
- Mund të krijojë adminë të tjerë
- Menaxhon të gjitha cilësimet

### Admin të Tjerë (të krijuar nga Super Admin)
- Qasje e kufizuar vetëm në:
  - Menaxhimin e produkteve
  - Procesimin e porosive
  - Statistikat bazike

## Features të Implementuara

✅ **Frontend e-commerce komplet**
✅ **Admin dashboard me role-based access**  
✅ **Çmime të lokalizuara (AL/XK)**
✅ **Integrimi i OpenAI për AI features**
✅ **Sistema e email-ave (SMTP)**
✅ **Database schema e plotë**
✅ **Authentication & authorization**
✅ **Responsive design**

## Features në Zhvillim

🔄 **Chat support system**
🔄 **Facebook Ads integration**
🔄 **Stripe payment processing**
🔄 **Advanced analytics dashboard**
🔄 **Email marketing campaigns**
🔄 **Product reviews system**

## Kontributi

Ky projekt është ndërtuar për të ofruar një platformë të plotë e-commerce për treg shqiptar. Për çdo pyetje ose sugjerim, kontaktoni në: contact@proudshop.com

## Licensa

© 2025 Proudshop. Të gjitha të drejtat e rezervuara.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
