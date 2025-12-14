"use client";

import { PaymentMethod, PaymentStatus } from "@prisma/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  getPaymentStatusDescription,
  getPaymentStatusPriority,
  PaymentStatusBadge,
} from "./PaymentStatusBadge";
import {
  getPaymentMethodCategory,
  getPaymentMethodDescription,
  getPaymentMethodsByCategory,
  PaymentMethodIcon,
} from "./PaymentMethodIcon";

export function PaymentComponentsDemo() {
  const allStatuses = Object.values(PaymentStatus);
  const allMethods = Object.values(PaymentMethod);
  const methodsByCategory = getPaymentMethodsByCategory();

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Payment Components Demo</h1>
        <p className="text-muted-foreground">
          Comprehensive showcase of enhanced payment status badges and method
          icons
        </p>
      </div>

      {/* Payment Status Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default variant with different sizes */}
          <div>
            <h3 className="mb-3 font-semibold">Default Variant - All Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              {allStatuses.map((status) => (
                <div key={status} className="flex items-center gap-2">
                  <PaymentStatusBadge status={status} size="sm" />
                  <PaymentStatusBadge status={status} size="md" />
                  <PaymentStatusBadge status={status} size="lg" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Solid variant */}
          <div>
            <h3 className="mb-3 font-semibold">Solid Variant</h3>
            <div className="flex flex-wrap items-center gap-3">
              {allStatuses.map((status) => (
                <PaymentStatusBadge
                  key={status}
                  status={status}
                  variant="solid"
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Minimal variant */}
          <div>
            <h3 className="mb-3 font-semibold">Minimal Variant</h3>
            <div className="flex flex-wrap items-center gap-3">
              {allStatuses.map((status) => (
                <PaymentStatusBadge
                  key={status}
                  status={status}
                  variant="minimal"
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Method-aware labels */}
          <div>
            <h3 className="mb-3 font-semibold">Method-Aware Labels</h3>
            <div className="space-y-3">
              {allMethods.map((method) => (
                <div key={method} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {method}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {allStatuses.map((status) => (
                      <PaymentStatusBadge
                        key={`${method}-${status}`}
                        status={status}
                        method={method}
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Without icons */}
          <div>
            <h3 className="mb-3 font-semibold">Without Icons</h3>
            <div className="flex flex-wrap items-center gap-3">
              {allStatuses.map((status) => (
                <PaymentStatusBadge
                  key={status}
                  status={status}
                  showIcon={false}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Icons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Icon variant with different sizes */}
          <div>
            <h3 className="mb-3 font-semibold">Icon Variant - All Sizes</h3>
            <div className="space-y-3">
              {allMethods.map((method) => (
                <div key={method} className="flex items-center gap-4">
                  <PaymentMethodIcon method={method} size="xs" />
                  <PaymentMethodIcon method={method} size="sm" />
                  <PaymentMethodIcon method={method} size="md" />
                  <PaymentMethodIcon method={method} size="lg" />
                  <PaymentMethodIcon method={method} size="xl" />
                  <span className="text-sm text-muted-foreground">
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Icon with labels */}
          <div>
            <h3 className="mb-3 font-semibold">Icon with Labels</h3>
            <div className="space-y-3">
              {allMethods.map((method) => (
                <PaymentMethodIcon
                  key={method}
                  method={method}
                  showLabel
                  size="md"
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Badge variant */}
          <div>
            <h3 className="mb-3 font-semibold">Badge Variant</h3>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Short Labels
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {allMethods.map((method) => (
                    <PaymentMethodIcon
                      key={method}
                      method={method}
                      variant="badge"
                      size="md"
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Full Labels
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {allMethods.map((method) => (
                    <PaymentMethodIcon
                      key={method}
                      method={method}
                      variant="badge"
                      showLabel
                      size="md"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Card variant */}
          <div>
            <h3 className="mb-3 font-semibold">Card Variant</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {allMethods.map((method) => (
                <PaymentMethodIcon
                  key={method}
                  method={method}
                  variant="card"
                  size="lg"
                />
              ))}
            </div>
          </div>

          <Separator />

          {/* Color schemes */}
          <div>
            <h3 className="mb-3 font-semibold">Color Schemes</h3>
            <div className="space-y-4">
              {["default", "muted", "vibrant"].map((colorScheme) => (
                <div key={colorScheme}>
                  <h4 className="mb-2 text-sm font-medium capitalize text-muted-foreground">
                    {colorScheme}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {allMethods.map((method) => (
                      <PaymentMethodIcon
                        key={method}
                        method={method}
                        variant="badge"
                        colorScheme={
                          colorScheme as "default" | "muted" | "vibrant"
                        }
                        size="md"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Helper Functions Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Helper Functions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status priorities */}
          <div>
            <h3 className="mb-3 font-semibold">Status Priorities (for sorting)</h3>
            <div className="space-y-2">
              {allStatuses
                .sort((a, b) => getPaymentStatusPriority(a) - getPaymentStatusPriority(b))
                .map((status) => (
                  <div key={status} className="flex items-center justify-between">
                    <PaymentStatusBadge status={status} size="sm" />
                    <span className="text-sm text-muted-foreground">
                      Priority: {getPaymentStatusPriority(status)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <Separator />

          {/* Status descriptions */}
          <div>
            <h3 className="mb-3 font-semibold">Status Descriptions</h3>
            <div className="space-y-2">
              {allStatuses.map((status) => (
                <div key={status} className="space-y-1">
                  <PaymentStatusBadge status={status} size="sm" />
                  <p className="text-sm text-muted-foreground">
                    {getPaymentStatusDescription(status)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Method categories */}
          <div>
            <h3 className="mb-3 font-semibold">Methods by Category</h3>
            <div className="space-y-4">
              {Object.entries(methodsByCategory).map(([category, methods]) => (
                <div key={category}>
                  <h4 className="mb-2 text-sm font-medium capitalize text-muted-foreground">
                    {category} Methods
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {methods.map((method) => (
                      <PaymentMethodIcon
                        key={method}
                        method={method}
                        variant="badge"
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Method descriptions */}
          <div>
            <h3 className="mb-3 font-semibold">Method Descriptions</h3>
            <div className="space-y-2">
              {allMethods.map((method) => (
                <div key={method} className="space-y-1">
                  <PaymentMethodIcon method={method} showLabel size="sm" />
                  <p className="text-sm text-muted-foreground">
                    Category: {getPaymentMethodCategory(method)} •{" "}
                    {getPaymentMethodDescription(method)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}