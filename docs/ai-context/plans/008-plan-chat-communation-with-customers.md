# Plan to add chat with customers
you should go in small steps and phases. after each phase update oonly this document. do not create new ai context docs.

The goal is to enable customers to contact the shop admin via **WhatsApp**, **Viber**, and **Phone**. When initiated from a product page, the message should include product details. On other pages, it should include basic user/context information.

**Note**: This implementation uses the existing `telephone` field in the `Settings` database table as the shop owner's contact number. No database changes or extra configuration files are needed.

## 🛠️ Technical Approach
- **Existing Source of Truth**: Use the `telephone` field from the `Settings` model (already available via `getSettingsSA`).
- **Deep Link Protocols**: 
  - **WhatsApp**: `https://wa.me/{telephone}?text={encodedMessage}`
  - **Viber**: `viber://chat?number={telephone}`
  - **Phone**: `tel:{telephone}`
- **Context-Aware Messaging**: A shared component will detect the current page context to pre-fill messages.

## 📋 Phase 1: Data Integration & Utilities
- [x] **Create Message Formatting Utils**:
  - `formatProductInquiry(product, url)`: Done.
  - `formatGeneralInquiry()`: Done.
- [x] **Standardize Phone Formatting**: Implemented in `chat-utils.ts`.

## 📋 Phase 2: Contact Components Implementation
- [x] **Create `ContactMethods` Component**:
  - A reusable UI component (`src/components/shared/ContactMethods.tsx`). Done.
  - Fetches settings or accepts `telephone` as a prop. Done.
  - Displays premium icons for WhatsApp, Viber, and Phone. Done.

## 📋 Phase 3: Frontend Integration
- [x] **Product Detail Page**:
  - Integrate `ContactMethods` in `ProductPageClient.tsx`. Done.
  - Position it near the primary call-to-action (Add to Cart). Done.
  - Pass the current `product` object and current URL. Done.
- [x] **Global Floating Widget**:
  - Implement a subtle floating action button (FAB) in the root layout or a high-level client wrapper. Done.
  - Clicking expands it to show the chat options with the store owner. Done.

## 📋 Phase 4: Polish & Testing
- [x] **Mobile Optimization**: Verified deep link protocols.
- [x] **Visual Consistency**: matched premium brand colors.
- [x] **Empty State**: Handled missing telephone number gracefully.