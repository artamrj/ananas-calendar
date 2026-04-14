import type { EventDetails } from "@/types/event";
import { Calendar, Clock, MapPin, Link, Repeat, AlignLeft } from "lucide-react";
import {
  getEventDateRangeLabel,
  getEventTimeRangeLabel,
} from "@/lib/event-formatters";
import { formatRrule } from "@/utils/rruleFormatter";

interface EventDetailsDisplayProps {
  eventDetails: EventDetails | null;
}

const EventDetailsDisplay = ({ eventDetails }: EventDetailsDisplayProps) => {
  if (!eventDetails) {
    return (
      <div className="text-center text-gray-400 py-12 font-medium">
        No event details found.
      </div>
    );
  }

  const dateLabel = getEventDateRangeLabel(eventDetails);
  const timeLabel = getEventTimeRangeLabel(eventDetails);
  const formattedRecurrence = formatRrule(eventDetails.recurrence_rule);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="break-words text-3xl font-black leading-tight text-gray-900 sm:text-4xl">
          {eventDetails.title || "Untitled Event"}
        </h2>
        {eventDetails.description && (
          <div className="flex items-start space-x-3 pt-2">
            <AlignLeft className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
            <p className="break-words text-base leading-relaxed text-gray-600 sm:text-lg">
              {eventDetails.description}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {eventDetails.date_start && (
          <div className="flex items-start space-x-4 rounded-2xl border border-orange-100/50 bg-orange-50/50 p-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <Calendar className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Date</span>
              <span className="text-lg font-bold text-gray-900 break-words">{dateLabel}</span>
            </div>
          </div>
        )}

        {timeLabel && (
          <div className="flex items-start space-x-4 rounded-2xl border border-blue-100/50 bg-blue-50/50 p-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Time</span>
              <span className="text-lg font-bold text-gray-900 break-words">{timeLabel}</span>
            </div>
          </div>
        )}

        {eventDetails.location && (
          <div className="flex items-start space-x-4 rounded-2xl border border-green-100/50 bg-green-50/50 p-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <MapPin className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Location</span>
              <span className="text-lg font-bold text-gray-900 break-words">{eventDetails.location}</span>
            </div>
          </div>
        )}

        {eventDetails.link && (
          <div className="flex items-start space-x-4 rounded-2xl border border-purple-100/50 bg-purple-50/50 p-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <Link className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Link</span>
              <a
                href={eventDetails.link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-lg font-bold text-purple-600 hover:underline"
              >
                {eventDetails.link}
              </a>
            </div>
          </div>
        )}

        {formattedRecurrence && (
          <div className="flex items-start space-x-4 rounded-2xl border border-yellow-100/50 bg-yellow-50/50 p-4">
            <div className="rounded-xl bg-white p-2 shadow-sm">
              <Repeat className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Recurrence</span>
              <span className="text-lg font-bold text-gray-900 break-words">{formattedRecurrence}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsDisplay;
