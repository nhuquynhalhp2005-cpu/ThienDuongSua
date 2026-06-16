# Security Specification - Sữa Bột Clean Milk Shop

## 1. Data Invariants
1. **Product Integrity**: Products can only be configured (created, updated, deleted) by authorized Admin accounts. Anyone (even signed-out users) can read the products.
2. **User Profiles Integrity**: A user can only write (create/update) their own profile data, except for their `role` field. Only an Admin or a system initialization process can designate/verify administrators.
3. **Order Ownership**: Purchase orders can only be written by the authenticated user who owns the order (`userId` matching their authenticated UID). Users can read their own order history, but not orders of other users. Admins can read and modify order statuses across the entire shop.
4. **Data Durability**: Unbounded array sizes are avoided, and IDs always undergo basic filtering. All financial properties are strictly positive integers over 0.

## 2. The "Dirty Dozen" Threat Payloads (Reject Targets)
1. **Spoofed User Registration**: Attempt by a client to registers as an admin directly (e.g. `role: "admin"` during initial write).
2. **Cross-User Account Tampering**: Authenticated user `UID_A` attempts to edit user profile of `UID_B`.
3. **Price Manipulation**: Authenticated user attempts to modify product details (such as setting milk price to 0 VND) directly via the client SDK.
4. **Unauthorized Product Deletion**: Non-admin user attempts to run a deletion script on a premium milk product.
5. **Junk ID Attack**: Attempting to set an extremely long block of text (e.g., 20,000 characters) as a Product ID to deplete Firestore resource quotas.
6. **Cross-Order Reading**: User `UID_A` queries and retrieves purchase history of customer `UID_B` without permissions.
7. **Phantom Orders creation**: Placed order with a completely fabricated `userId` that does not match the logged-in client UID.
8. **Malicious Admin Promotion**: A regular customer attempts to execute an update operation changing their profile database state parameter `role` to `admin`.
9. **Relational Invariant Bypass**: Inserting an order with a non-existent or negative total payment amount.
10. **State Skipping Bypass**: Changing an order status from "Pending" directly to "Delivered" without intermediate admin checks (client attempting state injection).
11. **Negative Stock Insertion**: Creating or updating a product with negative stock counts (e.g., `stock: -123`).
12. **Null-Auth Write Access**: An unauthenticated user attempts to issue purchase orders or create profiles directly.

## 3. Enforcement Strategy
- **Master Gate**: All paths require explicit authenticate checks.
- **Validation Blueprints**: Schema guards will validate properties (`isValidProduct()`, `isValidOrder()`, `isValidUserUI()`).
- **Temporal Checkgrounds**: Creation timestamps are strictly matched to `request.time`.
- **Admin Isolation**: Admin users are configured explicitly. We will include a system-wide bootstrap in which the developer user email `nhuquynhalhp2005@gmail.com` (from metadata) starts as the bootstrapped system Admin! This maps to the user context inside the workspace metadata.
