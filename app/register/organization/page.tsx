"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Building2, User, Mail, CreditCard, Loader2 } from "lucide-react";
import Script from "next/script";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function OrganizationRegisterPage() {
    const [tier, setTier] = useState<"lab" | "department">("lab");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        orgName: "",
        contactName: "",
        email: "",
        phone: ""
    });

    const prices = {
        lab: { amount: 29900, label: "$299 (Lab Starter)" }, // USD cents? Razorpay handles currency. Assuming USD 299.00
        department: { amount: 149900, label: "$1,499 (Department Scale)" }
    };

    // Load Razorpay Script
    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        const res = await loadRazorpay();
        if (!res) {
            alert("Razorpay SDK failed to load. Are you online?");
            setLoading(false);
            return;
        }

        // 1. Create Order
        const amount = prices[tier].amount; // in cents
        // NOTE: Razorpay mostly expects INR paise, but for USD it expects cents if configured for international.
        // We will pass USD as currency.

        try {
            const orderReq = await fetch("/api/create-razorpay-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount,
                    currency: "USD",
                    userId: "user_mock_id_or_actual" // Ideally fetch from session in a real app
                })
            });
            const orderData = await orderReq.json();

            if (orderData.error) throw new Error(orderData.error);

            // 2. Open Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ARGUS-Thesis",
                description: tier === "lab" ? "Lab Starter Pack" : "Department Scale License",
                image: "/logo.jpg",
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                    // Redirect to dashboard or success page
                    window.location.href = "/dashboard?upgraded=true";
                },
                prefill: {
                    name: form.contactName,
                    email: form.email,
                    contact: form.phone
                },
                theme: {
                    color: "#18181b" // zinc-900
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            setLoading(false);

        } catch (err: any) {
            console.error(err);
            alert("Payment initialization failed: " + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-serif text-zinc-900">
            <Header />

            <main className="py-20 px-4">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">

                    {/* LEFT: Plan Selection */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Institutional Access</h1>
                            <p className="text-zinc-600 font-sans">
                                Create a managed environment for your research team. Centralized billing, priority compute, and unified governance.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-zinc-500" /> Select Tier
                            </h3>
                            <RadioGroup value={tier} onValueChange={(v: any) => setTier(v)} className="space-y-4">
                                <div className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-all ${tier === 'lab' ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}>
                                    <RadioGroupItem value="lab" id="lab" className="mt-1" />
                                    <Label htmlFor="lab" className="cursor-pointer flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-lg">Lab Starter Pack</span>
                                            <span className="font-bold text-lg">$299</span>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-sans mb-2">Perfect for small research groups.</p>
                                        <ul className="text-xs text-zinc-600 space-y-1 font-sans">
                                            <li className="flex gap-1"><Check className="w-3 h-3 text-green-600" /> 20 Full Credits</li>
                                            <li className="flex gap-1"><Check className="w-3 h-3 text-green-600" /> 10 Researcher Seats</li>
                                        </ul>
                                    </Label>
                                </div>

                                <div className={`flex items-start space-x-4 p-4 rounded-lg border cursor-pointer transition-all ${tier === 'department' ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900' : 'border-zinc-200 hover:border-zinc-300'}`}>
                                    <RadioGroupItem value="department" id="department" className="mt-1" />
                                    <Label htmlFor="department" className="cursor-pointer flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-lg">Department Scale</span>
                                            <span className="font-bold text-lg">$1,499</span>
                                        </div>
                                        <p className="text-sm text-zinc-500 font-sans mb-2">For high-volume academic departments.</p>
                                        <ul className="text-xs text-zinc-600 space-y-1 font-sans">
                                            <li className="flex gap-1"><Check className="w-3 h-3 text-green-600" /> 100 Full Credits</li>
                                            <li className="flex gap-1"><Check className="w-3 h-3 text-green-600" /> Unlimited Seats</li>
                                        </ul>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    {/* RIGHT: Organization Details Form */}
                    <div className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-xl h-fit">
                        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                            Create Account
                        </h3>

                        <div className="space-y-5 font-sans">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">University / Organization Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                                    <Input
                                        id="orgName"
                                        placeholder="e.g. Stanford University Dept of Physics"
                                        className="pl-10 h-12"
                                        value={form.orgName}
                                        onChange={e => setForm({ ...form, orgName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="contactName">Admin Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                                    <Input
                                        id="contactName"
                                        placeholder="Dr. Sarah Connor"
                                        className="pl-10 h-12"
                                        value={form.contactName}
                                        onChange={e => setForm({ ...form, contactName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Official Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="admin@univ.edu"
                                            className="pl-10 h-12"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+1 555-0123"
                                        className="h-12"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    className="w-full h-14 text-lg font-bold bg-zinc-900 hover:bg-zinc-800 text-white"
                                    disabled={!form.email || !form.orgName || loading}
                                    onClick={handlePayment}
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <CreditCard className="mr-2 h-5 w-5" />
                                    )}
                                    Pay {prices[tier].label} via Razorpay
                                </Button>
                                <p className="text-center text-xs text-zinc-400 mt-4">
                                    Secure payment processed by Razorpay. <br />
                                    You will receive an invoice and onboarding link immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
}
