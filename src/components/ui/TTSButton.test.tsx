
/** @jest-environment jsdom */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TTSButton } from "./TTSButton";

// Mock SpeechSynthesisUtterance which is not available in JSDOM
class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  voice = null;
  constructor(text: string) {
    this.text = text;
  }
}
global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;

// Mock window.speechSynthesis
const mockSpeak = jest.fn();
const mockCancel = jest.fn();
let mockVoices: any[] = [];
Object.defineProperty(window, "speechSynthesis", {
  value: {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: () => mockVoices,
    onvoiceschanged: null,
  },
  writable: true,
});

describe("TTSButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVoices = [];
    if (window.speechSynthesis) {
      (window.speechSynthesis as any).onvoiceschanged = null;
    }
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

  it("renders a disabled button if the required voice is not available", async () => {
    mockVoices = [{ lang: "fr-FR" }];
    render(<TTSButton text="Hello" lang="en-US" />);
    const button = await screen.findByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      "title",
      "Voice for this language (en-US) is not available on your system.",
    );
  });

  it("renders an enabled button if the voice is available", async () => {
    mockVoices = [{ lang: "en-US" }];
    render(<TTSButton text="Hello" lang="en-US" />);
    const button = await screen.findByRole("button");
    expect(button).not.toBeDisabled();
  });

  it("calls speechSynthesis.speak with correct text and lang on click", async () => {
    mockVoices = [{ lang: "es-ES" }];
    render(<TTSButton text="Hola" lang="es-ES" />);

    const button = await screen.findByRole("button");
    fireEvent.click(button);

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance).toBeInstanceOf(MockSpeechSynthesisUtterance);
    expect(utterance.text).toBe("Hola");
    expect(utterance.lang).toBe("es-ES");
  });
});