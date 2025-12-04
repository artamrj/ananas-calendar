"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarPlus, Settings } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useIsMobile } from "@/hooks/use-mobile";

// Imports from our new clean services/hooks
import { handleCalendarExport } from "@/services/calendarService";
import { useEventProcessor } from "@/hooks/useEventProcessor";
import { useAppSettings } from "@/hooks/useAppSettings";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "";

const Index = () => {
  // UI State
  const [inputText, setInputText] = useState("");
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);
  
  // Custom Hooks
  const isMobile = useIsMobile();
  const { moduleName, setModuleName } = useAppSettings();
  const { isLoading, extractedJson, eventDetails, processText } = useEventProcessor();

  const handleProcessClick = () => {
    processText(inputText, moduleName, OPENROUTER_API_KEY);
  };

  const handleExportClick = () => {
    handleCalendarExport(eventDetails);
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

        {/* Input Area */}
        <Card className="bg-white shadow-xl border-none rounded-xl p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">Paste Your Event Text Here</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <Label htmlFor="event-text" className="sr-only">Event Text</Label>
            <Textarea
              id="event-text"
              placeholder="e.g., 'Team meeting on Friday...'"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              className="w-full resize-y border-2 border-orange-200 focus:border-orange-400 rounded-lg p-3 text-lg transition-all duration-200"
            />
            <Button
              onClick={handleProcessClick}
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

        {/* Result Area */}
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
                onClick={handleExportClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add to Calendar <span className="ml-2">🗓️</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Button */}
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

      {/* Settings Dialog */}
      {!isMobile && (
        <ModuleNameDialog
          isOpen={isModuleNameDialogOpen}
          onClose={() => setIsModuleNameDialogOpen(false)}
          currentModuleName={moduleName}
          onSave={setModuleName}
        />
      )}
    </div>
  );
};

export default Index;