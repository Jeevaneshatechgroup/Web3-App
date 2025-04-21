import { useState } from 'react';

interface UseCopyToClipboard {
  isCopied: boolean;
  copyToClipboard: (text: string) => void;
}

/**
 * Custom hook for copying text to clipboard with a temporary "copied" state
 * @param timeout Duration in ms that the isCopied state should be true after copying
 * @returns Object containing isCopied state and copyToClipboard function
 */
export function useCopyToClipboard(timeout = 2000): UseCopyToClipboard {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }

    try {
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setIsCopied(false);
    }
  };

  return { isCopied, copyToClipboard };
}