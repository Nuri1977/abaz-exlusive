"use client";

import {
  CheckCircle,
  Clock,
  FileText,
  RotateCcw,
  XCircle,
  Zap,
} from "lucide-react";

import type { PaymentTimelineEvent } from "@/types/payment-details";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentTimelineProps {
  events: PaymentTimelineEvent[];
  showAdminDetails?: boolean;
}

export function PaymentTimeline({
  events,
  showAdminDetails = false,
}: PaymentTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Payment Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedEvents.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === sortedEvents.length - 1}
              showAdminDetails={showAdminDetails}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineEvent({
  event,
  isLast,
  showAdminDetails,
}: {
  event: PaymentTimelineEvent;
  isLast: boolean;
  showAdminDetails: boolean;
}) {
  const icon = getEventIcon(event.type);
  const color = getEventColor(event.type);

  return (
    <div className="flex gap-4">
      {/* Timeline Icon */}
      <div className="relative flex flex-col items-center">
        <div
          className={`flex size-8 items-center justify-center rounded-full ${color}`}
        >
          {icon}
        </div>
        {!isLast && (
          <div
            className="h-full w-0.5 bg-border"
            style={{ minHeight: "2rem" }}
          />
        )}
      </div>

      {/* Event Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-medium">{event.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {event.type.replace("_", " ")}
          </Badge>
        </div>

        {/* Admin Details */}
        {showAdminDetails && event.actor && (
          <p className="mt-1 text-xs text-muted-foreground">
            By: {event.actor}
          </p>
        )}

        {/* Event Metadata */}
        {event.metadata && (
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            {event.metadata.previousStatus && event.metadata.newStatus && (
              <p>
                Status changed from{" "}
                <span className="font-medium">
                  {event.metadata.previousStatus}
                </span>{" "}
                to{" "}
                <span className="font-medium">{event.metadata.newStatus}</span>
              </p>
            )}
            {event.metadata.refundAmount && (
              <p>
                Refund amount:{" "}
                <span className="font-medium">
                  {event.metadata.refundAmount}
                </span>
              </p>
            )}
            {event.metadata.refundReason && (
              <p>Reason: {event.metadata.refundReason}</p>
            )}
            {event.metadata.notes && <p>Notes: {event.metadata.notes}</p>}
            {event.metadata.syncResult && (
              <p>Sync result: {event.metadata.syncResult}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getEventIcon(type: PaymentTimelineEvent["type"]) {
  switch (type) {
    case "created":
      return <Clock className="size-4 text-white" />;
    case "status_changed":
      return <Zap className="size-4 text-white" />;
    case "refund":
      return <RotateCcw className="size-4 text-white" />;
    case "confirmation":
      return <CheckCircle className="size-4 text-white" />;
    case "note_added":
      return <FileText className="size-4 text-white" />;
    case "sync_attempt":
      return <Zap className="size-4 text-white" />;
    case "force_confirm":
      return <CheckCircle className="size-4 text-white" />;
    default:
      return <Clock className="size-4 text-white" />;
  }
}

function getEventColor(type: PaymentTimelineEvent["type"]) {
  switch (type) {
    case "created":
      return "bg-blue-500";
    case "status_changed":
      return "bg-purple-500";
    case "refund":
      return "bg-orange-500";
    case "confirmation":
    case "force_confirm":
      return "bg-green-500";
    case "note_added":
      return "bg-gray-500";
    case "sync_attempt":
      return "bg-indigo-500";
    default:
      return "bg-gray-500";
  }
}
