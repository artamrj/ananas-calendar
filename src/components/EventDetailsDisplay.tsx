"use client";

import React from "react";
import { EventDetails } from "@/lib/ics-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Link, Repeat, Info } from "lucide-react";

interface EventDetailsDisplayProps {
  eventDetails: EventDetails | null;
}

const EventDetailsDisplay: React.FC<EventDetailsDisplayProps> = ({ eventDetails }) => {
  if (!eventDetails) {
    return (
      <div className="text-center text-gray-500 py-8">
        No event details to display.
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat(navigator.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return dateString; // Fallback to raw string if parsing fails
    }
  };

  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);
      return new Intl.DateTimeFormat(navigator.language, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Changed to false for 24-hour format
      }).format(date);
    } catch (e) {
      console.error("Error formatting time:", timeString, e);
      return timeString; // Fallback to raw string if parsing fails
    }
  };

  const displayDate = () => {
    const start = formatDate(eventDetails.date_start);
    const end = formatDate(eventDetails.date_end);
    if (start === end || !end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  const displayTime = () => {
    const start = formatTime(eventDetails.time_start);
    const end = formatTime(eventDetails.time_end);
    if (start === end || !end) {
      return start;
    }
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm border-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {eventDetails.title || "Untitled Event"}
          </CardTitle>
          {eventDetails.description && (
            <CardDescription className="text-gray-700 mt-2">
              {eventDetails.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-3 text-gray-800">
          {eventDetails.date_start && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{displayDate()}</span>
            </div>
          )}
          {(eventDetails.time_start || eventDetails.time_end) && (
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="font-medium">{displayTime()}</span>
            </div>
          )}
          {eventDetails.location && (
            <div className="flex items-start space-x-2">
              <MapPin className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span>{eventDetails.location}</span>
            </div>
          )}
          {eventDetails.link && (
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-orange-500" />
              <a
                href={eventDetails.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {eventDetails.link}
              </a>
            </div>
          )}
          {eventDetails.recurrence_rule && (
            <div className="flex items-start space-x-2">
              <Repeat className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">
                Recurrence: {eventDetails.recurrence_rule}
              </span>
            </div>
          )}
          {(!eventDetails.title && !eventDetails.description && !eventDetails.date_start && !eventDetails.location && !eventDetails.link && !eventDetails.recurrence_rule) && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Info className="h-5 w-5" />
              <span>No specific details extracted.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailsDisplay;