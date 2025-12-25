"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { 
  getWhatsAppLink, 
  getViberLink,
  formatProductInquiry, 
  formatGeneralInquiry 
} from "@/lib/utils/chat-utils";
import { MessageSquare } from "lucide-react";

interface ContactMethodsProps {
  productName?: string;
  price?: string;
  className?: string;
  variant?: "floating" | "inline";
  showViber?: boolean;
}

interface PublicSettings {
  telephone: string;
  email: string;
  name: string;
}

export default function ContactMethods({ 
  productName, 
  price, 
  className,
  variant = "inline",
  showViber = false
}: ContactMethodsProps) {
  const { data: settings } = useQuery<PublicSettings | null>({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const response = await api.get<{ data: PublicSettings }>("/public/settings");
      return response.data;
    },
  });

  const telephone = settings?.telephone;

  if (!telephone) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  
  const message = productName 
    ? formatProductInquiry(productName, currentUrl, price)
    : formatGeneralInquiry();

  const methods = [
    {
      name: "WhatsApp",
      icon: <MessageCircle className="size-5" />,
      color: "bg-[#25D366] hover:bg-[#20ba5a] text-white",
      link: getWhatsAppLink(telephone, message),
    },
  ];

  if (showViber) {
    methods.push({
      name: "Viber",
      icon: <MessageSquare className="size-5" />,
      color: "bg-[#7360f2] hover:bg-[#5e4ecc] text-white",
      link: getViberLink(telephone),
    });
  }

  if (variant === "floating") {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-3 md:bottom-6 md:right-6", className)}>
        {methods.map((method) => (
          <a
            key={method.name}
            href={method.link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex size-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 md:size-12",
              method.color
            )}
            title={`Contact us on ${method.name}`}
          >
            {method.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {methods.map((method) => (
        <Button
          key={method.name}
          variant="outline"
          className={cn(
            "flex items-center gap-2 border-none shadow-sm transition-all hover:scale-105", 
            method.color
          )}
          asChild
        >
          <a href={method.link} target="_blank" rel="noopener noreferrer">
            {method.icon}
            <span>{method.name}</span>
          </a>
        </Button>
      ))}
    </div>
  );
}
