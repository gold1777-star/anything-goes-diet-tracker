# Anything Goes Diet — Companion & Progress Tracker

A single-file web app that helps you follow and track your progress with the
principles in *The Anything Goes Diet* weight-loss manual by John Barban.

It's a private, personal tracker: **all your data (weigh-ins, food log, lists,
measurements, etc.) is stored only in your own browser** via `localStorage`. It
is never sent anywhere. Use the in-app **Export** button to keep a JSON backup.

## What's inside

| File | Purpose |
| --- | --- |
| `index.html` | The entire app — HTML, CSS and JavaScript in one self-contained file. No build step, no dependencies. |
| `middleware.js` | Vercel Edge Middleware that password-gates the site with HTTP Basic Auth. |
| `vercel.json` | Vercel config (clean URLs). |

## Features

Each of the book's 10 principles is a working tool:

- **Today** — dashboard with your daily calorie target, weekly weight average, and wins.
- **Weigh-In** *(Think Weekly)* — daily weight log with a 7-day rolling average, trend chart, and weekly-average table, so daily noise is ignored.
- **Targets** — a transparent calorie estimator using a conservative metabolic estimate, the **reverse taper** (larger deficit when you have more fat to lose, easing as you lean out), and **calorie guessing**.
- **Food Log** — intake logging with optional +15% calorie-guessing markup, tracked against your minimums.
- **My Lists** — Hot Button / Can Do Without / Can't Do Without.
- **Win the Week** *(Goals)* — a sticker calendar, win streaks, and non-food rewards.
- **My Team** *(The Roster)* — supporters plus a tough-love emergency contact.
- **Progress** *(All About You)* — monthly measurements and clothes-fit notes.
- **The Book** — summaries of all 10 principles, the science behind them, and a FAQ.

## Running locally

It's just a static file — open `index.html` in any browser, or serve the folder
with any static server:

```
npx serve .
```

## Deploying (with a password)

This deploys on [Vercel](https://vercel.com) as a password-protected site:

1. Import this repository into Vercel (**Add New… → Project → Import**).
2. In the project's **Settings → Environment Variables**, add:
   - `SITE_PASSWORD` — the password you want to require (**required**).
   - `SITE_USER` — optional username (defaults to `agd`).
3. Deploy. The Edge Middleware will prompt for the username/password before
   serving the app. The password lives only in Vercel's settings, never in this
   repo.

## Disclaimer

An independent study & tracking companion inspired by the principles in *The
Anything Goes Diet* by John Barban. Not affiliated with, endorsed by, or a
substitute for the original program. Educational tool only — not medical or
nutritional advice. Consult a healthcare professional before starting any
weight-loss plan.

## Food search (USDA FoodData Central)

The **Food Log** has a "Search foods" box powered by the USDA FoodData Central
database (hundreds of thousands of foods). It calls the serverless function
`api/food-search.js`, which keeps the API key server-side (out of this repo).

To enable it:
1. Get a free API key (~1 min) at https://fdc.nal.usda.gov/api-key-signup.html
2. In the Vercel project → **Settings → Environment Variables**, add:
   - `USDA_API_KEY` = your key
3. Redeploy. Until the key is set, the search box shows a friendly "not set up
   yet" message and manual food entry still works.

## Meal Plan

The **Meal Plan** tab generates a flexible weekly plan from the built-in food
database, scaling portions toward your calorie target while clearing your
protein/fiber minimums. It includes an optional **food-combining** mode that
builds each meal as either a starch meal (starchy carbs + veg/fruit) or a
protein/fat meal (protein/fat + veg/fruit), never mixing the two.
