# Tater's Treats website package

This package is organized so you can replace your repo contents in one shot.

## What's included
- `index.html` - the landing page
- `api/create-checkout.js` - Vercel serverless checkout function
- `package.json` - includes the Stripe dependency
- `assets/images/hero/hero.jpg` - clean hero image without baked-in text
- `assets/images/products/` - renamed product images
- `assets/images/brand/logo-badge.png` - cleaned badge logo with transparency

## Image map
- `assets/images/hero/hero.jpg`
- `assets/images/products/pbmc.jpg`
- `assets/images/products/pumpkin.jpg`
- `assets/images/products/ginger.jpg`
- `assets/images/brand/logo-badge.png`

## Stripe notes
The page is already wired to your existing Stripe price IDs from your current site.

Current mapping in `index.html`:
- Peanut Butter Mint Carob: small / medium / large
- Pumpkin Turmeric: small / medium / large
- Peanut Butter and Ginger: small / medium / large

## Before you deploy
In Vercel, make sure this environment variable exists:
- `STRIPE_SECRET_KEY`

Optional:
- `SITE_URL` (for example `https://taters-treats.vercel.app`)

## Optional next edit
If you want a real photo of Tater in the story section, replace the image path used there with your preferred Tater photo.
