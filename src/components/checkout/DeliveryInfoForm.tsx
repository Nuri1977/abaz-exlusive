"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

export interface DeliveryInfo {
  address: string;
  notes?: string;
  preferredDate?: Date;
}

interface DeliveryInfoFormProps {
  deliveryInfo: DeliveryInfo;
  onDeliveryInfoChange: (info: DeliveryInfo) => void;
  className?: string;
}

export function DeliveryInfoForm({
  deliveryInfo,
  onDeliveryInfoChange,
  className,
}: DeliveryInfoFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleAddressChange = (address: string) => {
    onDeliveryInfoChange({
      ...deliveryInfo,
      address,
    });
  };

  const handleNotesChange = (notes: string) => {
    onDeliveryInfoChange({
      ...deliveryInfo,
      notes,
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    onDeliveryInfoChange({
      ...deliveryInfo,
      preferredDate: date,
    });
    setIsCalendarOpen(false);
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  // Get maximum date (2 weeks from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="size-5" />
          <span>Delivery Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery Address */}
        <div className="space-y-2">
          <Label htmlFor="delivery-address">
            Delivery Address <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="delivery-address"
            placeholder="Enter your complete delivery address including street, building number, floor, etc."
            value={deliveryInfo.address}
            onChange={(e) => handleAddressChange(e.target.value)}
            className="min-h-[80px] resize-none"
            required
          />
          <p className="text-xs text-muted-foreground">
            Please provide a detailed address to ensure smooth delivery
          </p>
        </div>

        {/* Preferred Delivery Date */}
        <div className="space-y-2">
          <Label>Preferred Delivery Date (Optional)</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !deliveryInfo.preferredDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 size-4" />
                {deliveryInfo.preferredDate ? (
                  format(deliveryInfo.preferredDate, "PPP")
                ) : (
                  <span>Select a preferred date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={deliveryInfo.preferredDate}
                onSelect={handleDateChange}
                disabled={(date) => date < minDate || date > maxDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            We&apos;ll try to deliver on your preferred date, but it may vary
            based on availability
          </p>
        </div>

        {/* Delivery Notes */}
        <div className="space-y-2">
          <Label htmlFor="delivery-notes">
            Special Instructions (Optional)
          </Label>
          <Textarea
            id="delivery-notes"
            placeholder="Any special instructions for delivery (e.g., call before arrival, leave with security, etc.)"
            value={deliveryInfo.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[60px] resize-none"
          />
        </div>

        {/* Delivery Info Card */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start space-x-2">
            <Clock className="mt-0.5 size-4 text-blue-600" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Delivery Information
              </p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• Delivery is usually within 2-5 business days</li>
                <li>• Our delivery team will call you before arrival</li>
                <li>• Please have the exact cash amount ready</li>
                <li>• Delivery fee may apply based on location</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
