"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  CustomerInfoCell,
  DeliveryInfoCell,
  OrderItemsPreviewCell,
  PaymentAmountCell,
  PaymentTimelineCell,
} from "./index";

// Mock data for demonstration
const mockOrderItems = [
  {
    id: "1",
    quantity: 2,
    price: 89.99,
    Product: {
      id: "prod1",
      name: "Elegant Evening Dress",
      slug: "elegant-evening-dress",
      images: ["/images/dress1.jpg"],
    },
    variant: {
      id: "var1",
      sku: "EED-BLK-M",
      options: [
        {
          optionValue: {
            value: "Black",
            option: { name: "Color" },
          },
        },
        {
          optionValue: {
            value: "Medium",
            option: { name: "Size" },
          },
        },
      ],
    },
  },
  {
    id: "2",
    quantity: 1,
    price: 129.99,
    Product: {
      id: "prod2",
      name: "Designer Handbag",
      slug: "designer-handbag",
      images: ["/images/bag1.jpg"],
    },
  },
  {
    id: "3",
    quantity: 1,
    price: 59.99,
    Product: {
      id: "prod3",
      name: "Silk Scarf",
      slug: "silk-scarf",
      images: ["/images/scarf1.jpg"],
    },
  },
];

const mockTimelineEvents = [
  {
    id: "1",
    type: "created" as const,
    description: "Payment created for order #12345",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    actor: "System",
  },
  {
    id: "2",
    type: "status_changed" as const,
    description: "Payment status changed from PENDING to PAID",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    actor: "Polar API",
  },
  {
    id: "3",
    type: "confirmation" as const,
    description: "Cash payment confirmed by admin",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    actor: "admin@example.com",
  },
];

export function TableCellsDemo() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Table Cells Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive showcase of specialized table cell components for payment tables
        </p>
      </div>

      {/* Payment Amount Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Amount Cell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Simple Amount</h4>
                <PaymentAmountCell amount={299.99} currency="USD" />
              </div>
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">With Refund</h4>
                <PaymentAmountCell
                  amount={299.99}
                  currency="USD"
                  refundedAmount={50.00}
                />
              </div>
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">With Conversion</h4>
                <PaymentAmountCell
                  amount={299.99}
                  currency="USD"
                  originalAmount={25000}
                  originalCurrency="MKD"
                  showConversion
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border p-4">
                <PaymentAmountCell
                  amount={1299.99}
                  currency="USD"
                  variant="compact"
                />
              </div>
              <div className="rounded border p-4">
                <PaymentAmountCell
                  amount={1299.99}
                  currency="USD"
                  refundedAmount={200.00}
                  variant="compact"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Detailed Variant</h3>
            <div className="rounded border p-4">
              <PaymentAmountCell
                amount={299.99}
                currency="USD"
                originalAmount={25000}
                originalCurrency="MKD"
                refundedAmount={50.00}
                variant="detailed"
                showConversion
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Info Cell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Registered Customer</h4>
                <CustomerInfoCell
                  customerName="John Doe"
                  customerEmail="john.doe@example.com"
                  customerPhone="+1 (555) 123-4567"
                  userId="user123"
                  orderCount={5}
                  totalSpent={1299.95}
                />
              </div>
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Guest Customer</h4>
                <CustomerInfoCell
                  customerName="Jane Smith"
                  customerEmail="jane.smith@example.com"
                  isGuest
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded border p-4">
                <CustomerInfoCell
                  customerName="Alice Johnson"
                  customerEmail="alice@example.com"
                  variant="compact"
                />
              </div>
              <div className="rounded border p-4">
                <CustomerInfoCell
                  customerName="Guest User"
                  isGuest
                  variant="compact"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Detailed Variant</h3>
            <div className="rounded border p-4">
              <CustomerInfoCell
                customerName="Robert Wilson"
                customerEmail="robert.wilson@example.com"
                customerPhone="+1 (555) 987-6543"
                userId="user456"
                orderCount={12}
                totalSpent={2599.80}
                variant="detailed"
                showActions
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items Preview Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items Preview Cell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant</h3>
            <div className="rounded border p-4">
              <OrderItemsPreviewCell
                items={mockOrderItems}
                orderId="order123"
                currency="USD"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant</h3>
            <div className="rounded border p-4">
              <OrderItemsPreviewCell
                items={mockOrderItems}
                orderId="order123"
                variant="compact"
                size="sm"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Detailed Variant</h3>
            <div className="rounded border p-4">
              <OrderItemsPreviewCell
                items={mockOrderItems}
                orderId="order123"
                currency="USD"
                variant="detailed"
                showPrice
                showVariants
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Timeline Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Timeline Cell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Default Variant (with Popover)</h3>
            <div className="rounded border p-4">
              <PaymentTimelineCell
                events={mockTimelineEvents}
                showActor
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant</h3>
            <div className="rounded border p-4">
              <PaymentTimelineCell
                events={mockTimelineEvents}
                variant="compact"
                size="sm"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Detailed Variant</h3>
            <div className="rounded border p-4">
              <PaymentTimelineCell
                events={mockTimelineEvents}
                variant="detailed"
                showActor
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Info Cell */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Info Cell</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Different Delivery Statuses</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Pending</h4>
                <DeliveryInfoCell
                  deliveryStatus="pending"
                  deliveryAddress="123 Main St, New York, NY 10001"
                  customerName="John Doe"
                />
              </div>
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Scheduled</h4>
                <DeliveryInfoCell
                  deliveryStatus="scheduled"
                  deliveryAddress="456 Oak Ave, Los Angeles, CA 90210"
                  deliveryDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                  customerName="Jane Smith"
                  customerPhone="+1 (555) 123-4567"
                />
              </div>
              <div className="rounded border p-4">
                <h4 className="mb-2 text-sm font-medium">Delivered</h4>
                <DeliveryInfoCell
                  deliveryStatus="delivered"
                  deliveryAddress="789 Pine St, Chicago, IL 60601"
                  deliveryDate={new Date(Date.now() - 2 * 60 * 60 * 1000)}
                  customerName="Bob Johnson"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Compact Variant</h3>
            <div className="rounded border p-4">
              <DeliveryInfoCell
                deliveryStatus="in_transit"
                deliveryAddress="321 Elm St, Miami, FL 33101"
                deliveryDate={new Date()}
                variant="compact"
                size="sm"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Detailed Variant</h3>
            <div className="rounded border p-4">
              <DeliveryInfoCell
                deliveryStatus="scheduled"
                deliveryAddress="654 Maple Dr, Seattle, WA 98101"
                deliveryDate={new Date(Date.now() + 6 * 60 * 60 * 1000)}
                deliveryNotes="Please ring doorbell twice. Leave package with neighbor if not home."
                customerName="Alice Wilson"
                customerPhone="+1 (555) 987-6543"
                variant="detailed"
                showActions
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 font-semibold">Small Size</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border p-4">
                <PaymentAmountCell amount={199.99} currency="USD" size="sm" />
              </div>
              <div className="rounded border p-4">
                <CustomerInfoCell
                  customerName="Small User"
                  customerEmail="small@example.com"
                  size="sm"
                />
              </div>
              <div className="rounded border p-4">
                <OrderItemsPreviewCell
                  items={mockOrderItems.slice(0, 1)}
                  orderId="order123"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 font-semibold">Large Size</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded border p-4">
                <PaymentAmountCell amount={199.99} currency="USD" size="lg" />
              </div>
              <div className="rounded border p-4">
                <CustomerInfoCell
                  customerName="Large User"
                  customerEmail="large@example.com"
                  size="lg"
                />
              </div>
              <div className="rounded border p-4">
                <OrderItemsPreviewCell
                  items={mockOrderItems.slice(0, 1)}
                  orderId="order123"
                  size="lg"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}