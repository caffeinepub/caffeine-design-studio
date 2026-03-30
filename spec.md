# AI Galaxy Ice Cream Parlour

## Current State
Full-featured virtual ice cream parlour with 58+ flavors, Nova AI, loyalty system, order tracking, Stripe, COD, and sharing tools.

## Requested Changes (Diff)

### Add
- **AI Advertisement / Road Show Banner Page**: A dedicated full-screen animated advertisement page showcasing Galaxy Ice Cream Parlour as a road show banner.
  - Full-screen animated cosmic advertisement with starfield background animation
  - Wide landscape road show banner using generated banner image
  - Vertical standee banner using generated standee image
  - Animated text reveals, glowing effects, floating ice cream elements
  - Key selling points animated in: 58+ flavors, A1 Quality, Jumbo Packs, COD Available
  - Auto-scrolling marquee of flavor highlights
  - Download/Share buttons for the banner
  - Toggle between landscape (road show banner) and portrait (standee) view
  - Accessible via a prominent "View Our Ad" button in the main parlour

### Modify
- App.tsx: Add a button/link to open the Advertisement page

### Remove
- Nothing

## Implementation Plan
1. Create `RoadShowAd.tsx` -- full-screen animated advertisement component with both banner and standee views, animated cosmic effects, and share/download actions
2. Integrate into App.tsx with a prominent "View Ad" button
