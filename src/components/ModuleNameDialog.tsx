"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

interface ModuleNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentModuleName: string;
  onSave: (newModuleName: string) => void;
}

const ModuleNameDialog: React.FC<ModuleNameDialogProps> = ({
  isOpen,
  onClose,
  currentModuleName,
  onSave,
}) => {
  const [inputModuleName, setInputModuleName] = useState(currentModuleName);

  useEffect(() => {
    setInputModuleName(currentModuleName);
  }, [currentModuleName]);

  const handleSave = () => {
    if (!inputModuleName.trim()) {
      showError("Module name cannot be empty.");
      return;
    }
    onSave(inputModuleName);
    showSuccess("AI Module Name updated!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change AI Module Name</DialogTitle>
          <DialogDescription>
            Enter the desired AI module name for OpenRouter. This will be saved
            locally.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="moduleName" className="text-right">
              Module Name
            </Label>
            <Input
              id="moduleName"
              value={inputModuleName}
              onChange={(e) => setInputModuleName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., openai/gpt-4o"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleNameDialog;