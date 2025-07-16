import { useState, useEffect, useCallback, RefObject } from "react";

interface SelectionState {
  isVisible: boolean;
  selectedText: string;
  position: { x: number; y: number };
  close: () => void;
}

export const useSelection = <T extends HTMLElement>(
  containerRef: RefObject<T | null>,
): SelectionState => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const close = useCallback(() => {
    setIsVisible(false);
    setSelectedText("");
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleSelect = (event: MouseEvent | TouchEvent) => {
      // Prevent closing when clicking inside the tooltip itself.
      const tooltip = document.querySelector('[role="tooltip"]');
      if (tooltip && event.target && tooltip.contains(event.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString().trim();

      // Check if the selection is valid and within our target container.
      if (
        text &&
        selection?.rangeCount &&
        selection.anchorNode &&
        container.contains(selection.anchorNode)
      ) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectedText(text);
        // Position tooltip below the selection
        setPosition({
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.bottom + window.scrollY + 8, // 8px offset
        });
        setIsVisible(true);
      } else if (isVisible) {
        // If there's no valid selection but the tooltip is visible, close it.
        close();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      const selection = window.getSelection()?.toString().trim();
      if (selection) {
        event.preventDefault();
      }
    };

    container.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mouseup", handleSelect);
    document.addEventListener("touchend", handleSelect);

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mouseup", handleSelect);
      document.removeEventListener("touchend", handleSelect);
    };
  }, [containerRef, close, isVisible]);

  return { isVisible, selectedText, position, close };
};