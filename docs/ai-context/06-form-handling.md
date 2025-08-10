# Form Handling and Validation

## Form Architecture

### React Hook Form Integration

The application uses React Hook Form for performant, flexible form management with minimal re-renders:

**Core Benefits:**

- Uncontrolled components for better performance
- Built-in validation with TypeScript support
- Minimal re-renders and optimized updates
- Easy integration with UI libraries

### Zod Schema Validation

Type-safe validation using Zod schemas that provide both runtime validation and TypeScript types:

```typescript
// Example product schema
export const baseProductFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: priceSchema,
  brand: z.string().min(1, "Brand is required"),
  material: z.string().optional(),
  gender: z.string().min(1, "Gender is required"),
  style: z.string().min(1, "Style is required"),
  categoryId: z.string().min(1, "Category is required"),
  features: z.array(z.string()).optional(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
});

// Generate TypeScript types
export type BaseProductFormValues = z.infer<typeof baseProductFormSchema>;
```

## Form Patterns and Components

### Standard Form Implementation

Consistent form structure using shadcn/ui form components:

```tsx
// Basic form pattern
export function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      const response = await fetch("/api/email/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({
        title: "Message Sent",
        description: "Thank you for reaching out!",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional fields... */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
```

### Complex Form Management

Advanced forms with dynamic fields and complex validation:

```tsx
// Product form with dynamic variants
export function AddProductForm() {
  const form = useForm<AddProductFormValues>({
    resolver: zodResolver(addProductFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      // ... other fields
      options: [],
      variants: [],
    },
  });

  // Dynamic option management
  const addOption = () => {
    const options = form.getValues("options");
    form.setValue("options", [...options, { name: "", values: [""] }]);
  };

  const removeOption = (index: number) => {
    const options = form.getValues("options") || [];
    options.splice(index, 1);
    form.setValue("options", options);
  };

  // Variant generation from options
  const generateVariants = () => {
    const options = form.getValues("options") || [];

    if (options.length === 0) {
      toast({
        title: "Error",
        description:
          "Please add at least one option before generating variants",
        variant: "destructive",
      });
      return;
    }

    // Generate all combinations
    const combinations = options.reduce(
      (acc, option) => {
        if (acc.length === 0) {
          return option.values.map((value) => [
            { optionName: option.name, value },
          ]);
        }
        return acc.flatMap((combination) =>
          option.values.map((value) => [
            ...combination,
            { optionName: option.name, value },
          ])
        );
      },
      [] as { optionName: string; value: string }[][]
    );

    const variants = combinations.map((combination, index) => ({
      sku: `SKU-${index + 1}`,
      price: form.getValues("price"),
      stock: "0",
      options: combination,
    }));

    form.setValue("variants", variants);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic product fields */}

        {/* Dynamic options section */}
        <Card>
          <CardHeader>
            <CardTitle>Product Options</CardTitle>
            <Button type="button" onClick={addOption}>
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </CardHeader>
          <CardContent>
            {form.watch("options").map((option, optionIndex) => (
              <div
                key={optionIndex}
                className="space-y-4 rounded-lg border p-4"
              >
                <FormField
                  control={form.control}
                  name={`options.${optionIndex}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Option Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Size, Color" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Option values management */}
              </div>
            ))}

            {form.watch("options").length > 0 && (
              <Button type="button" onClick={generateVariants}>
                Generate Variants
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Generated variants display */}
        {form.watch("variants").length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {form.watch("variants").map((variant, variantIndex) => (
                <div
                  key={variantIndex}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name={`variants.${variantIndex}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Additional variant fields */}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}
```

## Validation Schemas

### Authentication Schemas

User authentication and registration validation:

```typescript
// auth.ts
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
  });
```

### E-commerce Schemas

Product and order validation schemas:

```typescript
// product.ts
export const productOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  values: z.array(z.string()).min(1, "At least one value is required"),
});

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  price: priceSchema.optional(),
  stock: z.string().min(1, "Stock is required"),
  options: z.array(productOptionValueSchema),
});

// checkout.ts
export const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(7, "Phone is required")
    .regex(/^[+0-9\s-]+$/, "Invalid phone number"),
  address: z.string().min(5, "Address is required"),
  note: z.string().max(500, "Note is too long").optional(),
});
```

### Content Management Schemas

Category and settings validation:

```typescript
// category.ts
export const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  image: z.custom<FileUploadThing>().nullable(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// settings.ts
export const settingsSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email format"),
  facebook: z
    .string()
    .url("Invalid Facebook URL")
    .nullable()
    .optional()
    .transform((val) => val || null),
  // Additional social media and contact fields
});
```

## Form State Management

### Loading States and Feedback

Comprehensive loading and error state management:

```tsx
export function ProfileForm({ user }: ProfileFormProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  const onSubmit = async (values: UpdateProfileValues) => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex items-center"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
}
```

### Form Reset and Persistence

Smart form state management with reset and auto-save:

```tsx
// Checkout form with session integration
export function CheckoutForm() {
  const { data: session } = authClient.useSession();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      address: "",
      note: "",
    },
    mode: "onTouched", // Validate on field touch
  });

  // Update form when session loads
  useEffect(() => {
    form.reset({
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      phone: "",
      address: "",
      note: "",
    });
  }, [session?.user?.name, session?.user?.email, form]);

  return <Form {...form}>{/* Form fields */}</Form>;
}
```

## File Upload Integration

### UploadThing Integration

Seamless file upload with form integration:

```tsx
// Multi-image uploader component
export function MultiImageUploader({
  onChange,
  onRemove,
  value,
  maxLimit = 5,
}: MultiImageUploaderProps) {
  const handleImageChange = (newFiles: FileUploadThing[]) => {
    const allFiles = [...value, ...newFiles];
    if (allFiles.length > maxLimit) {
      toast({
        title: "Upload limit exceeded",
        description: `Maximum ${maxLimit} images allowed`,
        variant: "destructive",
      });
      return;
    }
    onChange(allFiles, newFiles[0]);
  };

  const handleImageRemove = (index: number) => {
    const fileToRemove = value[index];
    const newFiles = value.filter((_, i) => i !== index);
    onRemove(newFiles, fileToRemove?.key);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {value.map((file, index) => (
          <div key={file.key} className="relative">
            <Image
              src={file.url}
              alt={`Upload ${index + 1}`}
              width={200}
              height={200}
              className="rounded-lg object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -right-2 -top-2 h-6 w-6"
              onClick={() => handleImageRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      {value.length < maxLimit && (
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={handleImageChange}
          onUploadError={(error: Error) => {
            toast({
              title: "Upload failed",
              description: error.message,
              variant: "destructive",
            });
          }}
        />
      )}
    </div>
  );
}
```

## Error Handling and Validation

### Server-Side Validation

API route validation with proper error responses:

```typescript
// API route with validation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = contactFormSchema.safeParse(body);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });

      return NextResponse.json(
        {
          data: null,
          error: "Invalid form data",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;

    // Process valid data...

    return NextResponse.json({
      data: result,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        data: null,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
```

### Client-Side Error Display

User-friendly error messaging:

```tsx
// Form with comprehensive error handling
export function SettingsForm({ settings }: Props) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      // ... default values
    },
  });

  const onError: SubmitErrorHandler<SettingsFormData> = (errors) => {
    setFormError("Please check the form for errors and try again.");
  };

  const onSubmit: SubmitHandler<SettingsFormData> = async (formData) => {
    setFormError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings");
      }

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error: any) {
      setFormError(error.message || "Failed to save settings");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-4"
      >
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## Testing Forms

### Form Testing Patterns

Comprehensive form testing with user events:

```typescript
// Contact form test
describe("ContactForm", () => {
  it("submits form with valid data", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;

    const { user } = render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/message/i), "Test message");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    expect(mockFetch).toHaveBeenCalledWith("/api/email/contact-form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Test message",
      }),
    });
  });

  it("displays validation errors for invalid data", async () => {
    const { user } = render(<ContactForm />);

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });
});
```

## Performance Optimizations

### Form Performance Best Practices

- Use `mode: "onTouched"` for better UX
- Implement debounced validation for expensive checks
- Use field-level re-renders to minimize updates
- Lazy load complex form sections
- Implement form state persistence for long forms

### Memory Management

- Clean up form subscriptions on unmount
- Use React.memo for expensive form components
- Optimize re-renders with careful dependency arrays
- Implement proper cleanup for file uploads

## Future Enhancements

### Planned Improvements

- Auto-save functionality for long forms
- Form analytics and completion tracking
- Advanced validation rules with custom validators
- Multi-step form wizard components
- Real-time collaboration for admin forms
- Enhanced accessibility features
- Form field conditional logic
- Template-based form generation
