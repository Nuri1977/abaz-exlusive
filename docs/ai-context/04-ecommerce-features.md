# E-commerce Features

## Shopping Cart System

### Cart Architecture

The shopping cart system is built using React Context and provides both guest and authenticated user support:

**Cart Context Provider:**

- Global cart state management
- Guest cart persistence in localStorage
- User cart synchronization with database
- Real-time cart updates across components

**Cart Features:**

- Add/remove items with quantity management
- Product variant support (size, color, etc.)
- Price calculations with currency conversion
- Cart persistence across sessions
- Optimistic updates with rollback on error

### Cart Implementation Details

**Data Structure:**

```typescript
type CartItem = {
  quantity: number;
  price: number;
  productId: string;
  image: string;
  title: string;
  variantId?: string;
  color?: string;
  size?: string;
};
```

**Key Operations:**

- `addItem()` - Add product to cart with quantity merging
- `removeItem()` - Remove specific item or reduce quantity
- `clearCart()` - Empty entire cart
- Currency conversion for international customers
- Guest cart migration on login (planned feature)

## Product Management

### Product Catalog Features

**Product Display:**

- Grid and list view options
- High-quality image galleries
- Detailed product information
- Size guides and measurements
- Stock availability indicators
- Related product recommendations

**Product Variants:**

- Size and color options
- SKU management per variant
- Individual pricing per variant
- Stock tracking per variant
- Variant-specific images

**Product Search & Filtering:**

- Text search across name, description, brand
- Category-based filtering
- Price range filtering
- Brand and material filters
- Gender-specific filtering
- Style and feature filtering
- Sort options (price, date, popularity)

### Admin Product Management

**Product Creation:**

- Multi-step product form
- Image upload and gallery management
- Category assignment
- Variant generation from options
- SEO-friendly slug generation
- Feature tagging system

**Inventory Management:**

- Stock level tracking
- Low stock alerts
- Inventory updates
- Bulk operations
- Product status management

## Category System

### Category Hierarchy

- Three-level category structure (grandparent → parent → child)
- Hierarchical navigation with breadcrumbs
- Category-specific filtering
- SEO-optimized category pages

**Category Features:**

- Image associations for categories
- Description and metadata
- Active/inactive status
- Category-based product filtering
- Responsive category navigation

## Checkout Process

### Checkout Flow

Multi-step checkout process optimized for conversion:

**Step 1: Cart Review**

- Item verification and quantity adjustment
- Shipping cost calculation
- Promotional code application
- Guest vs. registered user options

**Step 2: Customer Information**

- Contact details (name, email, phone)
- Guest checkout support
- Account creation option
- Form validation and error handling

**Step 3: Shipping Information**

- Delivery address collection
- Address validation
- Special delivery instructions
- Phone number for delivery contact

**Order Processing:**

- Order creation with line items
- Inventory reservation
- Email confirmation
- Order tracking setup

### Form Handling

```typescript
// Checkout schema validation
const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone is required"),
  address: z.string().min(5, "Address is required"),
  note: z.string().max(500, "Note is too long").optional(),
});
```

## Order Management

### Order Processing Workflow

**Order States:**

- `PENDING` - New order awaiting processing
- `PROCESSING` - Order being prepared
- `SHIPPED` - Order dispatched
- `DELIVERED` - Order received by customer
- `CANCELLED` - Order cancelled

**Admin Order Management:**

- Order status updates
- Customer communication
- Order item management
- Shipping tracking
- Refund processing

**Customer Order Experience:**

- Order confirmation emails
- Order history access
- Status tracking
- Delivery notifications

## User Account Features

### Customer Dashboard

- Personal profile management
- Order history and tracking
- Wishlist functionality
- Address book management
- Account settings

### Wishlist System

- Heart icon toggle on products
- Persistent wishlist storage
- Wishlist management page
- Easy cart addition from wishlist
- Guest wishlist in localStorage

**Wishlist Implementation:**

```typescript
// User account context for likes
const { toggleLike, isLiked } = useUserAccountContext();

// Like/unlike functionality
const likeProduct = async (productId: string) => {
  await axios.post(`/api/like/${productId}`);
};
```

## Product Reviews and Ratings

### Review System (Planned)

- Star rating system (1-5 stars)
- Written review submission
- Review moderation
- Helpful/unhelpful voting
- Review filtering and sorting
- Verified purchase indicators

### Social Features (Planned)

- Product sharing capabilities
- Social media integration
- User-generated content
- Product recommendations
- Recently viewed items

## Inventory Management

### Stock Tracking

- Real-time inventory updates
- Low stock warnings
- Out-of-stock handling
- Backorder management
- Inventory reservations during checkout

### Warehouse Features (Planned)

- Multiple warehouse support
- Location-based inventory
- Transfer management
- Cycle counting
- Inventory reporting

## Currency and Pricing

### Multi-Currency Support

- Exchange rate integration
- Real-time currency conversion
- User preference storage
- Price display formatting
- Currency symbol handling

**Supported Currencies:**

- MKD (Macedonian Denar) - Base currency
- USD (US Dollar)
- EUR (Euro)

### Pricing Features

- Dynamic pricing updates
- Sale price management
- Bulk pricing rules (planned)
- Currency conversion caching
- Price history tracking (planned)

## Marketing Features

### Product Promotions

- New Arrivals section
- Best Sellers highlighting
- Featured products
- Seasonal collections
- Sale and discount banners

### Email Marketing Integration

- Newsletter subscription
- Order confirmation emails
- Shipping notifications
- Marketing campaign templates
- Customer segmentation (planned)

## Search and Discovery

### Search Functionality

- Full-text product search
- Autocomplete suggestions
- Search result highlighting
- No results handling
- Search analytics (planned)

### Discovery Features

- Related products
- Recently viewed items
- Trending products
- Category browsing
- Brand exploration

## Payment Integration (Planned)

### Payment Gateway Features

- Multiple payment methods
- Secure payment processing
- Payment status tracking
- Refund capabilities
- Transaction logging

### Security Features

- PCI compliance
- Fraud detection
- Secure checkout process
- Payment data encryption
- Transaction monitoring

## Analytics and Reporting (Planned)

### Business Intelligence

- Sales analytics
- Customer behavior tracking
- Product performance metrics
- Conversion rate analysis
- Revenue reporting

### Operational Metrics

- Inventory turnover
- Order fulfillment times
- Customer satisfaction scores
- Return/exchange rates
- Popular product analysis

## Mobile Commerce

### Mobile Optimization

- Responsive design for all devices
- Touch-friendly interfaces
- Mobile checkout optimization
- App-like navigation
- Mobile-specific features

### Performance Features

- Image optimization for mobile
- Lazy loading implementation
- Fast page load times
- Offline capability (planned)
- Progressive Web App features (planned)

## Future Enhancements

### Planned Features

- Advanced product personalization
- AI-powered recommendations
- Voice search capabilities
- Augmented reality try-on
- Advanced inventory forecasting
- Multi-vendor marketplace support
- Subscription commerce
- Loyalty program integration
