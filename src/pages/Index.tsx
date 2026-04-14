"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, CalendarPlus, Settings, RefreshCcw, Check, AlertCircle, Sparkles } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { handleCalendarExport } from "@/services/calendarService";
import { useEventProcessor } from "@/hooks/useEventProcessor";
import { useAppSettings } from "@/hooks/useAppSettings";
import EventDetailsDisplay from "@/components/EventDetailsDisplay";
import { showError } from "@/utils/toast";

const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY || "";

const alternativeAiModules = [
  "mistral-small-2409",
  "mistral-large-latest",
  "mistral-medium-latest",
  "open-mistral-7b",
  "pixtral-12b-latest"
];

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  const isMobile = useIsMobile();
  const { moduleName, setModuleName } = useAppSettings();
  const { isLoading, extractedJson, eventDetails, processText, clearEventDetails } = useEventProcessor();

  useEffect(() => {
    if (!MISTRAL_API_KEY) {
      showError("Mistral API Key is missing! Please set VITE_MISTRAL_API_KEY in your environment.");
    }
  }, []);

  const handleRegenerateClick = (moduleOverride?: string) => {
    const moduleToUse = moduleOverride || moduleName;
    processText(inputText, moduleToUse, MISTRAL_API_KEY);
  };

  const handleProcessClick = () => {
    if (!MISTRAL_API_KEY) {
      showError("Cannot process without a Mistral API Key.");
      return;
    }
    processText(inputText, moduleName, MISTRAL_API_KEY);
  };

  const handleExportClick = () => handleCalendarExport(eventDetails);

  const handleBackToInput = () => {
    clearEventDetails();
    setInputText("");
    setShowJsonRaw(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#fafafa] relative overflow-x-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-200/30 rounded-full blur-[120px] -z-10" />

      <header className="w-full max-w-4xl px-6 pt-12 pb-8 flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center space-x-3"
        >
          <div className="bg-orange-500 p-3 rounded-2xl shadow-lg shadow-orange-200">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900">
            Ananas<span className="text-orange-500">.</span>
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl text-gray-500 font-medium max-w-lg"
        >
          Transform messy text into perfect calendar events in seconds.
        </motion.p>
      </header>

      <main className="w-full max-w-3xl px-6 pb-24 flex flex-col space-y-8">
        {!MISTRAL_API_KEY && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-800 px-4 py-3 rounded-2xl flex items-center space-x-3 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm font-semibold">
              API Key missing. Add <code className="bg-red-100 px-1 rounded">VITE_MISTRAL_API_KEY</code> to your environment.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {extractedJson ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden border-none shadow-2xl shadow-orange-100/50 bg-white/80 backdrop-blur-xl rounded-[2rem]">
                <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Event Details
                  </CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-gray-100 hover:bg-gray-200 transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <RefreshCcw className="h-5 w-5 text-gray-600" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                      <DropdownMenuLabel className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Mistral Models
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {alternativeAiModules.map((mod) => (
                        <DropdownMenuItem 
                          key={mod} 
                          onClick={() => handleRegenerateClick(mod)}
                          className="rounded-xl px-3 py-2 cursor-pointer"
                        >
                          <span className="flex-1 font-medium">{mod}</span>
                          {moduleName === mod && <Check className="ml-2 h-4 w-4 text-orange-500" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  {showJsonRaw ? (
                    <div className="bg-gray-900 rounded-2xl p-6 overflow-auto max-h-80">
                      <code className="text-orange-300 text-sm font-mono leading-relaxed">
                        {extractedJson}
                      </code>
                    </div>
                  ) : (
                    <EventDetailsDisplay eventDetails={eventDetails} />
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleExportClick}
                  className="h-16 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg shadow-lg shadow-orange-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CalendarPlus className="mr-2 h-6 w-6" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToInput}
                  className="h-16 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RefreshCcw className="mr-2 h-6 w-6" />
                  New Event
                </Button>
              </div>
              
              <button
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="w-full text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
              >
                {showJsonRaw ? "Switch to Visual View" : "View Raw Data"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                <Card className="relative border-none shadow-2xl shadow-orange-100/50 bg-white rounded-[2rem] overflow-hidden">
                  <CardContent className="p-8">
                    <Label htmlFor="event-text" className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      Input Text
                    </Label>
                    <Textarea
                      id="event-text"
                      placeholder="Paste your email, chat message, or notes here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[240px] w-full resize-none border-none focus-visible:ring-0 p-0 text-xl sm:text-2xl font-medium text-gray-800 placeholder:text-gray-300 leading-relaxed"
                    />
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleProcessClick}
                disabled={inputText.trim() === "" || isLoading || !MISTRAL_API_KEY}
                className="w-full h-20 bg-gray-900 hover:bg-black text-white font-black rounded-[2rem] text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span>Extract Event</span>
                    <Sparkles className="h-6 w-6 text-orange-500" />
                  </div>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-8 left-0 right-0 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-gray-100 px-6 py-3 rounded-full shadow-xl flex items-center space-x-6">
          <button
            onClick={() => setIsModuleNameDialogOpen(true)}
            className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span className="text-sm font-bold hidden sm:inline">{moduleName}</span>
          </button>
          <div className="h-4 w-[1px] bg-gray-200" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            Ananas v1.0
          </p>
        </div>
      </footer>

      <ModuleNameDialog
        isOpen={isModuleNameDialogOpen}
        onClose={() => setIsModuleNameDialogOpen(false)}
        currentModuleName={moduleName}
        onSave={setModuleName}
      />
    </div>
  );
};

export default Index;