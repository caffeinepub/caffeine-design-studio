# AI Galaxy Ice Cream Parlour

## Current State
Full-featured virtual ice cream parlour with 34+ cosmic flavors, cart/order flow, loyalty points, Nova AI manager, referral system, Customer Favourites, Flash Deal timer, Family Pack category, and Family Combo Deal banner.

## Requested Changes (Diff)

### Add
- **Customer Review System**: After placing an order, customers can submit a star rating (1-5) and a written comment. Reviews are stored in local state and shown in a public "Customer Reviews" section.
- **Owner Analytics Dashboard**: A dedicated panel (toggle via a button in the header or footer) showing:
  - Total orders placed
  - Average star rating
  - Top 3 most ordered flavors
  - Full list of customer reviews (name, rating, comment, date)
  - Simple visual star breakdown (how many 5-star, 4-star, etc.)

### Modify
- Order confirmation flow: after order success, prompt the customer to leave a review (name + star rating + comment).

### Remove
- Nothing removed.

## Implementation Plan
1. Add a `reviews` state array (stored in localStorage for persistence) with fields: name, rating, comment, date, orderId.
2. After order placement, show a review prompt modal/section.
3. Add a public "What Our Customers Say" section below Customer Favourites showing latest reviews with star ratings.
4. Add an owner dashboard panel (accessible via a small "Owner View" button) showing analytics: total orders, avg rating, flavor popularity, star breakdown, and all reviews.
