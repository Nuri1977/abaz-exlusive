# UI Components and Styling

## Component Library Architecture

### shadcn/ui Components

The project uses shadcn/ui as the primary component library, providing a comprehensive set of accessible, customizable UI components:

**Core Components:**

- `Button` - Multiple variants (default, destructive, outline, secondary, ghost, link)
- `Input` - Text inputs with validation states
- `Label` - Accessible form labels
- `Card` - Flexible content containers
- `Dialog` - Modal dialogs and overlays
- `Form` - Form wrapper components with validation
- `Table` - Data display tables
- `Badge` - Status indicators and tags
- `Avatar` - User profile pictures
- `Skeleton` - Loading state placeholders

**Advanced Components:**

- `Carousel` - Image and content carousels with navigation
- `Dropdown Menu` - Context menus and action dropdowns
- `Navigation Menu` - Complex navigation structures
- `Pagination` - Page navigation controls
- `Select` - Dropdown selection inputs
- `Sheet` - Slide-out panels (used for mobile cart)
- `Toast` - Notification system
- `Alert Dialog` - Confirmation dialogs
- `Tabs` - Tabbed content organization

### Component Composition Patterns

**Form Components:**

```tsx
// Standard form pattern using shadcn/ui
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="fieldName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Field Label</FormLabel>
          <FormControl>
            <Input placeholder="Enter value" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Data Tables:**

- Built with TanStack Table for complex data manipulation
- Sortable columns with custom sort functions
- Filtering capabilities (text, select, date ranges)
- Pagination with customizable page sizes
- Row selection and bulk actions
- Responsive design with horizontal scrolling

**Modal Patterns:**

- Use `Dialog` for simple content modals
- Use `Sheet` for slide-out panels (mobile-first design)
- Use `AlertDialog` for confirmation actions
- Custom `ModalWrapper` component for consistent styling

## Styling System

### Tailwind CSS Configuration

The project uses a custom Tailwind configuration with:

**Color Palette:**

- Custom color scheme defined in `tailwind.config.ts`
- CSS variables for theme consistency
- Dark mode support (configurable)
- Semantic color naming (primary, destructive, muted, etc.)

**Typography:**

- Custom font family configuration
- Responsive font sizing
- Line height and letter spacing optimization
- Heading and body text hierarchies

**Spacing & Layout:**

- Consistent spacing scale
- Responsive breakpoints
- Grid and flexbox utilities
- Custom container sizes

### Component Styling Patterns

**Utility Classes:**

- `cn()` utility function for conditional class merging
- Consistent use of Tailwind utilities
- Component variants using `class-variance-authority`

**Responsive Design:**

- Mobile-first approach
- Responsive grid layouts
- Adaptive navigation (mobile sheet, desktop dropdown)
- Responsive tables with horizontal scrolling

## Custom Components

### Business Logic Components

**Product Components:**

- `ProductCard` - Product display with image, price, actions
- `ProductCardScroller` - Horizontal scrolling product sections
- `ProductImageGallery` - Image carousel for product details
- `ProductSkeleton` - Loading states for product grids

**E-commerce Components:**

- `CartSheet` - Slide-out shopping cart
- `CartProvider` - Cart state management context
- `CartContext` - Cart operations and persistence

**Admin Components:**

- `ProductTable` - Admin product management table
- `CategoryTable` - Category management interface
- `UserTable` - User management with CRUD operations
- `OrderManagement` - Order status and processing

**Layout Components:**

- `Header` - Responsive navigation with user menu
- `Footer` - Company information and links
- `Logo` - Consistent brand representation
- `Breadcrumb` - Navigation breadcrumbs

### File Upload Components

**UploadThing Integration:**

- `CustomUploadButton` - Styled upload interface
- `MultiImageUploader` - Multiple file upload with preview
- `UploadButton` and `UploadDropzone` - Generated components
- Gallery integration for uploaded files

**Features:**

- Drag and drop interface
- Image preview and editing
- File type validation
- Size limit enforcement
- Error handling with toast notifications

## State Management

### Component State Patterns

**Local State:**

- `useState` for component-specific state
- `useReducer` for complex state logic
- Form state managed by React Hook Form

**Global State:**

- React Context for cross-component state
- Custom hooks for state abstraction
- Provider pattern for dependency injection

### Loading States

**Skeleton Components:**

- Product grid skeletons
- Table loading states
- Form loading indicators
- Image loading placeholders

**Loading Indicators:**

- Spinner components for async operations
- Button loading states
- Page-level loading indicators
- Progressive loading for lists

## Accessibility Features

### Keyboard Navigation

- Focus management in modals
- Keyboard shortcuts for common actions
- Tab order optimization
- ARIA labels and descriptions

### Screen Reader Support

- Semantic HTML structure
- ARIA attributes for complex components
- Alt text for images
- Form label associations

### Visual Accessibility

- High contrast color schemes
- Focus indicators
- Error state styling
- Loading state announcements

## Animation and Interactions

### CSS Animations

- Smooth transitions for state changes
- Hover effects on interactive elements
- Loading animations and spinners
- Page transitions

### User Feedback

- Toast notifications for actions
- Form validation feedback
- Loading states for async operations
- Success/error visual indicators

## Mobile Optimization

### Responsive Components

- Mobile-first design approach
- Touch-friendly interface elements
- Responsive navigation patterns
- Mobile-optimized forms

### Performance Considerations

- Lazy loading for images
- Component code splitting
- Optimized bundle sizes
- Minimal re-renders

## Component Testing

### Testing Patterns

- Component unit tests with Jest and React Testing Library
- Mock implementations for external dependencies
- Accessibility testing
- Visual regression testing setup

### Test Utilities

- Custom render function with providers
- Mock hooks and contexts
- Test data factories
- Assertion helpers

## Future Enhancements

### Planned Improvements

- Dark mode implementation
- Advanced animation library integration
- Component documentation with Storybook
- Design system documentation
- Performance monitoring and optimization
