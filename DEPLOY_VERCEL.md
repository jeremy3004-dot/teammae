# Deploying TeamMAE to Vercel

This guide covers deploying the TeamMAE frontend to Vercel.

## Prerequisites

- Vercel account
- GitHub repo with TeamMAE code
- Supabase project set up (see DEPLOY_SUPABASE.md)

## 1. Import Project to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your GitHub repository

## 2. Configure Build Settings

In the Vercel project settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `apps/web` |
| **Build Command** | `pnpm build` |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |

### Important: pnpm Monorepo Configuration

Since TeamMAE is a pnpm monorepo, ensure Vercel can build all packages:

1. In project settings, set **Root Directory** to `apps/web`
2. The build will automatically use the workspace packages

## 3. Set Environment Variables

In Vercel project settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (your anon key) | Production, Preview, Development |

**IMPORTANT:** Do NOT add `VITE_ANTHROPIC_API_KEY`. The Anthropic API key is stored only in Supabase Edge Function secrets.

## 4. Deploy

1. Push to your main branch, or
2. Click "Deploy" in Vercel dashboard

## 5. Verify Production

After deployment:

1. Open your Vercel URL
2. Open browser DevTools > Network tab
3. Submit a build request
4. Verify the request goes to:
   ```
   https://YOUR_PROJECT.supabase.co/functions/v1/mae-build
   ```
5. Verify NO requests to `api.anthropic.com` from the browser (this would indicate a security issue)

## Environment Variables Summary

### Required in Vercel

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_SUPABASE_URL` | `https://abc123.supabase.co` | Found in Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Public/anon key, safe for browser |

### NOT in Vercel (Security)

| Variable | Where It Lives |
|----------|----------------|
| `ANTHROPIC_API_KEY` | Supabase Edge Function secrets ONLY |

## Build Optimization

### Recommended vercel.json (optional)

Create `apps/web/vercel.json`:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

### Enable Edge Caching

For static assets, Vercel automatically handles caching. For API responses, the Edge Function should set appropriate cache headers.

## Troubleshooting

### Build fails with "workspace package not found"

Ensure your `pnpm-workspace.yaml` includes all packages:
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Build fails with TypeScript errors

Run locally first:
```bash
pnpm build
```

### Edge Function calls fail with CORS

1. Check Supabase Edge Function CORS headers
2. Ensure `Access-Control-Allow-Origin` includes your Vercel domain
3. For production, update the Edge Function to allow your specific domain

### Builds return mock output instead of real AI output

1. Verify Edge Function is deployed: `supabase functions list`
2. Verify `ANTHROPIC_API_KEY` secret is set: `supabase secrets list`
3. Check Edge Function logs: `supabase functions logs mae-build`
4. Verify user is authenticated (check browser console for auth errors)

## Domain Configuration

1. In Vercel, go to Settings > Domains
2. Add your custom domain
3. Update Supabase Edge Function CORS to allow your domain
4. Update any hardcoded URLs in your code

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings to monitor:
- Build times
- Error rates
- Performance metrics

### Edge Function Logs

Monitor Supabase Edge Function health:
```bash
supabase functions logs mae-build --tail
```

## Rollback

If a deployment causes issues:

1. Go to Vercel > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"
