"use client";

import {
  CheckCircle,
  Clock,
  CreditCard,
  RotateCcw,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PaymentTimelineEvent {
  id: string;
  type: "created" | "status_changed" | "refund" | "confirmation" | "note_added" | "sync_attempt" | "force_confirm";
  description: string;
  timestamp: Date;
  actor?: string;
  metadata?: Record<string, unknown>;
}

interface PaymentTimelineCell {
  events: PaymentTimelineEvent[];
  className?: string;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  maxEvents?: number;
  showActor?: boolean;
}

const eventConfig = {
  created: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Created",
  },
  status_changed: {
    icon: CreditCard,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Status Changed",
  },
  refund: {
    icon: RotateCcw,
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Refund",
  },
  confirmation: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    label: "Confirmed",
  },
  note_added: {
    icon: User,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    label: "Note Added",
  },
  sync_attempt: {
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "Sync Attempt",
  },
  force_confirm: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    label: "Force Confirmed",
  },
} as const;

const sizeConfig = {
  sm: {
    icon: "size-3",
    text: "text-xs",
    badge: "text-xs px-1.5 py-0.5",
    timeline: "gap-1",
  },
  md: {
    icon: "size-4",
    text: "text-sm",
    badge: "text-xs px-2 py-1",
    timeline: "gap-2",
  },
  lg: {
    icon: "size-5",
    text: "text-base",
    badge: "text-sm px-2.5 py-1",
    timeline: "gap-3",
  },
};

export function PaymentTimelineCell({
  events,
  className,
  variant = "default",
  size = "md",
  maxEvents = 3,
  showActor = false,
}: PaymentTimelineCell) {
  const sizeStyles = sizeConfig[size];
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const recentEvents = sortedEvents.slice(0, maxEvents);
  const remainingCount = Math.max(0, events.length - maxEvents);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Compact variant for mobile/small spaces
  if (variant === "compact") {
    const latestEvent = recentEvents[0];
    if (!latestEvent) {
      return (
        <div className={cn("text-muted-foreground", sizeStyles.text, className)}>
          No activity
        </div>
      );
    }

    const config = eventConfig[latestEvent.type];
    const Icon = config.icon;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-2", className)}>
              <div className={cn("rounded-full p-1", config.bgColor)}>
                <Icon className={cn(sizeStyles.icon, config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn(sizeStyles.text, "truncate font-medium")}>
                  {config.label}
                </div>
                <div className={cn(sizeStyles.text, "text-muted-foreground")}>
                  {formatTimestamp(latestEvent.timestamp)}
                </div>
              </div>
              {events.length > 1 && (
                <Badge variant="secondary" className={sizeStyles.badge}>
                  +{events.length - 1}
                </Badge>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">Latest Activity</div>
              <div>{latestEvent.description}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(latestEvent.timestamp).toLocaleString()}
              </div>
              {events.length > 1 && (
                <div className="text-xs text-muted-foreground">
                  +{events.length - 1} more events
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant with full timeline
  if (variant === "detailed") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Payment Timeline ({events.length} events)
          </span>
        </div>

        <div className={cn("space-y-3", sizeStyles.timeline)}>
          {recentEvents.map((event, index) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            const isLast = index === recentEvents.length - 1;

            return (
              <div key={event.id} className="flex items-start gap-3">
                <div className="relative">
                  <div className={cn("rounded-full p-2", config.bgColor)}>
                    <Icon className={cn(sizeStyles.icon, config.color)} />
                  </div>
                  {!isLast && (
                    <div className="absolute left-1/2 top-8 h-6 w-px -translate-x-1/2 bg-border" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(sizeStyles.text, "font-medium")}>
                      {config.label}
                    </span>
                    <span className={cn(sizeStyles.text, "text-muted-foreground")}>
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  <div className={cn(sizeStyles.text, "text-muted-foreground")}>
                    {event.description}
                  </div>
                  {showActor && event.actor && (
                    <Badge variant="outline" className={sizeStyles.badge}>
                      by {event.actor}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {remainingCount > 0 && (
            <div className="text-center">
              <Button variant="ghost" size="sm">
                View {remainingCount} more event{remainingCount !== 1 ? "s" : ""}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant with popover
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn("h-auto p-2", className)}>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1">
              {recentEvents.slice(0, 3).map((event, index) => {
                const config = eventConfig[event.type];
                const Icon = config.icon;
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "rounded-full border-2 border-background p-1",
                      config.bgColor
                    )}
                    style={{ zIndex: 3 - index }}
                  >
                    <Icon className={cn(sizeStyles.icon, config.color)} />
                  </div>
                );
              })}
            </div>
            <div className="text-left">
              <div className={cn(sizeStyles.text, "font-medium")}>
                {events.length} event{events.length !== 1 ? "s" : ""}
              </div>
              <div className={cn(sizeStyles.text, "text-muted-foreground")}>
                {recentEvents[0] && formatTimestamp(recentEvents[0].timestamp)}
              </div>
            </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="font-medium">Payment Timeline</div>
          <div className="space-y-3">
            {sortedEvents.map((event, index) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;
              const isLast = index === sortedEvents.length - 1;

              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="relative">
                    <div className={cn("rounded-full p-1.5", config.bgColor)}>
                      <Icon className={cn("size-3", config.color)} />
                    </div>
                    {!isLast && (
                      <div className="absolute left-1/2 top-6 h-4 w-px -translate-x-1/2 bg-border" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{config.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                    {showActor && event.actor && (
                      <Badge variant="outline" className="text-xs">
                        by {event.actor}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to create timeline events
export function createTimelineEvent(
  type: PaymentTimelineEvent["type"],
  description: string,
  actor?: string,
  metadata?: Record<string, unknown>
): Omit<PaymentTimelineEvent, "id" | "timestamp"> {
  return {
    type,
    description,
    actor,
    metadata,
  };
}

// Helper function to get event priority for sorting
export function getEventPriority(type: PaymentTimelineEvent["type"]): number {
  const priorities = {
    created: 1,
    status_changed: 2,
    confirmation: 3,
    force_confirm: 4,
    sync_attempt: 5,
    refund: 6,
    note_added: 7,
  };
  return priorities[type] || 10;
}