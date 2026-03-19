# AI Galaxy Ice Cream Parlour

## Current State
- Browser-based design studio + AI Galaxy Ice Cream Parlour app
- 16 cosmic ice cream flavors with INR pricing (₹99–₹179)
- Cart/order flow, special promo banners, Nova AI chatbot manager
- Template library with 40+ templates across 12 categories
- Freemium monetization (demo mode, no real payments)
- Backend: design saving/loading per user principal
- No loyalty points system implemented yet

## Requested Changes (Diff)

### Add
- **Loyalty Points System**: Customers earn 10 points per order; 100 points = ₹50 discount; points balance shown in parlour header; points stored per user in backend
- **More Template Categories**: Add Food Delivery, Real Estate, Nonprofit, Healthcare, Wedding, and Gaming categories with 3–5 templates each
- **Stripe Integration**: Wire up Stripe component for real premium tier payments (₹799/month); checkout flow for premium upgrade

### Modify
- Backend: Add loyalty points tracking (earn, redeem, getBalance) and order recording
- Frontend App.tsx: Integrate loyalty points display and redemption in cart/checkout; add Stripe payment flow for premium upgrade
- TemplatesPanel.tsx: Add new template categories with template entries

### Remove
- Demo/mock payment flow for premium upgrade (replace with real Stripe)

## Implementation Plan
1. Select `stripe` Caffeine component
2. Generate Motoko backend with loyalty points (earnPoints, redeemPoints, getPoints, recordOrder) and Stripe payment support
3. Update frontend:
   - Loyalty points: show balance in parlour header, earn on checkout, offer redemption option in cart
   - New template categories: Food Delivery, Real Estate, Nonprofit, Healthcare, Wedding, Gaming
   - Stripe: replace demo upgrade button with real Stripe checkout session
