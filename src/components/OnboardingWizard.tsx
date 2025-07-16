import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOnboardUser } from "@/lib/hooks/data";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";
import type { OnboardingData } from "@/lib/types";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onError?: (error: string) => void;
}

export function OnboardingWizard({
  isOpen,
  onClose,
  onComplete,
  onError,
}: OnboardingWizardProps) {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<OnboardingData>({
    nativeLanguage: "",
    targetLanguage: "",
    writingStyle: "Casual",
    writingPurpose: "Personal",
    selfAssessedLevel: "Beginner",
  });

  const { mutate: submitOnboarding, isPending } = useOnboardUser();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    submitOnboarding(formData, {
      onSuccess: onComplete,
      onError: (error) => onError?.(error.message),
    });
  };

  const isNextDisabled = () => {
    if (step === 2 && !formData.nativeLanguage) return true;
    if (step === 3 && !formData.targetLanguage) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Welcome to LinguaScribe!"}
            {step === 2 && "Setup Your Profile"}
            {step === 3 && "Setup Your Profile"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p>Let's get you started with just a few quick questions.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p>What is your native language?</p>
            <Select
              onValueChange={(value) => handleChange("nativeLanguage", value)}
              value={formData.nativeLanguage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p>What language do you want to master?</p>
            <Select
              onValueChange={(value) => handleChange("targetLanguage", value)}
              value={formData.targetLanguage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-between mt-6 gap-4">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={nextStep}
              disabled={isNextDisabled()}
              className="ml-auto"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isPending || isNextDisabled()}
              className="ml-auto"
            >
              {isPending ? "Saving..." : "Finish Setup"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
