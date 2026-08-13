# Devlog Style And Structure Brief

Use this as a copy-paste brief for adapting the Fantasy Portfolio devlog style to another small web app.

## Intent

Create a quiet, text-first development log for a small personal web app. It should feel like a working notebook that has been cleaned up for readers: direct, chronological, lightweight, and honest about decisions. Avoid marketing-page energy. The goal is to help someone understand what the app is, why it exists, what choices shaped it, and what changed over time.

## Information Architecture

Use three main pages:

1. Main / Devlog
   - This is the default page.
   - It shows the app title, short tagline, one concise description, and a visual metaphor if useful.
   - Below that, it is purely chronological posts.
   - Posts should be date + optional tag + title + text.
   - Add images only when they support the story or show real progress.

2. Goal
   - This is the stable "why" page.
   - It should explain the core promise, differentiation, and intended feeling.
   - Keep the intro tight and specific.
   - Separate marketing-style differentiation from practical gameplay or product mechanics.
   - Suggested sections:
     - Intro: what makes this app special.
     - Gameplay / How it works: concrete mechanics.
     - Requirements: constraints the product should honor.
     - Open questions: unresolved product questions.

3. Decisions
   - This is the stable "how and why not" page.
   - It should capture durable technical choices, product tradeoffs, and rules of iteration.
   - Suggested sections:
     - Intro: what this page protects.
     - Technical: architecture choices, listed plainly.
     - Do's / Don'ts: side-by-side working rules and avoided paths.
     - Timeline: playful but readable project phases.
     - Recent commits: grouped by phase, flat list, no cards.

Keep the main nav minimal:

- Left: app name / logo, Goal, Decisions.
- Right: primary action button, usually "Play" or "Open app".
- Do not include "Devlog" as a separate nav item if the devlog is the default page.
- Header should be flat and non-sticky.

## Visual Style

The style is quiet, mono, and lightly editorial.

- Light mode by default.
- Max content width around 800px.
- Body padding around 20px desktop, 16px mobile.
- Use a monospace font with warmth, such as Inconsolata.
- Small type: body around 16px / 1.4 line-height.
- Headings are not oversized. Use the same approximate size as body text, with color and spacing doing the hierarchy.
- Use one brand tint consistently. Fantasy Portfolio uses purple:
  - Accent: `#8839ef`
  - Hover: `#6d4aff`
  - Soft tint: `#f0e9ff`
  - Soft border: `#d8c8ff`
- Neutral background and text:
  - Page background: `#f7f8fb`
  - Soft surface: `#eef0f6`
  - Hairline divider: `#d2d5e0`
  - Main text: `#363a4f`
  - Heading text: `#2b2f43`
  - Muted text: `#9498ab`
- Use hairline dividers between major sections instead of cards.
- Avoid decorative cards unless the content truly needs framing.
- Code tags can be small inline pills with a quiet surface and border.

## Header Pattern

The header should feel like a document header, not an app chrome bar.

- Flat, non-sticky top bar.
- Left side: small logo mark and app name, then secondary links.
- Right side: one filled rounded action button.
- Keep spacing consistent across all pages so the content does not visually jump between routes.
- The active nav item is plain dark text; inactive items are muted.
- The primary action uses the brand tint as a filled button.

## Hero Pattern

Use the hero as a compact project summary, not a giant landing page.

Main page:

- App name.
- One-line tagline.
- One short paragraph.
- Optional visual metaphor beside it on desktop, stacked below on mobile.

Goal / Decisions pages:

- Page title.
- One short intro paragraph.
- Same top and bottom spacing rhythm as the main page.

Avoid eyebrow labels such as "devlog" when the page context is already clear.

## Content Rules

Write in a direct, human, developmental voice.

- Prefer concrete choices over vague aspirations.
- Use bold sparingly to anchor important ideas inside paragraphs.
- Keep technical detail readable by a future collaborator, not just the current implementer.
- Historical posts can repeat decisions because they are records of what happened at that moment.
- Stable reference material belongs on Goal or Decisions, not above every post.
- Do not discard content during restructuring; move it to the right room.

Post structure:

```html
<article class="entry">
  <div class="date">YYYY-MM-DD · optional tag</div>
  <h3>Post title</h3>
  <p>What changed, why it matters, and what remains true.</p>
  <figure>
    <img src="img/example.png" alt="Plain description">
    <figcaption>Short context for the image.</figcaption>
  </figure>
</article>
```

## Section Patterns

Use flat sections:

```html
<section>
  <h2>Section title</h2>
  <p class="section-note">Optional one-sentence framing.</p>
  <ul>
    <li><b>Decision name.</b> Explanation in plain language.</li>
  </ul>
</section>
```

For do/don't lists:

- Two columns on desktop.
- Single column on mobile.
- Use a thin vertical divider between columns on desktop.
- No card backgrounds.
- Use `+` markers for do's and `-` markers for don'ts if it fits the tone.

For timelines:

- Make it feel lightly like a route, subway line, tree, or winding road.
- Keep text scannable: phase badge + phase title + short description.
- Current phase should be obvious without turning into a dashboard.

For recent commits:

- Put them at the bottom of Decisions.
- Group by project phase.
- Use a flat list, no cards.
- Include all commits relevant to the project history, not only the newest few, unless the section is explicitly named "recent".

## Logo / Visual Metaphor

Use one small identity mark consistently.

- The mark should carry the app's emotional idea, not literal product mechanics.
- For Fantasy Portfolio, the heart + pyramid mark means "choices that feel right" plus "hierarchy of needs".
- Use the mark as favicon and small nav logo.
- Keep it small in the header; the page should still read as text-first.
- Optional page visuals should be used only when they add meaning without crowding the intro.

## Responsive Behavior

- At narrow widths, stack hero content and visual.
- Stack split lists into one column.
- Reduce hero vertical padding slightly.
- Prevent horizontal overflow from long code strings and URLs.
- Keep text readable and avoid viewport-scaled typography.

## Things To Avoid

- Sticky header.
- Large marketing hero.
- Multiple competing accent colors.
- Card-heavy layouts.
- A separate Devlog nav item when the devlog is already the default.
- Explanatory UI text that says how the page works.
- Charts, dashboards, or finance-like styling unless the app genuinely needs them.
- Moving or deleting historical content without preserving it somewhere.
