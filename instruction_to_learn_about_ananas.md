# 📚 Instructions to Learn About Ananas Calendar

This guide will help you understand **Ananas Calendar**—an AI-powered text-to-calendar event extractor. Follow these steps to explore the project, its architecture, and how it works.

---

---

## **🎯 Step 1: Start with the README**
The [`README.md`](README.md) is the best place to begin. It covers:
- **What Ananas does** (converts messy text into structured calendar events).
- **Key features** (AI extraction, `.ics` export, local archive, etc.).
- **Tech stack** (React, TypeScript, Mistral AI, Tailwind CSS, etc.).
- **Project structure** (where to find code for different functionalities).
- **How to run the project locally** (setup, environment variables, deployment).

✅ **Action**: Read the [README.md](README.md) first.

---

---

## **🏗️ Step 2: Understand the Architecture**
Ananas follows a **modular architecture**. Here’s how the pieces fit together:

### **1. Frontend (React + TypeScript)**
- **Main App**: [`src/App.tsx`](src/App.tsx) (React Router setup).
- **Main Page**: [`src/pages/Index.tsx`](src/pages/Index.tsx) (UI, state management, event processing).
- **Components**:
  - [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx) (renders extracted event details).
  - [`src/components/ModuleNameDialog.tsx`](src/components/ModuleNameDialog.tsx) (dialog for changing AI models).
- **UI Library**: Uses **shadcn/ui** (pre-built, accessible components like `Button`, `Card`, `Dialog`).

### **2. AI Integration**
- **Proxy**: [`api/mistral.ts`](api/mistral.ts) (server-side proxy for Mistral API).
- **Client**: [`src/services/aiClient.ts`](src/services/aiClient.ts) (calls the proxy).
- **Service**: [`src/services/aiService.ts`](src/services/aiService.ts) (handles extraction & summarization).
- **Prompts**:
  - [`src/ai-prompts/eventExtractionPrompt.ts`](src/ai-prompts/eventExtractionPrompt.ts) (prompt for extracting event details).
  - [`src/ai-prompts/summarizationPrompt.ts`](src/ai-prompts/summarizationPrompt.ts) (prompt for summarizing long descriptions).

### **3. Data Flow**
1. User pastes text → [`src/pages/Index.tsx`](src/pages/Index.tsx) (input handling).
2. Text sent to `/api/mistral` → [`api/mistral.ts`](api/mistral.ts) (proxy).
3. Proxy forwards to Mistral API → Returns structured JSON.
4. JSON validated → [`src/types/event.ts`](src/types/event.ts) (Zod schema).
5. Event displayed → [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx).
6. Event saved to local archive → [`src/hooks/useLocalCalendarHistory.ts`](src/hooks/useLocalCalendarHistory.ts).
7. User exports `.ics` file → [`src/services/calendarService.ts`](src/services/calendarService.ts).

✅ **Action**: Open these files and trace the flow from input to export.

---

---

## **🔍 Step 3: Explore Key Features in Code**
### **1. AI-Powered Extraction**
- **File**: [`src/services/aiService.ts`](src/services/aiService.ts)
- **What it does**:
  - Calls Mistral AI via the proxy.
  - Validates the AI response using Zod.
  - Summarizes long descriptions automatically.
- **Key Functions**:
  - `processTextForEventExtraction()`: Extracts event details from text.
  - `summarizeEventDescription()`: Shortens long descriptions.

### **2. Local Archive**
- **File**: [`src/hooks/useLocalCalendarHistory.ts`](src/hooks/useLocalCalendarHistory.ts)
- **What it does**:
  - Saves extracted events to `localStorage`.
  - Tracks export counts and timestamps.
- **Key Functions**:
  - `saveCalendar()`: Saves a new event to the archive.
  - `removeCalendar()`: Deletes an event from the archive.
  - `markCalendarExported()`: Updates export count.

### **3. Calendar Export (`.ics` Files)**
- **File**: [`src/lib/ics-generator.ts`](src/lib/ics-generator.ts)
- **What it does**:
  - Generates `.ics` files (iCalendar format).
  - Supports timed events, all-day events, and recurrence rules (`RRULE`).
- **Key Function**:
  - `generateIcs()`: Creates the `.ics` content from event details.

### **4. Event Validation**
- **File**: [`src/types/event.ts`](src/types/event.ts)
- **What it does**:
  - Defines the **Zod schema** for event validation.
  - Ensures AI responses are correctly formatted.
- **Key Schema**:
  - `eventDetailsSchema`: Validates title, date, time, location, etc.

✅ **Action**: Read the code in these files to understand how each feature works.

---

---

## **🧪 Step 4: Run the Project Locally**
To **see Ananas in action**, follow these steps:

### **1. Install Dependencies**
```bash
pnpm install
```

### **2. Set Up Environment Variables**
Create a `.env.local` file in the project root:
```env
MISTRAL_API_KEY=your_mistral_api_key
VITE_DEFAULT_AI_MODULE=mistral-small-2409
```
> **Note**: You need a **Mistral API key** (get one from [Mistral AI](https://mistral.ai/)).

### **3. Start the Dev Server**
```bash
pnpm dev
```
The app will open at `http://localhost:8080`.

### **4. Try It Out**
1. Paste some event text (e.g., *"Meeting tomorrow at 3 PM in the conference room"*).
2. Click **"Extract Event"**.
3. Review the extracted details.
4. Click **"Add to Calendar"** to download the `.ics` file.
5. Open the file in your calendar app (Google Calendar, Apple Calendar, etc.).

✅ **Action**: Test the app with different types of event text (e.g., emails, chat messages, recurring events).

---

---

## **📝 Step 5: Study the Tests**
The project includes **comprehensive tests** to ensure reliability. Explore the `tests/` directory to understand how the code is validated:

| Test File | What It Tests |
|-----------|---------------|
| [`tests/lib/security.test.ts`](tests/lib/security.test.ts) | URL and RRULE sanitization, model name validation. |
| [`tests/lib/ics-generator.test.ts`](tests/lib/ics-generator.test.ts) | `.ics` file generation for timed/all-day events. |
| [`tests/lib/event-formatters.test.ts`](tests/lib/event-formatters.test.ts) | Date/time formatting for display. |
| [`tests/services/aiClient.test.ts`](tests/services/aiClient.test.ts) | AI client behavior (proxy calls, error handling). |
| [`tests/services/aiService.test.ts`](tests/services/aiService.test.ts) | AI extraction and summarization. |
| [`tests/services/calendarService.test.ts`](tests/services/calendarService.test.ts) | Calendar export behavior. |
| [`tests/hooks/useLocalCalendarHistory.test.tsx`](tests/hooks/useLocalCalendarHistory.test.tsx) | Local archive management. |
| [`tests/hooks/useAppSettings.test.tsx`](tests/hooks/useAppSettings.test.tsx) | AI model settings persistence. |
| [`tests/hooks/useEventProcessor.test.tsx`](tests/hooks/useEventProcessor.test.tsx) | Event processing flow. |
| [`tests/api/mistral.test.ts`](tests/api/mistral.test.ts) | Serverless proxy handler. |
| [`tests/types/event.test.ts`](tests/types/event.test.ts) | Event schema validation. |

### **Run the Tests**
```bash
pnpm test
```
or for watch mode:
```bash
pnpm test:watch
```

✅ **Action**: Run the tests and explore the test files to see how the code is validated.

---

---

## **🎨 Step 6: Understand the UI/UX**
Ananas has a **playful, tropical design** with:
- **Pineapple branding** 🍍 (emoji and warm colors).
- **Smooth animations** (Framer Motion).
- **Responsive layout** (works on mobile and desktop).

### **Key UI Components**
| Component | File | Purpose |
|-----------|------|---------|
| `EventDetailsDisplay` | [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx) | Shows extracted event details (title, date, time, location, etc.). |
| `ModuleNameDialog` | [`src/components/ModuleNameDialog.tsx`](src/components/ModuleNameDialog.tsx) | Dialog for changing the AI model. |
| `Index` (Main Page) | [`src/pages/Index.tsx`](src/pages/Index.tsx) | Main UI with input, results, and archive. |

### **UI Features**
- **Input Text Area**: Paste your event text here.
- **Extract Event Button**: Triggers AI extraction.
- **Event Preview**: Shows extracted details in a clean card.
- **Raw JSON View**: Toggle to see the raw JSON output.
- **Archive**: Browse, edit, or delete past events.
- **Export Button**: Download the `.ics` file.

✅ **Action**: Open [`src/pages/Index.tsx`](src/pages/Index.tsx) and trace how the UI is structured.

---

---
---
## **📜 Previous Text**
The following text was the original content of this file before the changes were made:

---

> # 📚 Instructions to Learn About Ananas Calendar
>
> This guide will help you understand **Ananas Calendar**—an AI-powered text-to-calendar event extractor. Follow these steps to explore the project, its architecture, and how it works.
>
> ---
>
> ---
>
> ## **🎯 Step 1: Start with the README**
> The [`README.md`](README.md) is the best place to begin. It covers:
> - **What Ananas does** (converts messy text into structured calendar events).
> - **Key features** (AI extraction, `.ics` export, local archive, etc.).
> - **Tech stack** (React, TypeScript, Mistral AI, Tailwind CSS, etc.).
> - **Project structure** (where to find code for different functionalities).
> - **How to run the project locally** (setup, environment variables, deployment).
>
> ✅ **Action**: Read the [README.md](README.md) first.
>
> ---
>
> ---
>
> ## **🏗️ Step 2: Understand the Architecture**
> Ananas follows a **modular architecture**. Here’s how the pieces fit together:
>
> ### **1. Frontend (React + TypeScript)**
> - **Main App**: [`src/App.tsx`](src/App.tsx) (React Router setup).
> - **Main Page**: [`src/pages/Index.tsx`](src/pages/Index.tsx) (UI, state management, event processing).
> - **Components**:
>   - [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx) (renders extracted event details).
>   - [`src/components/ModuleNameDialog.tsx`](src/components/ModuleNameDialog.tsx) (dialog for changing AI models).
> - **UI Library**: Uses **shadcn/ui** (pre-built, accessible components like `Button`, `Card`, `Dialog`).
>
> ### **2. AI Integration**
> - **Proxy**: [`api/mistral.ts`](api/mistral.ts) (server-side proxy for Mistral API).
> - **Client**: [`src/services/aiClient.ts`](src/services/aiClient.ts) (calls the proxy).
> - **Service**: [`src/services/aiService.ts`](src/services/aiService.ts) (handles extraction & summarization).
> - **Prompts**:
>   - [`src/ai-prompts/eventExtractionPrompt.ts`](src/ai-prompts/eventExtractionPrompt.ts) (prompt for extracting event details).
>   - [`src/ai-prompts/summarizationPrompt.ts`](src/ai-prompts/summarizationPrompt.ts) (prompt for summarizing long descriptions).
>
> ### **3. Data Flow**
> 1. User pastes text → [`src/pages/Index.tsx`](src/pages/Index.tsx) (input handling).
> 2. Text sent to `/api/mistral` → [`api/mistral.ts`](api/mistral.ts) (proxy).
> 3. Proxy forwards to Mistral API → Returns structured JSON.
> 4. JSON validated → [`src/types/event.ts`](src/types/event.ts) (Zod schema).
> 5. Event displayed → [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx).
> 6. Event saved to local archive → [`src/hooks/useLocalCalendarHistory.ts`](src/hooks/useLocalCalendarHistory.ts).
> 7. User exports `.ics` file → [`src/services/calendarService.ts`](src/services/calendarService.ts).
>
> ✅ **Action**: Open these files and trace the flow from input to export.
>
> ---
>
> ---
>
> ## **🔍 Step 3: Explore Key Features in Code**
> ### **1. AI-Powered Extraction**
> - **File**: [`src/services/aiService.ts`](src/services/aiService.ts)
> - **What it does**:
>   - Calls Mistral AI via the proxy.
>   - Validates the AI response using Zod.
>   - Summarizes long descriptions automatically.
> - **Key Functions**:
>   - `processTextForEventExtraction()`: Extracts event details from text.
>   - `summarizeEventDescription()`: Shortens long descriptions.
>
> ### **2. Local Archive**
> - **File**: [`src/hooks/useLocalCalendarHistory.ts`](src/hooks/useLocalCalendarHistory.ts)
> - **What it does**:
>   - Saves extracted events to `localStorage`.
>   - Tracks export counts and timestamps.
> - **Key Functions**:
>   - `saveCalendar()`: Saves a new event to the archive.
>   - `removeCalendar()`: Deletes an event from the archive.
>   - `markCalendarExported()`: Updates export count.
>
> ### **3. Calendar Export (`.ics` Files)**
> - **File**: [`src/lib/ics-generator.ts`](src/lib/ics-generator.ts)
> - **What it does**:
>   - Generates `.ics` files (iCalendar format).
>   - Supports timed events, all-day events, and recurrence rules (`RRULE`).
> - **Key Function**:
>   - `generateIcs()`: Creates the `.ics` content from event details.
>
> ### **4. Event Validation**
> - **File**: [`src/types/event.ts`](src/types/event.ts)
> - **What it does**:
>   - Defines the **Zod schema** for event validation.
>   - Ensures AI responses are correctly formatted.
> - **Key Schema**:
>   - `eventDetailsSchema`: Validates title, date, time, location, etc.
>
> ✅ **Action**: Read the code in these files to understand how each feature works.
>
> ---
>
> ---
>
> ## **🧪 Step 4: Run the Project Locally**
> To **see Ananas in action**, follow these steps:
>
> ### **1. Install Dependencies**
> ```bash
> pnpm install
> ```
>
> ### **2. Set Up Environment Variables**
> Create a `.env.local` file in the project root:
> ```env
> MISTRAL_API_KEY=your_mistral_api_key
> VITE_DEFAULT_AI_MODULE=mistral-small-2409
> ```
> > **Note**: You need a **Mistral API key** (get one from [Mistral AI](https://mistral.ai/)).
>
> ### **3. Start the Dev Server**
> ```bash
> pnpm dev
> ```
> The app will open at `http://localhost:8080`.
>
> ### **4. Try It Out**
> 1. Paste some event text (e.g., *"Meeting tomorrow at 3 PM in the conference room"*).
> 2. Click **"Extract Event"**.
> 3. Review the extracted details.
> 4. Click **"Add to Calendar"** to download the `.ics` file.
> 5. Open the file in your calendar app (Google Calendar, Apple Calendar, etc.).
>
> ✅ **Action**: Test the app with different types of event text (e.g., emails, chat messages, recurring events).
>
> ---
>
> ---
>
> ## **📝 Step 5: Study the Tests**
> The project includes **comprehensive tests** to ensure reliability. Explore the `tests/` directory to understand how the code is validated:
>
> | Test File | What It Tests |
> |-----------|---------------|
> | [`tests/lib/security.test.ts`](tests/lib/security.test.ts) | URL and RRULE sanitization, model name validation. |
> | [`tests/lib/ics-generator.test.ts`](tests/lib/ics-generator.test.ts) | `.ics` file generation for timed/all-day events. |
> | [`tests/lib/event-formatters.test.ts`](tests/lib/event-formatters.test.ts) | Date/time formatting for display. |
> | [`tests/services/aiClient.test.ts`](tests/services/aiClient.test.ts) | AI client behavior (proxy calls, error handling). |
> | [`tests/services/aiService.test.ts`](tests/services/aiService.test.ts) | AI extraction and summarization. |
> | [`tests/services/calendarService.test.ts`](tests/services/calendarService.test.ts) | Calendar export behavior. |
> | [`tests/hooks/useLocalCalendarHistory.test.tsx`](tests/hooks/useLocalCalendarHistory.test.tsx) | Local archive management. |
> | [`tests/hooks/useAppSettings.test.tsx`](tests/hooks/useAppSettings.test.tsx) | AI model settings persistence. |
> | [`tests/hooks/useEventProcessor.test.tsx`](tests/hooks/useEventProcessor.test.tsx) | Event processing flow. |
> | [`tests/api/mistral.test.ts`](tests/api/mistral.ts) | Serverless proxy handler. |
> | [`tests/types/event.test.ts`](tests/types/event.ts) | Event schema validation. |
>
> ### **Run the Tests**
> ```bash
> pnpm test
> ```
> or for watch mode:
> ```bash
> pnpm test:watch
> ```
>
> ✅ **Action**: Run the tests and explore the test files to see how the code is validated.
>
> ---
>
> ---
>
> ## **🎨 Step 6: Understand the UI/UX**
> Ananas has a **playful, tropical design** with:
> - **Pineapple branding** 🍍 (emoji and warm colors).
> - **Smooth animations** (Framer Motion).
> - **Responsive layout** (works on mobile and desktop).
>
> ### **Key UI Components**
> | Component | File | Purpose |
> |-----------|------|---------|
> | `EventDetailsDisplay` | [`src/components/EventDetailsDisplay.tsx`](src/components/EventDetailsDisplay.tsx) | Shows extracted event details (title, date, time, location, etc.). |
> | `ModuleNameDialog` | [`src/components/ModuleNameDialog.tsx`](src/components/ModuleNameDialog.tsx) | Dialog for changing the AI model. |
> | `Index` (Main Page) | [`src/pages/Index.tsx`](src/pages/Index.tsx) | Main UI with input, results, and archive. |
>
> ### **UI Features**
> - **Input Text Area**: Paste your event text here.
> - **Extract Event Button**: Triggers AI extraction.
> - **Event Preview**: Shows extracted details in a clean card.
> - **Raw JSON View**: Toggle to see the raw JSON output.
> - **Archive**: Browse, edit, or delete past events.
> - **Export Button**: Download the `.ics` file.
>
> ✅ **Action**: Open [`src/pages/Index.tsx`](src/pages/Index.tsx) and trace how the UI is structured.
>
> ---
>
> ---
>
> ## **🚀 Next Steps**
> - Try it out: Paste some event text and see the magic happen!
> - Explore the **archive** to revisit past events.
> - Switch **AI models** to compare extraction quality.
> - Check the **tests** (`tests/` directory) to understand validation logic.