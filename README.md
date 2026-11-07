# SomaLoop Journal

A morning somatic journal. Tap where your body feels tight, tender, sore or painful on a body map, add yesterday's training and your energy, and get a read-back grounded in your own log.

- **Public demo:** anyone who opens the site gets four weeks of example mornings. What they log stays in their own browser.
- **My journal:** unlocked with the owner passcode and saved on the server, so it is the same on your phone and laptop.
- **How the read-back works:** fixed rules in the page count facts from the log (recurring areas, streaks, links to training, load, energy). Claude writes the read-back from those facts and must cite them. Pain is always handled by a fixed rule, never by Claude.

## Files

```
public/index.html   the app (body map from the SomaLoop Figma file)
api/read.js         calls Claude with the hidden API key; the prompt is built here; rate limited
api/journal.js      the owner's journal (needs OWNER_KEY and Upstash Redis)
api/_lib/           small helpers (Redis client, HTTP)
package.json        tells Vercel the code uses modern JavaScript modules
```

No npm packages are needed and there is no build step.

## Deploy on Vercel (no terminal)

1. **Put the code on GitHub.** Go to github.com/new, name the repository `somaloop-journal`, and create it. On the empty repository page choose "uploading an existing file", drag in everything inside this folder (`api`, `public`, `package.json`, `README.md`) and commit. Check that `api` and `public` arrive as folders.
2. **Import into Vercel.** In Vercel choose Add New → Project, import `somaloop-journal`, keep Framework Preset as "Other", leave the build settings empty, and deploy. The site works at this point as a demo with rules-only read-backs.
3. **Add storage.** In the project open the Storage tab → Create Database → Upstash for Redis → free plan, and connect it to this project. This adds the database settings for you.
4. **Add your two secrets.** In Settings → Environment Variables add:
   - `ANTHROPIC_API_KEY`: your key from console.anthropic.com (set a monthly spending limit there first)
   - `OWNER_KEY`: a passcode you choose for your own journal
5. **Redeploy** so the settings take effect: Deployments → the latest one → ⋯ → Redeploy.
6. **Check it.** Open the site, log a demo morning and save. The read-back should say "Read by Claude". Then tap "Owner sign-in" and enter your passcode.
7. **On your phone**, open the site, sign in once with your passcode, then use Share → Add to Home Screen.

## Optional settings

| Variable | Default | What it does |
| --- | --- | --- |
| `CLAUDE_MODEL` | `claude-sonnet-5-5` | Model used for the read-back |
| `DAILY_LIMIT_PER_VISITOR` | `25` | Claude read-backs per visitor per day (the owner is not limited) |
| `DAILY_LIMIT_TOTAL` | `400` | Claude read-backs for all visitors per day |

If Claude is unavailable or a limit is reached, the page still works and shows a read-back written by the fixed rules, labelled as such.

## If something goes wrong

| What you see | Likely cause |
| --- | --- |
| "Claude isn't connected on this site yet" | `ANTHROPIC_API_KEY` missing, or you didn't redeploy after adding it |
| "Journal storage isn't set up on the server yet" | The Upstash database isn't connected to this project, or no redeploy since |
| "That passcode didn't work" | The passcode doesn't match `OWNER_KEY` exactly (it is case-sensitive) |
| A 404 page at the site address | `public` was uploaded as loose files instead of a folder |
