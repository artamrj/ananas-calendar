"use client";

import React from "react";
import { EventDetails } from "@/lib/ics-generator";
import { Calendar, Clock, MapPin, Link, Repeat, AlignLeft } from "lucide-react";
import { formatRrule } from "@/utils/rruleFormatter";

interface EventDetailsDisplayProps {
  eventDetails: EventDetails | null;
}

const EventDetailsDisplay: React.FC<EventDetailsDisplayProps> = ({ eventDetails }) => {
  if (!eventDetails) {
    return (
      <div className="text-center text-gray-400 py-12 font-medium">
        No event details found.
      </div>
    );
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat(navigator.language, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
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
        hour12: false,
      }).format(date);
    } catch (e) {
      return timeString;
    }
  };

  const displayDate = () => {
    const start = formatDate(eventDetails.date_start);
    const end = formatDate(eventDetails.date_end);
    if (start === end || !end) return start;
    return `${start} — ${end}`;
  };

  const displayTime = () => {
    const start = formatTime(eventDetails.time_start);
    const end = formatTime(eventDetails.time_end);
    if (!start) return null;
    if (start === end || !end) return start;
    return `${start} to ${end}`;
  };

  const formattedRecurrence = formatRrule(eventDetails.recurrence_rule);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
          {eventDetails.title || "Untitled Event"}
        </h2>
        {eventDetails.description && (
          <div className="flex items-start space-x-3 pt-2">
            <AlignLeft className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
            <p className="text-gray-600 text-lg leading-relaxed">
              {eventDetails.description}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {eventDetails.date_start && (
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100/50">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Date</span>
              <span className="text-lg font-bold text-gray-900">{displayDate()}</span>
            </div>
          </div>
        )}

        {displayTime() && (
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Time</span>
              <span className="text-lg font-bold text-gray-900">{displayTime()}</span>
            </div>
          </div>
        )}

        {eventDetails.location && (
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-green-50/50 border border-green-100/50">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Location</span>
              <span className="text-lg font-bold text-gray-900">{eventDetails.location}</span>
            </div>
          </div>
        )}

        {eventDetails.link && (
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100/50">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Link className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Link</span>
              <a
                href={eventDetails.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-purple-600 hover:underline truncate"
              >
                {eventDetails.link}
              </a>
            </div>
          </div>
        )}

        {formattedRecurrence && (
          <div className="flex items-center space-x-4 p-4 rounded-2xl bg-yellow-50/50 border border-yellow-100/50">
            <div className="bg-white p-2 rounded-xl shadow-sm">
              <Repeat className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Recurrence</span>
              <span className="text-lg font-bold text-gray-900">{formattedRecurrence}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsDisplay;