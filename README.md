# TeamMAE.ai

AI-powered app builder with Web (React/Vite/Tailwind) and Mobile (React Native/Expo/EAS) support.

## Architecture

### Monorepo Structure
```
TeamMAE/
├── apps/
│   ├── web/                 # Main web app (React + Vite + Tailwind)
│   └── mobile/              # Mobile app (React Native + Expo) [TODO]
├── packages/
│   ├── types/               # Shared TypeScript types
│   ├── db/                  # Supabase client + schema
│   ├── mae-core/            # MAE output contracts, logging, telemetry
│   ├── build-pipeline/      # Web + Mobile build stubs
│   ├── shared/              # Shared utilities [TODO]
│   └── ui/                  # Shared UI components [TODO]
```

## Database Schema

### Tables
- `users` - User profiles (extends auth.users)
- `projects` - Web and mobile projects
- `files` - Project files (canonical source of truth)
- `builds` - Build records
- `build_artifacts` - IPA, APK, AAB files (stored in Supabase Storage)
- `build_logs` - Structured build logs
- `templates` - Project templates
- `integrations` - GitHub, Vercel, EAS integrations

### Storage Strategy
- **Database (`files` table)**: All source code (canonical source of truth)
- **Storage Buckets**:
  - `artifacts`: Build outputs (IPA, APK, AAB)
  - `previews`: Web preview bundles
  - `exports`: Source code exports

### RLS Policies
All tables have Row Level Security enabled. Users can only access their own data.

## Core Contracts

### MAE Output (STRICT JSON)
```typescript
{
  summary: string;
  files: Array<{ path: string; content: string; type?: FileType }>;
  warnings?: string[];
  meta?: { model?: string; tokens?: number; duration_ms?: number };
}
```

### Build Pipeline
- **Web Builder**: Validates React app, generates preview bundle
- **Mobile Builder**: Validates RN app, submits to EAS
- **Preview Generator**: Creates self-contained previews with runtime scaffolding

### Preview Contract
- Web previews ALWAYS include entry HTML + runtime files
- Never rely on App.tsx alone
- Always ensure main.tsx, package.json, index.html exist

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account

### Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up Supabase:
```bash
# Create a new Supabase project
# Run the schema:
psql <connection-string> < packages/db/supabase/schema.sql
psql <connection-string> < packages/db/supabase/storage.sql
```

3. Configure environment:
```bash
# In apps/web, create .env.local:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key

# In packages/db, create .env:
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
```

4. Run development server:
```bash
pnpm dev
```

This starts all packages in watch mode and the web app on http://localhost:3000

## Development

### Build all packages
```bash
pnpm build
```

### Run web app only
```bash
pnpm web
```

### Clean build artifacts
```bash
pnpm clean
```

## Minimal Working Flow

The current implementation includes a minimal project management flow:

1. **Create Project** - Web or Mobile
2. **Save Files** - Add files to project (stored in DB)
3. **List Files** - View all project files

This demonstrates:
- Supabase integration
- Type-safe DB operations
- File storage in database
- Basic UI with Tailwind

## Next Steps

- [ ] Build MAE prompt orchestration layer
- [ ] Add authentication (Supabase Auth)
- [ ] Implement web builder engine (Vite compilation)
- [ ] Implement mobile builder engine (EAS integration)
- [ ] Add file editor UI
- [ ] Add preview system
- [ ] Add template system
- [ ] Deploy to production

## Tech Stack

### Web App
- React 18
- Vite
- Tailwind CSS
- shadcn/ui patterns

### Mobile App
- React Native
- Expo
- EAS Build

### Backend
- Supabase (Database + Storage + Auth)
- PostgreSQL with RLS

### Build Pipeline
- Vite (web)
- EAS Build (mobile)

## License

MIT
