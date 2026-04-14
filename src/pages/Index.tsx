import { useMemo, useState } from "react";
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
import { Loader2, CalendarPlus, Settings, RefreshCcw, Check, Sparkles } from "lucide-react";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { handleCalendarExport } from "@/services/calendarService";
import { useEventProcessor } from "@/hooks/useEventProcessor";
import { useAppSettings } from "@/hooks/useAppSettings";
import EventDetailsDisplay from "@/components/EventDetailsDisplay";
import { showError } from "@/utils/toast";
import { getAiConfigurationStatus } from "@/services/aiClient";

const alternativeAiModules = [
  "mistral-small-2409",
  "mistral-large-latest",
  "mistral-medium-latest",
  "open-mistral-7b",
  "pixtral-12b-latest"
];

const aiConfig = getAiConfigurationStatus();

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  const { moduleName, setModuleName } = useAppSettings();
  const { isLoading, status, errorMessage, extractedJson, eventDetails, processText, clearEventDetails } =
    useEventProcessor();
  const trimmedInput = inputText.trim();
  const canSubmit = trimmedInput.length > 0 && !isLoading;
  const inputCharacterCount = useMemo(() => trimmedInput.length, [trimmedInput]);

  const handleRegenerateClick = (moduleOverride?: string) => {
    const moduleToUse = moduleOverride || moduleName;
    processText(inputText, moduleToUse);
  };

  const handleProcessClick = () => {
    if (!trimmedInput) {
      showError("Enter some event text before extracting.");
      return;
    }

    processText(inputText, moduleName);
  };

  const handleExportClick = () => handleCalendarExport(eventDetails);

  const handleBackToInput = () => {
    clearEventDetails();
    setInputText("");
    setShowJsonRaw(false);
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#faf7f2]">
      {/* Decorative Background Elements */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-orange-200/30 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-yellow-200/30 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white/80 via-white/35 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8">
      <header className="mx-auto flex w-full max-w-4xl shrink-0 flex-col items-center px-2 pb-6 pt-4 text-center sm:pb-8 sm:pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-wrap items-end justify-center gap-2 sm:gap-3"
        >
          <div className="flex items-end self-end rounded-2xl bg-transparent p-0 pb-0.5 sm:pb-1">
            <span className="inline-block text-5xl leading-none sm:text-6xl lg:text-7xl" role="img" aria-label="pineapple">
              🍍
            </span>
          </div>
          <h1 className="self-end text-4xl font-black leading-none tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Ananas<span className="text-orange-500">.</span>
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-2 text-xs font-black uppercase tracking-[0.22em] text-orange-500 sm:text-sm"
        >
          Paste, Peel and Put to the Calendar.. the Ananas Way!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mt-3 max-w-2xl text-sm font-medium text-gray-500 sm:text-base lg:text-lg"
        >
          Transform messy text into perfect calendar events in seconds.
        </motion.p>
      </header>

      <main className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-2 pb-6 sm:pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 space-y-0"
        >
          {status === "error" && errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl text-sm font-medium">
              {errorMessage}
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {extractedJson ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex min-h-0 flex-1 flex-col space-y-4 sm:space-y-6"
            >
              <Card className="flex min-h-[28rem] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between px-5 pb-3 pt-5 sm:px-8 sm:pb-4 sm:pt-8">
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
                <CardContent className="min-h-0 flex-1 px-5 pb-5 sm:px-8 sm:pb-8">
                  {showJsonRaw ? (
                    <div className="max-h-[26rem] overflow-auto rounded-2xl bg-gray-900 p-6">
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
                  className="h-14 rounded-2xl bg-orange-500 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all hover:scale-[1.01] hover:bg-orange-600 active:scale-[0.98] sm:h-16 sm:text-lg"
                >
                  <CalendarPlus className="mr-2 h-6 w-6" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToInput}
                  className="h-14 rounded-2xl border-2 border-gray-200 text-base font-bold text-gray-700 transition-all hover:scale-[1.01] hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98] sm:h-16 sm:text-lg"
                >
                  <RefreshCcw className="mr-2 h-6 w-6" />
                  New Event
                </Button>
              </div>
              
              <button
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="w-full text-sm font-semibold text-gray-400 transition-colors hover:text-gray-600"
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
              transition={{ duration: 0.25 }}
              className="flex min-h-0 flex-1 flex-col justify-start space-y-4 sm:space-y-6"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-[2.5rem] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200"></div>
                <Card className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-white/60 bg-white/92 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
                  <CardContent className="flex min-h-[28rem] flex-col p-5 sm:p-8">
                    <Label htmlFor="event-text" className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      Input Text
                    </Label>
                    <Textarea
                      id="event-text"
                      placeholder="Paste your email, chat message, or notes here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[16rem] flex-1 resize-none border-none p-0 text-base font-medium leading-relaxed text-gray-800 placeholder:text-gray-300 focus-visible:ring-0 sm:min-h-[18rem] sm:text-lg lg:min-h-[20rem] lg:text-xl"
                    />
                    <div className="mt-4 flex flex-col gap-1 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>{inputCharacterCount} characters</span>
                      <span>{aiConfig.hasProxy ? "Server-first AI flow" : "Direct browser AI flow"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button
                onClick={handleProcessClick}
                disabled={!canSubmit}
                className="mt-4 sm:mt-6 h-16 w-full rounded-[2rem] bg-gray-900 text-lg font-black text-white shadow-xl transition-all hover:scale-[1.01] hover:bg-black active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 sm:h-20 sm:text-xl"
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
        </div>
      </main>

      <footer className="mt-6 flex shrink-0 justify-center pt-3 sm:mt-8 sm:pt-4">
        <div className="pointer-events-auto flex items-center space-x-4 rounded-full border border-gray-100 bg-white/88 px-4 py-2.5 shadow-xl backdrop-blur-md sm:space-x-6 sm:px-6 sm:py-3">
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
      </div>

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
