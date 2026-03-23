# AI Galaxy Ice Cream Parlour

## Current State
Full-featured Galaxy Ice Cream Parlour with Nova AI chatbot, 34+ cosmic flavors, cart, loyalty points, referral, spin to win, family packs, flash deal, reviews, analytics dashboard, delivery/packaging, animated HD ad, toppings, combos, birthday surprise, trending ticker. Nova already understands some Hindi-style keywords. UI is entirely in English.

## Requested Changes (Diff)

### Add
- Language toggle button (Hindi / English) visible in the parlour header
- Hindi translations for all major UI text: headings, buttons, flavor names, banners, section titles, Nova responses, cart labels, order flow, loyalty/referral text, delivery/packaging section, footer
- Nova AI chatbot responses in Hindi when Hindi mode is active

### Modify
- App language state to switch between 'en' and 'hi'
- All parlour text rendered from a translation map (en/hi) keyed to current language
- Nova chatbot to reply in Hindi when language is set to Hindi

### Remove
- Nothing removed

## Implementation Plan
1. Create a language context/state ('en' | 'hi') at the top level of the Galaxy Parlour section in App.tsx
2. Build a translations object with English and Hindi strings for all major UI text (headings, buttons, banners, section labels, Nova responses)
3. Add a visible language toggle button (EN | हिंदी) in the parlour header
4. Replace all hardcoded parlour strings with translation lookups
5. Update Nova chatbot response logic to serve Hindi replies when language is 'hi'
6. Validate and build
