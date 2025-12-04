"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { generateIcs, EventDetails } from "@/lib/ics-generator";
import { Loader2, CalendarPlus, Settings } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the hook

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

  const isMobile = useIsMobile(); // Use the hook to detect mobile

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("aiModuleName", moduleName);
    }
  }, [moduleName]);

  const processText = useCallback(async () => {
    if (!inputText.trim()) {
      showError("Please enter some text to process. 📝");
      return;
    }
    if (!OPENROUTER_API_KEY) {
      showError("OpenRouter API Key is not configured. 🔑");
      return;
    }

    setIsLoading(true);
    setExtractedJson(null);
    setEventDetails(null);
    const loadingToastId = showLoading("Ananas is thinking... 🍍✨");

    try {
      const now = new Date();
      const todayDate = now.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
      const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      const contextString = `Current Date: ${todayDate}, Day of Week: ${dayOfWeek}, Current Time: ${currentTime}.`;

      const prompt = `You are an AI assistant specialized in extracting event details from unstructured text.
      ${contextString}
      Detect the language of the input text and return the JSON output in the same language.
      Extract the following event details into a JSON object. If a field is missing, leave its value as an empty string.
      The 'title' field should be a concise and specific summary of the event.
      Dates should be in YYYY-MM-DD format. Times should be in HH:MM (24-hour) format.
      Recurrence rule should be a valid iCalendar RRULE string.

      JSON Structure:
      {
        "title": "string",
        "description": "string",
        "link": "string",
        "location": "string",
        "date_start": "YYYY-MM-DD",
        "date_end": "YYYY-MM-DD",
        "time_start": "HH:MM",
        "time_end": "HH:MM",
        "recurrence_rule": "string"
      }

      Return ONLY the JSON object.

      Input Text:
      "${inputText}"`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: moduleName,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (content) {
        const parsedJson: EventDetails = JSON.parse(content);
        setExtractedJson(JSON.stringify(parsedJson, null, 2));
        setEventDetails(parsedJson);
        showSuccess("Event details extracted! ✨");
      } else {
        showError("Could not extract event details. 🧐");
      }
    } catch (error: any) {
      console.error("Error processing text:", error);
      showError(`Failed to process text: ${error.message || "Unknown error"} 💔`);
    } finally {
      setIsLoading(false);
      dismissToast(String(loadingToastId));
    }
  }, [inputText, moduleName]);

  const addToCalendar = useCallback(() => {
    if (!eventDetails || !eventDetails.date_start) {
      showError("No valid event details to add to calendar. 🗓️");
      return;
    }

    try {
      const icsContent = generateIcs(eventDetails);
      const sanitizedTitle = (eventDetails.title || "event").replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');

      // Detect Apple devices (iPhone/iPad/Mac)
      const isAppleDevice = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) && !window.MSStream;

      if (isAppleDevice) {
        const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
        window.location.href = dataUrl;
        showSuccess("Event opened in your Calendar app! 🎉");
        return;
      }

      // Fallback: download .ics
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizedTitle}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess("Event downloaded and ready to add to your calendar! 🎉");
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
              onClick={processText}
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

      {!isMobile && ( // Conditionally render the button
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 left-4 rounded-full shadow-lg bg-white hover:bg-gray-100"
          onClick={() => setIsModuleNameDialogOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}

      {!isMobile && ( // Conditionally render the dialog
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