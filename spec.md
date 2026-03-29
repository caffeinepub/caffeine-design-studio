# AI Galaxy Ice Cream Parlour

## Current State
The app is a full-featured virtual ice cream parlour with 58+ flavors, Nova AI chatbot, loyalty points, order queue, coupon codes, Jumbo Party Packs, and many engagement features. All customer state (loyalty points, order history, referral codes, tier) is stored in React state (in-memory only) and is lost when the page is refreshed or closed. There is no customer login or persistent account system. The backend currently only has design-saving functionality.

## Requested Changes (Diff)

### Add
- Customer Account System: sign up / log in with username + email
- Persistent loyalty points stored in backend per customer
- Persistent order history stored in backend per customer
- Persistent referral code stored in backend per customer
- Customer profile panel in the header (avatar, tier, points, order count)
- Backend APIs: registerCustomer, loginCustomer, getCustomerProfile, addLoyaltyPoints, addOrder, redeemPoints

### Modify
- When a customer places an order, save order to backend and update loyalty points
- Loyalty leaderboard reads from backend (persistent customer data)
- Header loyalty tier badge reads from persistent profile
- Referral code persisted per customer

### Remove
- Nothing removed

## Implementation Plan
1. Add backend APIs for customer account management (register, login, profile, loyalty, orders)
2. Wire frontend: show Login/Sign Up modal when customer places first order or clicks account icon
3. After login, persist all loyalty points and order history to backend
4. Show customer profile chip in header (name, tier, points)
5. Loyalty leaderboard reads from backend customer list
