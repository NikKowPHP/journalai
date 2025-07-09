import React from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * A multi-step onboarding wizard that guides new users through initial setup.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Controls the visibility of the wizard.
 * @param {function} props.onClose - Callback invoked when the wizard is closed.
 * @param {function} props.onComplete - Callback invoked when onboarding is finished.
 * @returns {React.ReactElement} The onboarding wizard component.
 */
interface OnboardingData {
  nativeLanguage: string;
  targetLanguage: string;
  writingStyle: string;
  writingPurpose: string;
  selfAssessedLevel: string;
}

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
    writingStyle: "",
    writingPurpose: "",
    selfAssessedLevel: ""
  });

  const { mutate: submitOnboarding, isPending } = useMutation({
    mutationFn: (data: OnboardingData) =>
      axios.post("/api/user/onboard", data),
    onSuccess: onComplete,
    onError: (error) => onError?.(error.message)
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    submitOnboarding(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Welcome to LinguaScribe!"}
            {step === 2 && "Native Language"}
            {step === 3 && "Target Language"}
            {step === 4 && "Writing Purpose"}
            {step === 5 && "Skill Level"}
            {step === 6 && "Ready to Start!"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <p>We'll help you get started with just a few quick questions.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p>What is your native language?</p>
            <Select
              onValueChange={(value) => handleChange("nativeLanguage", value)}
              value={formData.nativeLanguage}
            >
              <SelectTrigger className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="english"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  English
                </SelectItem>
                <SelectItem
                  value="spanish"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  Spanish
                </SelectItem>
                <SelectItem
                  value="french"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  French
                </SelectItem>
                <SelectItem
                  value="german"
                  className="focus:bg-accent focus:text-accent-foreground"
                >
                  German
                </SelectItem>
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
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p>What is your main writing purpose?</p>
            <Select
              onValueChange={(value) => handleChange("writingPurpose", value)}
              value={formData.writingPurpose}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <p>What is your self-assessed skill level?</p>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <p>
              You're all set! Click "Get Started" to begin your language
              journey.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6 gap-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back
            </Button>
          )}
          {step < 6 ? (
            <Button
              onClick={nextStep}
              className="hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={onComplete}
              className="hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
