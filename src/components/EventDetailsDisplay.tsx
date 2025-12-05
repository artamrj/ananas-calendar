"use client";

import React from "react";
import { EventDetails } from "@/lib/ics-generator";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <>
      <CardHeader className="pb-4 border-b border-gray-100 mb-4 p-0">
        <CardTitle className="text-3xl font-extrabold text-orange-700">
          {eventDetails.title || "Untitled Event"}
        </CardTitle>
        {eventDetails.description && (
          <CardDescription className="text-gray-600 mt-2 text-base leading-relaxed">
            {eventDetails.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 text-gray-800 p-0">
        {eventDetails.date_start && (
          <div className="flex items-start space-x-3">
            <Calendar className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="font-semibold text-lg">{displayDate()}</span>
          </div>
        )}
        {(eventDetails.time_start || eventDetails.time_end) && (
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="font-semibold text-lg">{displayTime()}</span>
          </div>
        )}
        {eventDetails.location && (
          <div className="flex items-start space-x-3">
            <MapPin className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="text-lg">{eventDetails.location}</span>
          </div>
        )}
        {eventDetails.link && (
          <div className="flex items-start space-x-3">
            <Link className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
            <a
              href={eventDetails.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors text-lg"
            >
              {eventDetails.link}
            </a>
          </div>
        )}
        {eventDetails.recurrence_rule && (
          <div className="flex items-start space-x-3">
            <Repeat className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
            <span className="text-sm text-gray-500 italic">
              Recurrence: {eventDetails.recurrence_rule}
            </span>
          </div>
        )}
        {(!eventDetails.title && !eventDetails.description && !eventDetails.date_start && !eventDetails.location && !eventDetails.link && !eventDetails.recurrence_rule) && (
          <div className="flex items-center space-x-3 text-gray-500 italic">
            <Info className="h-6 w-6" />
            <span>No specific details extracted.</span>
          </div>
        )}
      </CardContent>
    </>
  );
};

export default EventDetailsDisplay;