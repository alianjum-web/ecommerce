# E-Commerce Platform: User Roles and Capabilities

## Seller Capabilities:
- Sellers can only view and manage the products within their own shop.
- Sellers can modify their own products.
- Sellers can view and manage orders related only to their own products.
- Revenue insights for sellers:
  - **Overall revenue**: Total revenue generated across all sellers (accessible only to Admins).
  - **Seller-specific revenue**: Revenue earned specifically by each seller (accessible only to the respective seller).

## Buyer Capabilities:
- Buyers can browse and purchase products across all shops.
- Buyers are focused solely on the purchasing process.

## Admin Capabilities:
- Admins have full control and visibility across the platform:
  - ✅ View all users.
  - ✅ Delete users.
  - ✅ View all orders.
  - ✅ Delete any product.
  - ✅ Monitor sales and revenue:
    - Overall platform revenue.
    - Seller-specific revenue for individual sellers.
- Admins can apply fees or commissions on seller earnings.

## Summary of User Views:

| Role   | View Orders                         | Manage Products          | Revenue Insights                      |
|--------|-------------------------------------|--------------------------|---------------------------------------|
| Admin  | All orders from all sellers         | Can delete any product   | Can see overall and seller-wise revenue |
| Seller | Only their own shop's orders        | Manage their own products | Can see their own revenue only         |
| Buyer  | Purchase-related orders (their own) | N/A                      | Not applicable                         |

### Notes:
- **Admins** have overarching control and can see both overall revenue and individual seller revenue.
- **Sellers** have restricted access and can only interact with their own products, orders, and revenue.
- **Buyers** are solely focused on purchasing products from sellers.

This structure ensures a clear separation of roles and responsibilities, enhancing security and user experience across the platform.
