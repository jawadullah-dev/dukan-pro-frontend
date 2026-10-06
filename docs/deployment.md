# Deployment

The starter deploys to Vercel out of the box, or anywhere Docker runs. `next.config.ts` sets `output: 'standalone'`, so production builds are optimized for self-hosting.

## Vercel (Recommended)

1. Connect the repository to Vercel
2. Add environment variables in the dashboard
3. Deploy

For other platforms, see the [Next.js deployment docs](https://nextjs.org/docs/app/getting-started/deploying).

## Environment Variables for Production

Ensure these are set in your deployment platform (Vercel → Project → Settings → Environment Variables):

| Variable | Required | Example |
| --- | --- | --- |
| `AUTH_SECRET` | **Yes** | Output of `openssl rand -base64 32` |
| `AUTH_URL` | Recommended | `https://dukan-pro-frontend.vercel.app` |
| `NEXT_PUBLIC_*` / `SENTRY_*` | Optional | Only if using Sentry |

Without `AUTH_SECRET`, sign-in redirects to `/api/auth/error` with “There is a problem with the server configuration.”

After adding vars, **Redeploy** (Deployments → … → Redeploy). Local `.env.local` is not uploaded to Vercel.

Sentry source maps are uploaded automatically in CI.

## Docker

Two production-ready Dockerfiles are included: `Dockerfile` (Node.js) and `Dockerfile.bun` (Bun). Pass `NEXT_PUBLIC_*` variables as `--build-arg` at build time and runtime secrets via `-e` at run time.

Build the image:

```bash
# Node.js
docker build \
  -t shadcn-dashboard .

# OR Bun
docker build -f Dockerfile.bun \
  -t shadcn-dashboard .
```

Run the container:

```bash
docker run -d -p 3000:3000 \
  --restart unless-stopped \
  --name shadcn-dashboard \
  shadcn-dashboard
```
