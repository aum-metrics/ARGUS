"use client"

import { Button } from '@/components/ui/button';
import { ARGUS_CONSTITUTION } from '@/argus/constitution';
import { CreditCard } from 'lucide-react';

interface ArgusPaymentProps {
    onSuccess: (paymentId: string) => void;
    disabled?: boolean;
}

export function ArgusPaymentButton({ onSuccess, disabled }: ArgusPaymentProps) {
    const handlePayment = async () => {
        // Simulate payment delay
        const audio = new Audio("https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3");
        audio.volume = 0.2;
        audio.play().catch(() => { });

        setTimeout(() => {
            const mockPaymentId = `pay_${Math.random().toString(36).substring(7)}`;
            onSuccess(mockPaymentId);
        }, 800);
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={disabled}
            className="bg-zinc-900 hover:bg-zinc-800 text-white w-full h-10"
        >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ₹{ARGUS_CONSTITUTION.pricing.amount / 100} to Validate
        </Button>
    );
}
