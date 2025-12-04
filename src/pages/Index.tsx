"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import { generateIcs, EventDetails } from "@/lib/ics-generator";
import { Loader2, CalendarPlus, Settings } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { processTextWithAI } from "@/services/aiService"; // Import the new service

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const DEFAULT_MODULE_NAME = "openai/gpt-oss-safeguard-20b";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [extractedJson, setExtractedJson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);
  const [moduleName, setModuleName] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aiModuleName") || DEFAULT_MODULE_NAME;
    }
    return DEFAULT_MODULE_NAME;
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModuleName", moduleName);
    }
  }, [moduleName]);

  const handleProcessText = useCallback(async () => {
    setIsLoading(true);
    setExtractedJson(null);
    setEventDetails(null);

    const apiCallPromise = processTextWithAI(
      inputText,
      moduleName,
      OPENROUTER_API_KEY || "" // Pass the API key
    );

    toast.promise(apiCallPromise, {
      loading: "Ananas is thinking... 🍍✨",
      success: (result) => {
        setExtractedJson(result.extractedJson);
        setEventDetails(result.eventDetails);
        return "Event details extracted! ✨";
      },
      error: (err: any) => {
        console.error("Error processing text:", err);
        return `Failed to process text: ${err.message || "Unknown error"} 💔`;
      },
      finally: () => {
        setIsLoading(false);
      }
    });
  }, [inputText, moduleName]);

  const addToCalendar = useCallback(() => {
    if (!eventDetails || !eventDetails.date_start) {
      showError("No valid event details to add to calendar. 🗓️");
      return;
    }

    try {
      const icsContent = generateIcs(eventDetails);
      const sanitizedTitle = (eventDetails.title || "event").replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

      const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;

      if (isAppleDevice) {
        const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
        window.location.href = dataUrl;
        toast.success("Event opened in your Calendar app! 🎉");
        return;
      }

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedTitle}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Event downloaded and ready to add to your calendar! 🎉");
    } catch (error: any) {
      console.error(error);
      showError(`Failed to add event to calendar: ${error.message || "Unknown error"} 😭`);
    }
  }, [eventDetails]);

  const handleSaveModuleName = (newModuleName: string) => {
    setModuleName(newModuleName);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-5xl font-extrabold text-center text-orange-600 drop-shadow-lg mb-2">
          Ananas 🍍
        </h1>
        <p className="text-xl text-center text-orange-500 font-semibold italic mb-8">
          Peel, Paste, Plan… the Ananas Way!
        </p>

        <Card className="bg-white shadow-xl border-none rounded-xl p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Paste Your Event Text Here</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <Label htmlFor="event-text" className="sr-only">Event Text</Label>
            <Textarea
              id="event-text"
              placeholder="e.g., 'Team meeting on Friday, October 27th at 3 PM in Conference Room A. Agenda: Q4 Planning. Link: meet.google.com/abc-xyz'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="w-full resize-y border-2 border-orange-200 focus:border-orange-400 rounded-lg p-3 text-lg transition-all duration-200"
            />
            <Button
              onClick={handleProcessText}
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Process Text with AI <span className="ml-2">🧠</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {extractedJson && (
          <Card className="bg-white shadow-xl border-none rounded-xl p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">Extracted Event Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-200">
                <code>{extractedJson}</code>
              </pre>
              <Button
                onClick={addToCalendar}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add to Calendar <span className="ml-2">🗓️</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {!isMobile && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 rounded-full shadow-lg bg-white hover:bg-gray-100"
          onClick={() => setIsModuleNameDialogOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}

      {!isMobile && (
        <ModuleNameDialog
          isOpen={isModuleNameDialogOpen}
          onClose={() => setIsModuleNameDialogOpen(false)}
          currentModuleName={moduleName}
          onSave={handleSaveModuleName}
        />
      )}
    </div>
  );
};

export default Index;