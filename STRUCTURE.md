# TeamMAE.ai - Complete Folder Structure

```
TeamMAE/
├── README.md                           # Main documentation
├── SETUP.md                            # Setup instructions
├── STRUCTURE.md                        # This file
├── package.json                        # Root package config + scripts
├── pnpm-workspace.yaml                 # pnpm workspace config
├── turbo.json                          # Turborepo build config
├── dev.sh                              # Development startup script
├── .gitignore
│
├── apps/
│   └── web/                            # Main web application (React + Vite)
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── .env.example
│       └── src/
│           ├── main.tsx                # App entry point
│           ├── App.tsx                 # Root component
│           ├── index.css               # Global styles (Tailwind)
│           └── components/
│               └── ProjectManager.tsx  # Project management UI
│
└── packages/
    │
    ├── types/                          # Shared TypeScript types
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts                # All type definitions
    │           ├── Core Entity Types (Project, User, File, Build, etc.)
    │           ├── MAE Output Contract (STRICT JSON)
    │           ├── Build Pipeline Contracts
    │           ├── Preview Contracts
    │           └── API Request/Response Types
    │
    ├── db/                             # Supabase client + database operations
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── supabase/
    │   │   ├── schema.sql              # Database schema + RLS policies
    │   │   └── storage.sql             # Storage buckets + policies
    │   └── src/
    │       ├── index.ts                # Supabase client export
    │       ├── types.ts                # Database type definitions
    │       └── clients/
    │           ├── projects.ts         # Project CRUD operations
    │           ├── files.ts            # File CRUD operations
    │           ├── builds.ts           # Build management
    │           └── templates.ts        # Template operations
    │
    ├── mae-core/                       # MAE core functionality
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       ├── output.ts               # MAE output contract builder + validator
    │       ├── logger.ts               # Structured logging system
    │       ├── telemetry.ts            # Event tracking
    │       └── validators.ts           # Input validation utilities
    │
    └── build-pipeline/                 # Build system for web + mobile
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            ├── contracts.ts            # Builder interface definitions
            ├── web-builder.ts          # Web app builder (Vite + React)
            ├── mobile-builder.ts       # Mobile builder (Expo + EAS)
            └── preview-generator.ts    # Preview bundle generator
```

## Package Dependencies

```
@teammae/types (base package, no dependencies)
    ↓
@teammae/db (depends on types)
    ↓
@teammae/mae-core (depends on types)
    ↓
@teammae/build-pipeline (depends on types, mae-core)
    ↓
@teammae/web (depends on types, db, mae-core, build-pipeline)
```

## Key Files by Purpose

### Database Schema
- `packages/db/supabase/schema.sql` - All tables, RLS policies, triggers
- `packages/db/supabase/storage.sql` - Storage buckets (artifacts, previews, exports)

### Type Definitions
- `packages/types/src/index.ts` - Single source of truth for all types
- `packages/db/src/types.ts` - Supabase-specific database types

### Core Contracts
- `packages/types/src/index.ts` - MAEOutput, MAEFile interfaces
- `packages/mae-core/src/output.ts` - Output validation & building
- `packages/build-pipeline/src/contracts.ts` - Builder interfaces

### Business Logic
- `packages/db/src/clients/*` - Database operations
- `packages/build-pipeline/src/*-builder.ts` - Build implementations
- `packages/mae-core/src/logger.ts` - Logging system

### UI Components
- `apps/web/src/App.tsx` - Main app shell
- `apps/web/src/components/ProjectManager.tsx` - Project management UI

## Storage Strategy

### Database (`files` table)
- **Canonical source of truth** for all project source code
- Every file stored with content, path, checksum, version
- Full history via version field
- Fast queries, RLS security

### Supabase Storage Buckets
- **artifacts**: Build outputs (IPA, APK, AAB from EAS)
- **previews**: Web preview bundles (HTML + JS bundles)
- **exports**: Source code exports for download

**Rule**: Never store source files in Storage buckets - only compiled/generated artifacts

## Build Pipeline Flow

### Web Build
1. Validate project structure (package.json, index.html, src/main.tsx)
2. Check for components
3. Generate preview bundle with runtime scaffolding
4. Execute Vite build (production)
5. Upload to Storage/deploy

### Mobile Build
1. Validate project structure (package.json, app.json, App.tsx)
2. Validate app.json Expo config
3. Generate EAS build configuration
4. Submit to EAS Build service
5. Poll for completion, download artifacts

## Preview System Contracts

### Web Preview Bundle
```typescript
{
  entry_html: string;              // index.html with runtime
  files: Array<{                   // All source files
    path: string;
    content: string;
  }>;
  assets?: Array<{                 // Static assets
    path: string;
    url: string;
  }>;
}
```

**Critical**: Always includes runtime scaffolding:
- index.html with proper script tags
- src/main.tsx entry point
- package.json with dependencies
- Never relies on App.tsx alone

### Mobile Preview
- Expo Snack URL for instant preview
- QR code for device testing
- Deep link for native app preview

## MAE Output Contract (STRICT)

Every MAE response MUST follow this structure:

```typescript
{
  summary: string;                 // Required: What was built
  files: Array<{                   // Required: At least 1 file
    path: string;
    content: string;
    type?: FileType;
  }>;
  warnings?: string[];             // Optional: Non-critical issues
  meta?: {                         // Optional: Metadata
    model?: string;
    tokens?: number;
    duration_ms?: number;
    [key: string]: any;
  };
}
```

Validation enforced by `@teammae/mae-core/output.ts`

## Development Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages
pnpm dev                  # Start dev mode (all packages + web)
pnpm web                  # Run web app only
pnpm clean                # Clean build artifacts
./dev.sh                  # Build packages + start dev servers
```

## RLS Security Model

All tables have Row Level Security enabled:

- **Users**: Can only read/update own profile
- **Projects**: Full CRUD on own projects only
- **Files**: Access only via project ownership
- **Builds**: Access only via project ownership
- **Build Artifacts**: Access only via build ownership
- **Build Logs**: Read-only via build ownership
- **Templates**: Public templates readable by all
- **Integrations**: Full CRUD on own integrations only

Storage buckets follow similar patterns using user_id in path.
