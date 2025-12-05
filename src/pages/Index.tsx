"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarPlus, Settings, ArrowLeft } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { handleCalendarExport } from "@/services/calendarService";
import { useEventProcessor } from "@/hooks/useEventProcessor";
import { useAppSettings } from "@/hooks/useAppSettings";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);

  const isMobile = useIsMobile();
  const { moduleName, setModuleName } = useAppSettings();
  const { isLoading, extractedJson, eventDetails, processText, setExtractedJson, setEventDetails } = useEventProcessor();

  const handleProcessClick = () => processText(inputText, moduleName, OPENROUTER_API_KEY);
  const handleExportClick = () => handleCalendarExport(eventDetails);

  const handleBackToInput = () => {
    setExtractedJson(null);
    setEventDetails(null);
    setInputText(""); // Clear input text when going back
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-orange-50 to-yellow-100 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <header className="flex flex-col items-center justify-center text-center mb-6 flex-shrink-0">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-orange-600 drop-shadow-lg mb-2">
          Ananas 🍍
        </h1>
        <p className="text-lg sm:text-xl text-orange-500 font-semibold italic">
          Peel, Paste, Plan… the Ananas Way!
        </p>
      </header>

      {/* Main Content - Single Dynamic Card */}
      <main className="flex-1 flex flex-col items-center overflow-hidden space-y-6 sm:space-y-8">
        <Card className="w-full max-w-3xl flex flex-col bg-white shadow-xl border-none rounded-xl p-4 sm:p-6">
          {extractedJson ? (
            // Extracted Event Details View
            <>
              <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToInput}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex-1 text-center pr-10">
                  Extracted Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4 p-0">
                <pre className="bg-gray-50 p-3 rounded-lg text-sm sm:text-base overflow-x-auto">
                  <code>{extractedJson}</code>
                </pre>
                <Button
                  onClick={handleExportClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-base sm:text-lg flex items-center justify-center space-x-2"
                >
                  <CalendarPlus className="h-5 w-5" />
                  <span>Add to Calendar 🗓️</span>
                </Button>
              </CardContent>
            </>
          ) : (
            // Input Section View
            <>
              <CardHeader className="p-0 mb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                  Paste Your Event Text Here
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col space-y-4 p-0">
                <Label htmlFor="event-text" className="sr-only">Event Text</Label>
                <Textarea
                  id="event-text"
                  placeholder="e.g., 'Team meeting on Friday...'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={isMobile ? 6 : 8}
                  className="w-full resize-none border-2 border-orange-200 focus:border-orange-400 rounded-lg p-3 text-base sm:text-lg"
                />
                <Button
                  onClick={handleProcessClick}
                  disabled={isLoading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg text-base sm:text-lg flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Process Text with AI 🧠</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </main>

      {/* Settings Button & Dialog */}
      {!isMobile && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-4 left-4 rounded-full shadow-lg bg-white hover:bg-gray-100"
            onClick={() => setIsModuleNameDialogOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>

          <ModuleNameDialog
            isOpen={isModuleNameDialogOpen}
            onClose={() => setIsModuleNameDialogOpen(false)}
            currentModuleName={moduleName}
            onSave={setModuleName}
          />
        </>
      )}
    </div>
  );
};

export default Index;