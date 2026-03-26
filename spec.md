# AI Galaxy Ice Cream Parlour

## Current State
Full-featured virtual ice cream parlour with 58+ flavors, Nova AI chatbot, loyalty system, order queue, Jumbo Party Packs, summer combos, festival specials, sharing tools, and more. App.tsx is ~9066 lines.

## Requested Changes (Diff)

### Add
1. **Valentine's Day Special Section** -- A dedicated section with 4-5 romantic-themed ice cream flavors (e.g., Rose Petal Dream, Strawberry Love Swirl, Chocolate Heart Velvet, etc.) with a pink/red banner, limited-time offer messaging, and add-to-cart buttons. Works in both English and Hindi.
2. **Customer Testimonial Wall** -- A section showing 6-8 auto-rotating customer testimonials with star ratings, customer names, location (e.g., "Priya, Mumbai"), and short review text. Smooth carousel-style animation, cosmic theme styling.
3. **"Order Again" Quick Reorder** -- In the cart or after an order is placed, show a "Quick Reorder" section listing the last 2-3 items ordered (stored in localStorage) so returning customers can re-add with one tap.
4. **Daily Deal Notification Banner** -- A dismissable banner at the top of the page (below the header) showing a rotating daily deal message (e.g., "Today only: Free Waffle Cone with any order above ₹199!"). Rotates through 7 deal messages based on day of week. Works in Hindi too.

### Modify
- App.tsx: Add new flavor entries (FLAVORS array) for Valentine's flavors, and add new section components inline. Wire into the main render.

### Remove
- Nothing removed.

## Implementation Plan
1. Add 5 Valentine's Day flavor entries to FLAVORS array with category "festival" or reuse existing festival logic (use a new `isValentine` flag).
2. Create `ValentineDaySection` component with banner, flavor cards, add-to-cart, Hindi/English support.
3. Create `TestimonialWall` component with 8 hardcoded testimonials, auto-rotating carousel using useState + useEffect interval.
4. Add `lastOrderedItems` to localStorage on order placement; create `QuickReorderSection` component shown at top of cart modal.
5. Create `DailyDealBanner` component that picks deal message by `new Date().getDay()`, dismissable with state.
6. Wire all 4 new components into the main render in App.tsx.
