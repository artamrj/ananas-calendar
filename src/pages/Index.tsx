import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  CalendarPlus,
  Check,
  Clock3,
  Download,
  Loader2,
  RefreshCcw,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EventDetailsDisplay from "@/components/EventDetailsDisplay";
import ModuleNameDialog from "@/components/ModuleNameDialog";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useEventProcessor } from "@/hooks/useEventProcessor";
import { useLocalCalendarHistory } from "@/hooks/useLocalCalendarHistory";
import { getEventDateRangeLabel, getEventTimeRangeLabel } from "@/lib/event-formatters";
import { getAiConfigurationStatus } from "@/services/aiClient";
import { handleCalendarExport } from "@/services/calendarService";
import type { LocalCalendarRecord } from "@/types/event";
import { showError } from "@/utils/toast";

const alternativeAiModules = [
  "mistral-small-2409",
  "mistral-large-latest",
  "mistral-medium-latest",
  "open-mistral-7b",
  "pixtral-12b-latest",
];

const aiConfig = getAiConfigurationStatus();
const ARCHIVE_PAGE_SIZE = 10;

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const getLastTouchedLabel = (record: LocalCalendarRecord) =>
  timestampFormatter.format(new Date(record.updatedAt));

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [isModuleNameDialogOpen, setIsModuleNameDialogOpen] = useState(false);
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [visibleArchiveCount, setVisibleArchiveCount] = useState(ARCHIVE_PAGE_SIZE);

  const { moduleName, setModuleName } = useAppSettings();
  const {
    isLoading,
    status,
    errorMessage,
    extractedJson,
    eventDetails,
    processText,
    clearEventDetails,
    loadStoredEvent,
  } = useEventProcessor();
  const {
    history,
    saveCalendar,
    removeCalendar,
    clearHistory,
    markCalendarExported,
  } = useLocalCalendarHistory();

  const trimmedInput = inputText.trim();
  const canSubmit = trimmedInput.length > 0 && !isLoading;
  const inputCharacterCount = useMemo(() => trimmedInput.length, [trimmedInput]);
  const activeRecord = history.find((record) => record.id === activeRecordId) ?? null;
  const visibleHistory = useMemo(
    () => history.slice(0, visibleArchiveCount),
    [history, visibleArchiveCount]
  );
  const hasMoreArchiveItems = history.length > visibleHistory.length;

  const persistProcessedEvent = (nextInputText: string, payload: { extractedJson: string; eventDetails: NonNullable<typeof eventDetails> }) => {
    const savedRecord = saveCalendar({
      sourceText: nextInputText,
      eventDetails: payload.eventDetails,
      extractedJson: payload.extractedJson,
      lastExportedAt: undefined,
    });

    setActiveRecordId(savedRecord.id);
    setVisibleArchiveCount((currentCount) => Math.max(currentCount, ARCHIVE_PAGE_SIZE));
    setShowJsonRaw(false);
  };

  const handleRegenerateClick = async (moduleOverride?: string) => {
    const moduleToUse = moduleOverride || moduleName;
    setActiveRecordId(null);

    try {
      const payload = await processText(inputText, moduleToUse);
      persistProcessedEvent(inputText, payload);
    } catch {
      // Toast and hook state already reflect the failure.
    }
  };

  const handleProcessClick = async () => {
    if (!trimmedInput) {
      showError("Enter some event text before extracting.");
      return;
    }

    setActiveRecordId(null);

    try {
      const payload = await processText(inputText, moduleName);
      persistProcessedEvent(inputText, payload);
    } catch {
      // Toast and hook state already reflect the failure.
    }
  };

  const handleExportClick = () => {
    const didExport = handleCalendarExport(eventDetails);

    if (didExport && activeRecordId) {
      markCalendarExported(activeRecordId);
    }
  };

  const handleBackToInput = () => {
    resetComposerState();
  };

  const handleOpenRecord = (record: LocalCalendarRecord) => {
    setInputText(record.sourceText);
    setActiveRecordId(record.id);
    setShowJsonRaw(false);
    loadStoredEvent({
      eventDetails: record.eventDetails,
      extractedJson: record.extractedJson,
    });
  };

  const handleDeleteRecord = (recordId: string) => {
    if (recordId === activeRecordId) {
      clearEventDetails();
      setShowJsonRaw(false);
      setActiveRecordId(null);
    }

    removeCalendar(recordId);
  };

  const handleClearArchive = () => {
    clearHistory();
    resetComposerState();
    setVisibleArchiveCount(ARCHIVE_PAGE_SIZE);
  };

  const resetComposerState = () => {
    clearEventDetails();
    setInputText("");
    setShowJsonRaw(false);
    setActiveRecordId(null);
  };

  return (
    <div className="min-h-dvh w-full overflow-x-hidden bg-[#f6f1e8] text-gray-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,211,148,0.45),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,237,193,0.55),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.75),_rgba(246,241,232,0.96))]" />
        <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-orange-300/20 blur-[120px]" />
        <div className="absolute bottom-8 right-[-10%] h-80 w-80 rounded-full bg-amber-200/35 blur-[140px]" />
      </div>

      <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-4 pb-6 pt-6 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
        <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-6 sm:pb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-wrap items-end gap-3"
              >
                <span className="inline-block text-5xl leading-none sm:text-6xl lg:text-7xl" role="img" aria-label="pineapple">
                  🍍
                </span>
                <h1 className="text-4xl font-black leading-none tracking-tight sm:text-6xl lg:text-7xl">
                  Ananas<span className="text-orange-500">.</span>
                </h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-3 text-xs font-black uppercase tracking-[0.26em] text-orange-500 sm:text-sm"
              >
                Paste, Peel and Put to the Calendar.. the Ananas Way!
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="mt-3 max-w-2xl text-sm font-medium text-gray-600 sm:text-base lg:text-lg"
              >
                Transform messy text into perfect calendar events in seconds.
              </motion.p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setIsModuleNameDialogOpen(true)}
                className="rounded-[1.75rem] border border-white/70 bg-white/80 px-4 py-3 text-left shadow-lg shadow-orange-100/40 backdrop-blur-xl transition hover:bg-white"
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                  <Settings className="h-4 w-4" />
                  AI Module
                </span>
                <span className="mt-2 block text-sm font-semibold text-gray-900">{moduleName}</span>
              </button>
              <div className="rounded-[1.75rem] border border-white/70 bg-gray-950 px-4 py-3 text-white shadow-xl shadow-black/10">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Storage</span>
                <span className="mt-2 block text-sm font-semibold">
                  {history.length} saved {history.length === 1 ? "calendar" : "calendars"}
                </span>
                <span className="mt-1 block text-xs text-white/60">
                  {aiConfig.hasProxy ? "Server-first AI flow" : "Direct browser AI flow"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1.6fr)_24rem] lg:items-stretch">
          <section className="min-h-0">
            {status === "error" && errorMessage && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {errorMessage}
              </div>
            )}

            <AnimatePresence mode="wait">
              {extractedJson ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/86 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
                    <CardHeader className="flex flex-col gap-4 px-5 pb-0 pt-5 sm:px-8 sm:pt-8">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <CardTitle className="text-2xl font-bold text-orange-500">Event Details</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-10 w-10 rounded-full bg-gray-100 transition-all hover:bg-gray-200"
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
                                className="cursor-pointer rounded-xl px-3 py-2"
                              >
                                <span className="flex-1 font-medium">{mod}</span>
                                {moduleName === mod && <Check className="ml-2 h-4 w-4 text-orange-500" />}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {activeRecord?.lastExportedAt && (
                        <div className="pb-5 sm:pb-6">
                          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-700">
                            Exported {activeRecord.exportCount}x
                          </div>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="px-5 pb-5 sm:px-8 sm:pb-8">
                      {showJsonRaw ? (
                        <div className="max-h-[26rem] overflow-auto rounded-2xl bg-gray-950 p-6">
                          <code className="text-sm leading-relaxed text-orange-300">{extractedJson}</code>
                        </div>
                      ) : (
                        <EventDetailsDisplay eventDetails={eventDetails} />
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    type="button"
                    onClick={() => setShowJsonRaw(!showJsonRaw)}
                    className="w-full text-sm font-semibold text-gray-400 transition-colors hover:text-gray-700"
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
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-orange-400 to-yellow-400 opacity-20 blur transition duration-700 group-focus-within:opacity-40" />
                    <Card className="relative min-h-[30rem] overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 shadow-2xl shadow-orange-100/50 backdrop-blur-xl">
                      <CardContent className="flex min-h-[30rem] flex-col p-5 sm:p-8">
                        <Label
                          htmlFor="event-text"
                          className="mb-4 block text-sm font-bold uppercase tracking-widest text-gray-400"
                        >
                          Input Text
                        </Label>
                        <Textarea
                          id="event-text"
                          placeholder="Paste your email, chat message, or notes here..."
                          value={inputText}
                          onChange={(event) => setInputText(event.target.value)}
                          className="min-h-[18rem] flex-1 resize-none border-none bg-transparent p-0 text-base font-medium leading-relaxed text-gray-800 placeholder:text-gray-300 focus-visible:ring-0 sm:min-h-[20rem] sm:text-lg lg:text-xl"
                        />
                        <div className="mt-4 flex flex-col gap-2 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                          <span>{inputCharacterCount} characters</span>
                          <span>Auto-saves on successful extraction</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button
                    onClick={handleProcessClick}
                    disabled={!canSubmit}
                    className="h-16 w-full rounded-[2rem] bg-gray-950 text-lg font-black text-white shadow-xl transition-all hover:scale-[1.01] hover:bg-black active:scale-[0.98] disabled:hover:scale-100 sm:h-20 sm:text-xl"
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
          </section>

          <aside className="w-full">
            <Card className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/82 shadow-2xl shadow-orange-100/40 backdrop-blur-xl lg:flex lg:h-[30rem] lg:flex-col">
              <CardHeader className="gap-5 px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-orange-50 p-3 text-orange-500">
                      <Archive className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-black uppercase tracking-[0.18em] text-orange-500">
                      Calendar Archive
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6 lg:flex lg:flex-1 lg:min-h-0 lg:flex-col lg:overflow-hidden">
                {history.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-gray-700">No calendars saved yet.</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Extract an event and it will appear here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
                    {visibleHistory.map((record) => {
                      const isSelected = record.id === activeRecordId;
                      const dateLabel = getEventDateRangeLabel(record.eventDetails);
                      const timeLabel = getEventTimeRangeLabel(record.eventDetails);

                      return (
                        <div
                          key={record.id}
                          className={`rounded-[1.5rem] border p-4 transition ${
                            isSelected
                              ? "border-orange-300 bg-orange-50/90 shadow-lg shadow-orange-100/50"
                              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => handleOpenRecord(record)}
                              className="min-w-0 flex-1 text-left"
                            >
                              <p className="truncate text-base font-bold text-gray-900">
                                {record.eventDetails.title || "Untitled Event"}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">{dateLabel}</p>
                              {timeLabel && (
                                <p className="mt-1 flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                                  <Clock3 className="h-3.5 w-3.5" />
                                  {timeLabel}
                                </p>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDeleteRecord(record.id);
                              }}
                              className="rounded-full p-2 text-gray-400 transition hover:bg-white hover:text-red-500"
                              aria-label={`Delete ${record.eventDetails.title || "saved event"}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenRecord(record)}
                            className="mt-4 flex w-full flex-wrap items-center gap-2 text-left text-xs font-semibold text-gray-500"
                          >
                            <span className="rounded-full bg-gray-100 px-2.5 py-1">{getLastTouchedLabel(record)}</span>
                            {record.exportCount > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sky-700">
                                <Download className="h-3 w-3" />
                                {record.exportCount} exports
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}

                    {hasMoreArchiveItems && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleArchiveCount((currentCount) => currentCount + ARCHIVE_PAGE_SIZE)}
                        className="h-12 w-full rounded-[1.5rem] border-gray-300 text-sm font-bold text-gray-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
                      >
                        Load More
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClearArchive}
                      className="h-12 w-full rounded-[1.5rem] border-dashed border-gray-300 text-sm font-bold text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    >
                      Clear Archive
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>

      <ModuleNameDialog
        isOpen={isModuleNameDialogOpen}
        onClose={() => setIsModuleNameDialogOpen(false)}
        onSave={(name) => {
          setModuleName(name);
          setIsModuleNameDialogOpen(false);
        }}
        currentModuleName={moduleName}
      />
    </div>
  );
};

export default Index;
