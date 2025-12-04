"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PlatformWrapperProps {
  children: React.ReactNode;
}

const PlatformWrapper: React.FC<PlatformWrapperProps> = ({ children }) => {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      if (isMobile) {
        document.body.classList.add("platform-mobile");
        document.body.classList.remove("platform-web");
      } else {
        document.body.classList.add("platform-web");
        document.body.classList.remove("platform-mobile");
      }
    }
  }, [isMobile]);

  return <>{children}</>;
};

export default PlatformWrapper;