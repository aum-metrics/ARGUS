/**
 * Author: Sambath Kumar Natarajan
 */
"use client";

import { useState, useEffect } from 'react';
import { X, ArrowRight, FileText, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

interface OnboardingProps {
    onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Check if user has seen onboarding
        const hasSeenOnboarding = localStorage.getItem('argus_onboarding_complete');
        if (!hasSeenOnboarding) {
            setOpen(true);
        }
    }, []);

    const steps = [
        {
            icon: FileText,
            title: "Welcome to ARGUS",
            description: "Your AI-powered research governance assistant. We help you validate papers before submission.",
            color: "text-blue-600 bg-blue-50"
        },
        {
            icon: Zap,
            title: "How It Works",
            description: `1. Upload your paper or paste text
2. We extract key claims
3. Our adversarial AI audits each claim
4. Get a detailed readiness report`,
            color: "text-purple-600 bg-purple-50"
        },
        {
            icon: Shield,
            title: "Your Credits",
            description: "Each audit uses 1 credit. Check your credit counter in the header. Ready to start?",
            color: "text-green-600 bg-green-50"
        }
    ];

    const currentStep = steps[step];
    const Icon = currentStep.icon;

    const handleComplete = () => {
        localStorage.setItem('argus_onboarding_complete', 'true');
        setOpen(false);
        onComplete();
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
                <button
                    onClick={handleSkip}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="py-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${currentStep.color}`}>
                            <Icon className="h-8 w-8" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-3">
                            {currentStep.title}
                        </h2>
                        <p className="text-zinc-600 whitespace-pre-line leading-relaxed">
                            {currentStep.description}
                        </p>
                    </div>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all ${i === step
                                    ? 'w-8 bg-zinc-900'
                                    : 'w-2 bg-zinc-300'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleSkip}
                            className="flex-1"
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="flex-1 bg-zinc-900 hover:bg-zinc-800"
                        >
                            {step < steps.length - 1 ? (
                                <>
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            ) : (
                                "Get Started"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
