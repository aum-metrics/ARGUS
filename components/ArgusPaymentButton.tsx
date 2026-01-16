/**
 * Author: Sambath Kumar Natarajan
 */
"use client"

import { Button } from '@/components/ui/button';
import { ARGUS_CONSTITUTION } from '@/argus/constitution';
import { CreditCard } from 'lucide-react';

interface ArgusPaymentProps {
    onSuccess: (paymentId: string) => void;
    disabled?: boolean;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

/**
 * Production Razorpay Integration
 * Loads Razorpay SDK and initiates payment
 */
export function ArgusPaymentButton({ onSuccess, disabled }: ArgusPaymentProps) {
    const handlePayment = async () => {
        try {
            // Load Razorpay SDK if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }

            // Create Razorpay order via backend
            const orderResponse = await fetch('/api/create-razorpay-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: ARGUS_CONSTITUTION.pricing.amount,
                    currency: 'INR'
                })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const { order_id, amount } = await orderResponse.json();

            // Initialize Razorpay checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                amount: amount,
                currency: 'INR',
                name: 'ARGUS Governance',
                description: 'Research Audit Credit',
                order_id: order_id,
                handler: function (response: any) {
                    // Payment successful
                    onSuccess(response.razorpay_payment_id);
                },
                prefill: {
                    name: '',
                    email: '',
                },
                theme: {
                    color: '#18181b' // zinc-900
                },
                modal: {
                    ondismiss: function () {
                        console.log('[Payment] User closed payment modal');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.error('[Payment] Error:', error);
            alert('Payment initialization failed. Please try again.');
        }
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
