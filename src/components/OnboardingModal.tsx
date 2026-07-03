import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Users, FileText, CheckCircle } from "lucide-react";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Welcome to QuoteFlow!">
      <div className="p-2 sm:p-6 text-center">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">1. Add Customers</h3>
            <p className="text-gray-500 mb-8 text-base">
              Start by adding your clients in the Customers tab, or quick-add them while creating a quote.
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 mb-6">
              <FileText className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">2. Create Quotes</h3>
            <p className="text-gray-500 mb-8 text-base">
              Generate professional quotes with line items, automatic tax calculations, and custom terms.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-6">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">3. Win Business</h3>
            <p className="text-gray-500 mb-8 text-base">
              Export to PDF instantly, send to clients, and track your accepted quotes from the dashboard.
            </p>
          </div>
        )}
        
        <div className="flex gap-3 justify-center">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} className="min-w-24">
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="min-w-32 shadow-sm">
            {step === 3 ? "Get Started" : "Next"}
          </Button>
        </div>
        <div className="mt-8 flex justify-center gap-2">
          <div className={`h-2 w-2 rounded-full transition-colors ${step === 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-2 rounded-full transition-colors ${step === 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`h-2 w-2 rounded-full transition-colors ${step === 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        </div>
      </div>
    </Modal>
  );
}
