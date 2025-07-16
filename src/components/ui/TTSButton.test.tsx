
/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TTSButton } from "./TTSButton";

// Mock window.speechSynthesis
const mockSpeak = jest.fn();
const mockGetVoices = jest.fn(() => []);
Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: mockSpeak,
    getVoices: mockGetVoices,
    onvoiceschanged: null,
  },
  writable: true,
});

describe("TTSButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (window.speechSynthesis as any).getVoices = jest.fn(() => []);
    (window.speechSynthesis as any).onvoiceschanged = null;
  });

  it("renders nothing if speech synthesis is not supported", () => {
    const originalSpeechSynthesis = window.speechSynthesis;
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      writable: true,
    });

    const { container } = render(<TTSButton text="Hello" lang="en-US" />);
    expect(container.firstChild).toBeNull();

    Object.defineProperty(window, "speechSynthesis", {
      value: originalSpeechSynthesis,
      writable: true,
    });
  });

  it("renders a disabled button if the required voice is not available", () => {
    (window.speechSynthesis as any).getVoices = jest.fn(() => [
      { lang: "fr-FR" },
    ]);
    render(<TTSButton text="Hello" lang="en-US" />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      "title",
      "Voice for this language (en-US) is not available on your system.",
    );
  });

  it("renders an enabled button if the voice is available", () => {
    (window.speechSynthesis as any).getVoices = jest.fn(() => [
      { lang: "en-US" },
    ]);
    render(<TTSButton text="Hello" lang="en-US" />);
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("calls speechSynthesis.speak with correct text and lang on click", () => {
    (window.speechSynthesis as any).getVoices = jest.fn(() => [
      { lang: "es-ES" },
    ]);
    render(<TTSButton text="Hola" lang="es-ES" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance).toBeInstanceOf(SpeechSynthesisUtterance);
    expect(utterance.text).toBe("Hola");
    expect(utterance.lang).toBe("es-ES");
  });
});