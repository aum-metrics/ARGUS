"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PilotCreationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function PilotCreationModal({ open, onOpenChange, onSuccess }: PilotCreationModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        universityName: "",
        contactEmail: "",
        contactName: "",
        credits: 10,
        durationDays: 90,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admin/create-pilot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                alert(`Pilot created for ${formData.universityName}! ${formData.credits} credits, expires in ${formData.durationDays} days.`);
                onSuccess();
                onOpenChange(false);
                // Reset form
                setFormData({
                    universityName: "",
                    contactEmail: "",
                    contactName: "",
                    credits: 10,
                    durationDays: 90,
                });
            } else {
                alert(data.error || 'Failed to create pilot');
            }
        } catch (error) {
            console.error('Pilot creation error:', error);
            alert('Failed to create pilot. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <DialogTitle className="text-zinc-900">Create University Pilot</DialogTitle>
                    <DialogDescription className="text-zinc-600">
                        Set up a new pilot program for a university with free credits.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="universityName" className="text-zinc-700">
                                University Name
                            </Label>
                            <Input
                                id="universityName"
                                value={formData.universityName}
                                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                                placeholder="e.g., Stanford University"
                                required
                                className="border-zinc-300"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactName" className="text-zinc-700">
                                Contact Name
                            </Label>
                            <Input
                                id="contactName"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="e.g., Dr. Jane Smith"
                                required
                                className="border-zinc-300"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contactEmail" className="text-zinc-700">
                                Contact Email
                            </Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                placeholder="e.g., contact@university.edu"
                                required
                                className="border-zinc-300"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="credits" className="text-zinc-700">
                                    Credits
                                </Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    min="1"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                    required
                                    className="border-zinc-300"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="durationDays" className="text-zinc-700">
                                    Duration (days)
                                </Label>
                                <Input
                                    id="durationDays"
                                    type="number"
                                    min="1"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                    required
                                    className="border-zinc-300"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                            className="border-zinc-300 hover:bg-zinc-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            {loading ? 'Creating...' : 'Create Pilot'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
