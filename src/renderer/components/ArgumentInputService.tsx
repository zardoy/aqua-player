import React, { useState, useCallback } from 'react';
import ArgumentInputDialog from './ArgumentInputDialog';
import { BaseArg } from '../commands';

interface ArgumentInputRequest {
  args: BaseArg[];
  commandName: string;
  onConfirm: (args: any[]) => void;
  onCancel?: () => void;
}

let showArgumentInput: ((request: ArgumentInputRequest) => void) | null = null;

export const ArgumentInputService: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<ArgumentInputRequest | null>(null);

  const handleShow = useCallback((request: ArgumentInputRequest) => {
    setCurrentRequest(request);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCurrentRequest(null);
    if (currentRequest?.onCancel) {
      currentRequest.onCancel();
    }
  }, [currentRequest]);

  const handleConfirm = useCallback((args: any[]) => {
    if (currentRequest) {
      currentRequest.onConfirm(args);
    }
    setIsOpen(false);
    setCurrentRequest(null);
  }, [currentRequest]);

  // Register the show function globally
  React.useEffect(() => {
    showArgumentInput = handleShow;
    return () => {
      showArgumentInput = null;
    };
  }, [handleShow]);

  if (!currentRequest) return null;

  return (
    <ArgumentInputDialog
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      args={currentRequest.args}
      commandName={currentRequest.commandName}
    />
  );
};

// Global function to show argument input dialog
export const showArgumentInputDialog = (request: ArgumentInputRequest) => {
  if (showArgumentInput) {
    showArgumentInput(request);
  } else {
    console.error('ArgumentInputService not initialized');
  }
};
