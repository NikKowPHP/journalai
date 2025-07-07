import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = React.useState(1);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Welcome to LinguaScribe!'}
            {step === 2 && 'Native Language'}
            {step === 3 && 'Target Language'} 
            {step === 4 && 'Writing Purpose'}
            {step === 5 && 'Skill Level'}
            {step === 6 && 'Ready to Start!'}
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
            <Select>
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

        {step === 3 && (
          <div className="space-y-4">
            <p>What language do you want to master?</p>
            <Select>
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
            <Select>
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
            <p>You're all set! Click "Get Started" to begin your language journey.</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {step < 6 ? (
            <Button onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button onClick={onComplete}>
              Get Started
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}