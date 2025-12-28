<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`

2. Set any required environment variables.

   - IMPORTANT: This project includes `services/geminiService.ts` which expects an API key in `process.env.API_KEY` (the code uses `process.env.API_KEY`).
   - Do NOT commit your API keys. Create a local `.env` or `.env.local` file and add the key there, for example:

     API_KEY=your_gemini_key_here

   - Note: If this service is imported into client-side code, embedding the key in the frontend will expose it to users. Prefer a server-side proxy or serverless function that keeps the key secret.

3. Run the app locally (dev server):

   `npm run dev`

## Build

Create a production build:

```
npm run build
```

Preview the production build locally:

```
npm run preview
```

## Deploy (GitHub Pages via GitHub Actions)

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml` which:

- Installs dependencies
- Runs `npm run build`
- Uploads the `dist/` directory as a Pages artifact
- Deploys the artifact to GitHub Pages

Deployment is triggered automatically on push to the `master` branch. The action uses the built-in GitHub Pages deployment actions.

If your app requires secrets (such as `API_KEY`) at runtime, do not embed them into frontend builds. Instead:

- Implement a server-side API or serverless function that holds the secret and proxies requests.
- Store secrets in the repository's GitHub Secrets and reference them in actions only when strictly needed (avoid baking secrets into the frontend build).

## .gitignore

A `.gitignore` has been added to ignore `node_modules/`, `dist/`, environment files like `.env` and common editor/OS files.

## Notes & Next steps

- If you want to deploy elsewhere (Netlify, Vercel, Surge, etc.) you can adjust the workflow or use their built-in integrations.
- If you want a preview environment for pull requests, the workflow can be extended to build artifacts for PRs and post a preview URL.
