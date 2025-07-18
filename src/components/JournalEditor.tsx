
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { useSubmitJournal, useUserProfile } from "@/lib/hooks/data";
import {
  useStuckWriterEffect,
  useAutocompleteEffect,
} from "@/lib/hooks/editor";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Lightbulb, Languages, X } from "lucide-react";
import { Extension } from "@tiptap/core";
import { useRouter } from "next/navigation";
import { useLanguageStore } from "@/lib/stores/language.store";
import { TranslatorDialog } from "./TranslatorDialog";
import { useSelection } from "@/lib/hooks/ui/useSelection";
import { TranslationTooltip } from "./ui/TranslationTooltip";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import { useFeatureFlag } from "@/lib/hooks/useFeatureFlag";
import { GuidedPopover } from "./ui/GuidedPopover";

// --- WritingAids Sub-component (Now simplified) ---
interface WritingAidsProps {
  topicTitle: string;
  editor: any; // TipTap Editor instance
  containerRef: React.Ref<HTMLDivElement>;
}

const WritingAids: React.FC<WritingAidsProps> = ({
  topicTitle,
  editor,
  containerRef,
}) => {
  const [isTranslateNew, markTranslateAsSeen] = useFeatureFlag(
    "highlight_text_translation",
  );

  const {
    data: aids,
    mutate: fetchAids,
    isPending,
  } = useMutation({
    mutationFn: (topic: string) =>
      fetch("/api/journal/helpers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetLanguage: useLanguageStore.getState().activeTargetLanguage,
        }),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (
      topicTitle &&
      topicTitle !== "Free Write" &&
      useLanguageStore.getState().activeTargetLanguage
    ) {
      fetchAids(topicTitle);
    }
  }, [topicTitle, fetchAids]);

  if (topicTitle === "Free Write" || (!isPending && !aids)) {
    return null;
  }

  const insertSentenceStarter = () => {
    if (editor && aids?.sentenceStarter) {
      editor.chain().focus().setContent(aids.sentenceStarter).run();
    }
  };

  const insertVocab = (vocab: string) => {
    if (editor) {
      editor.chain().focus().insertContent(` ${vocab} `).run();
    }
  };

  return (
    <div>
      <Card className="mb-4 bg-secondary/30">
        <CardHeader>
          <GuidedPopover
            isOpen={isTranslateNew}
            onDismiss={markTranslateAsSeen}
            title="Translate Anything"
            description="You can select any text on this platform, like this topic title, to get an instant translation."
          >
            <CardTitle
              ref={containerRef}
              className="text-lg underline decoration-dashed decoration-[color:var(--border)] underline-offset-2 cursor-help"
            >
              Topic: {topicTitle}
            </CardTitle>
          </GuidedPopover>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && (
            <>
              <Skeleton className="h-5 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-28" />
              </div>
            </>
          )}
          {aids && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                  Sentence Starter
                </h4>
                <p className="italic text-foreground">
                  "{aids.sentenceStarter}"
                  <Button
                    size="sm"
                    variant="link"
                    onClick={insertSentenceStarter}
                    className="ml-2"
                  >
                    Use this
                  </Button>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Vocabulary to Try
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aids.suggestedVocab.map((vocab: string) => (
                    <Button
                      key={vocab}
                      size="sm"
                      variant="outline"
                      onClick={() => insertVocab(vocab)}
                    >
                      {vocab}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Stuck Writer Helper UI (Now simplified) ---
const StuckWriterHelper = ({
  suggestions,
  onDismiss,
  containerRef,
}: {
  suggestions: string[];
  onDismiss: () => void;
  containerRef: React.Ref<HTMLUListElement>;
}) => {
  const [isTranslateNew, markTranslateAsSeen] = useFeatureFlag(
    "highlight_text_translation",
  );

  return (
    <Card className="mt-4 p-4 border-primary/50 bg-secondary/30 relative animate-in fade-in slide-in-from-top-2 duration-500">
      <CardHeader className="p-0 pb-2 flex-row justify-between items-center">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Need a nudge?
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <GuidedPopover
          isOpen={isTranslateNew}
          onDismiss={markTranslateAsSeen}
          title="Translate Suggestions"
          description="Don't understand a suggestion? Just select the text to translate it."
        >
          <ul
            ref={containerRef}
            className="space-y-1 text-sm text-muted-foreground list-disc pl-5 underline decoration-dashed decoration-[color:var(--border)] underline-offset-2 cursor-help"
          >
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </GuidedPopover>
      </CardContent>
    </Card>
  );
};

// --- TipTap Extension for Tab Key ---
const TabHandler = Extension.create({
  name: "tabHandler",
  addOptions() {
    return {
      onTab: () => false,
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => this.options.onTab(),
    };
  },
});

// --- Modified JournalEditor Component ---
interface JournalEditorProps {
  topicTitle?: string;
  isOnboarding?: boolean;
  onOnboardingSubmit?: (journalId: string) => void;
}

export function JournalEditor({
  topicTitle = "Free Write",
  isOnboarding = false,
  onOnboardingSubmit,
}: JournalEditorProps) {
  const [statusMessage, setStatusMessage] = useState("");
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const router = useRouter();

  // --- START: Lifted Tooltip State ---
  const writingAidsRef = useRef<HTMLDivElement>(null);
  const stuckHelperRef = useRef<HTMLUListElement>(null);
  const { data: userProfile } = useUserProfile();
  const { activeTargetLanguage } = useLanguageStore();

  const writingAidsSelection = useSelection(writingAidsRef);
  const stuckHelperSelection = useSelection(stuckHelperRef);

  const getLanguageName = (value: string | null | undefined): string => {
    if (!value) return "";
    const lang = SUPPORTED_LANGUAGES.find((l) => l.value === value);
    return lang ? lang.name : value;
  };
  // --- END: Lifted Tooltip State ---

  const onTabRef = useRef<() => boolean>(() => false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          topicTitle && topicTitle !== "Free Write"
            ? `Start writing about "${topicTitle}"...`
            : "Start with a free write entry...",
      }),
      TabHandler.configure({
        onTab: () => onTabRef.current(),
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-lg mx-auto focus:outline-none p-4 min-h-[200px] bg-background text-foreground",
      },
    },
  });

  const { suggestion, setSuggestion } = useAutocompleteEffect(editor);
  const { stuckSuggestions, showStuckUI, setShowStuckUI } =
    useStuckWriterEffect(editor, topicTitle);

  const submitJournalMutation = useSubmitJournal();

  useEffect(() => {
    onTabRef.current = () => {
      if (suggestion) {
        editor?.chain().focus().insertContent(suggestion).run();
        setSuggestion(null);
        return true;
      }
      return false;
    };
  }, [suggestion, editor, setSuggestion]);

  const handleSubmit = async () => {
    if (!editor) return;
    const content = editor.getText();
    if (content.trim().length < 10) {
      setStatusMessage("Please write a bit more before submitting.");
      return;
    }
    setStatusMessage("");

    const payload = { content, topicTitle };

    submitJournalMutation.mutate(payload, {
      onSuccess: (journal: { id: string }) => {
        editor.commands.clearContent();

        if (isOnboarding && onOnboardingSubmit) {
          onOnboardingSubmit(journal.id);
        } else {
          router.push(`/journal/${journal.id}`);
        }
      },
    });
  };

  const handleApplyTranslation = (text: string) => {
    editor
      ?.chain()
      .focus()
      .insertContent(" " + text)
      .run();
  };

  if (!editor) {
    return null;
  }

  const shouldEnableTranslation =
    userProfile?.nativeLanguage && activeTargetLanguage;

  return (
    <div>
      {/* --- START: Render Tooltip at top level --- */}
      {shouldEnableTranslation &&
        writingAidsSelection.isVisible &&
        writingAidsSelection.selectedText && (
          <TranslationTooltip
            selectedText={writingAidsSelection.selectedText}
            sourceLang={getLanguageName(activeTargetLanguage)}
            targetLang={getLanguageName(userProfile.nativeLanguage)}
            position={writingAidsSelection.position}
            onClose={writingAidsSelection.close}
          />
        )}
      {shouldEnableTranslation &&
        stuckHelperSelection.isVisible &&
        stuckHelperSelection.selectedText && (
          <TranslationTooltip
            selectedText={stuckHelperSelection.selectedText}
            sourceLang={getLanguageName(activeTargetLanguage)}
            targetLang={getLanguageName(userProfile.nativeLanguage)}
            position={stuckHelperSelection.position}
            onClose={stuckHelperSelection.close}
          />
        )}
      {/* --- END: Render Tooltip at top level --- */}

      <WritingAids
        topicTitle={topicTitle}
        editor={editor}
        containerRef={writingAidsRef}
      />
      {showStuckUI && stuckSuggestions && (
        <StuckWriterHelper
          suggestions={stuckSuggestions}
          onDismiss={() => setShowStuckUI(false)}
          containerRef={stuckHelperRef}
        />
      )}
      <div className="border rounded-lg overflow-hidden mt-4">
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-1 p-1 bg-popover text-popover-foreground border border-border rounded-md shadow-md ">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${
                  editor.isActive("bold") ? "bg-accent" : ""
                } hover:bg-accent`}
              >
                Bold
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${
                  editor.isActive("italic") ? "bg-accent" : ""
                } hover:bg-accent`}
              >
                Italic
              </button>
            </div>
          </BubbleMenu>
        )}
        {editor && suggestion && (
          <FloatingMenu
            editor={editor}
            shouldShow={() => suggestion !== null}
            tippyOptions={{ duration: 100, placement: "bottom-start" }}
          >
            <div className="bg-background border rounded-lg p-2 shadow-lg text-sm">
              <span className="text-muted-foreground">{suggestion}</span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => {
                  editor.chain().focus().insertContent(suggestion).run();
                  setSuggestion(null);
                }}
              >
                Accept (Tab)
              </Button>
            </div>
          </FloatingMenu>
        )}
        <EditorContent editor={editor} />
        <div className="p-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-h-[68px]">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={submitJournalMutation.isPending}
            >
              {submitJournalMutation.isPending
                ? "Submitting..."
                : "Submit for Analysis"}
            </Button>
            <Button variant="outline" onClick={() => setIsTranslatorOpen(true)}>
              <Languages className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Translate</span>
            </Button>
          </div>
          {statusMessage && (
            <p className="mt-2 sm:mt-0 text-sm text-muted-foreground">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
      <TranslatorDialog
        open={isTranslatorOpen}
        onOpenChange={setIsTranslatorOpen}
        onApplyTranslation={handleApplyTranslation}
      />
    </div>
  );
}