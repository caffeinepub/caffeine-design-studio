# TOCHI'S Business Card

## Current State
Business card with icon-based product placeholders (no real photos). Shows 4 product tiles with emojis.

## Requested Changes (Diff)

### Add
- Product photo gallery section showing all 9 real product images in a neat grid
- Each product image with a short label below it

### Modify
- Replace the icon/text product cards with actual photo cards using the uploaded images
- Make the products section scrollable if needed, with images fitting neatly

### Remove
- Emoji icon product cards

## Implementation Plan
1. Replace the products array with 9 real product entries each with image path and name
2. Display them in a 3-column grid with rounded image containers and labels
3. Images: all 9 uploaded /assets/ paths
4. Keep all other card elements (header, address, contact, buttons) unchanged
