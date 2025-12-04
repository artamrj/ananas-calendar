import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import PlatformWrapper from "./components/PlatformWrapper.tsx"; // Import the new wrapper

createRoot(document.getElementById("root")!).render(
  <PlatformWrapper>
    <App />
  </PlatformWrapper>
);