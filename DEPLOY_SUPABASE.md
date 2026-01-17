# Deploying TeamMAE to Supabase

This guide covers deploying the MAE Edge Function to Supabase.

## Prerequisites

- Supabase account and project
- Supabase CLI installed (`npm install -g supabase`)
- Anthropic API key

## 1. Create Supabase Project

If you haven't already:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key (Settings > API)

## 2. Link Local Project to Supabase

```bash
# Login to Supabase
supabase login

# Link to your project (from repo root)
supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is in the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

## 3. Set Edge Function Secrets

**CRITICAL: The Anthropic API key must be a secret, not an environment variable.**

```bash
# Set the Anthropic API key as a secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Verify it was set:

```bash
supabase secrets list
```

## 4. Deploy the Edge Function

```bash
# Deploy mae-build function
supabase functions deploy mae-build
```

The function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/mae-build
```

## 5. Test the Deployment

```bash
# Test with curl (replace with your project URL and a valid JWT)
curl -X POST \
  'https://YOUR_PROJECT_REF.supabase.co/functions/v1/mae-build' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"prompt": "Build a hello world app"}'
```

## Environment Variables Summary

### Supabase Edge Function Secrets (server-side, secure)

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (sk-ant-...) |

These are set via `supabase secrets set` and are NEVER exposed to the browser.

### Frontend Environment Variables (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon (public) key |

These are safe to expose in the browser.

## CORS Configuration

The Edge Function includes CORS headers for:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Access-Control-Allow-Methods: POST, OPTIONS`

For production, you may want to restrict `Access-Control-Allow-Origin` to your domain.

## Authentication

The Edge Function requires a valid JWT in the `Authorization` header:

```
Authorization: Bearer <supabase_access_token>
```

The frontend automatically includes this from the Supabase auth session.

## Troubleshooting

### Function returns 401

- Ensure user is logged in (Supabase Auth)
- Check that the JWT is being sent in the Authorization header

### Function returns 500

- Check Edge Function logs: `supabase functions logs mae-build`
- Verify `ANTHROPIC_API_KEY` secret is set correctly

### CORS errors

- Ensure your domain is allowed in CORS headers
- Check that OPTIONS preflight requests are handled

## Local Development

For local development without Supabase:

1. The frontend falls back to mock builds when Edge Function is unavailable
2. Brand enforcement and quality scoring still work locally
3. Real AI generation requires the deployed Edge Function

## Updating the Function

When you make changes to the Edge Function code:

```bash
# Re-deploy
supabase functions deploy mae-build

# Check logs
supabase functions logs mae-build --tail
```
