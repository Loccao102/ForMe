# ForMe

> **A normal bio felt boring. So I built this instead.**

Interactive 2D self-introduction / dating-profile alternative. The page is designed as a ~90 second story instead of a normal About page.

## Current story

1. Boring dating bio — real facts
2. Work / software
3. Self-growth
4. Football / badminton / running
5. Coffee + work café
6. Reading / curiosity
7. Deep conversations
8. Cooking for people I care about
9. Reality check / imperfect side
10. Ending — “You know Lộc 7%”

The three personal photos currently used by the prototype are embedded directly in the app so the repo can run immediately without an external image host.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Contact button

Before publishing, copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_CONTACT_URL=https://...
```

This can point to Instagram, Messenger, another social profile, or any preferred chat link.

## Design direction

- mobile-first
- full-screen 10-scene story
- scroll snap + scroll-driven animation
- real photos mixed with illustrated 2D UI
- playful / warm / a little self-aware
- minimal “resume language”
- content should be inferred from scenes instead of explained in paragraphs

Built with Next.js + TypeScript + CSS.
