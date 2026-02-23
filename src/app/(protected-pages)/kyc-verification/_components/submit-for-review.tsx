"use client";

import { useState } from "react";
import { SystemButton } from "@/components/shared/system-button";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SubmitForReviewProps {
    onBack: () => void;
}

export default function SubmitForReview({ onBack }: SubmitForReviewProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate submission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 2000);
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-semibold text-white mb-4">
                        Verification Submitted!
                    </h2>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Your documents have been submitted successfully. Our team will review your
                        information and get back to you within 2-3 business days.
                    </p>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-sm text-slate-300">
                            <span className="font-medium text-white">What's next?</span>
                            <br />
                            You'll receive an email notification once your verification is complete.
                            In the meantime, you can track your status in your account dashboard.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">
                    Step 4: Submit for Review
                </h2>
                <p className="text-sm text-slate-400">
                    Review your information before submitting for verification.
                </p>
            </div>

            {/* Review Summary */}
            <div className="space-y-6">
                {/* Personal Info Summary */}
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-slate-400">Name</p>
                            <p className="text-white">Hussain [Last Name]</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Date of Birth</p>
                            <p className="text-white">MM/DD/YYYY</p>
                        </div>
                        <div>
                            <p className="text-slate-400">Country</p>
                            <p className="text-white">[Selected Country]</p>
                        </div>
                        <div>
                            <p className="text-slate-400">City</p>
                            <p className="text-white">[City Name]</p>
                        </div>
                    </div>
                </div>

                {/* Email Verification Summary */}
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Email Verification
                    </h3>
                    <p className="text-sm text-slate-400">Email Address</p>
                    <p className="text-white">your.email@example.com</p>
                    <p className="text-sm text-green-400 mt-2">✓ Verified</p>
                </div>

                {/* Documents Summary */}
                <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Documents Uploaded
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Government ID</span>
                            <span className="text-green-400">✓ Uploaded</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Proof of Address</span>
                            <span className="text-green-400">✓ Uploaded</span>
                        </div>
                    </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-slate-300">
                        <p className="font-medium text-white mb-2">Before you submit</p>
                        <ul className="space-y-1 list-disc list-inside">
                            <li>All information provided is accurate and truthful</li>
                            <li>Documents are clear, valid, and unaltered</li>
                            <li>
                                You consent to the verification of your information by our team
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                    <SystemButton
                        type="button"
                        onClick={onBack}
                        variant="ghost"
                        
                        disabled={isSubmitting}
                    >
                        Back
                    </SystemButton>
                    <SystemButton
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                       
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit for Verification"
                        )}
                    </SystemButton>
                </div>
            </div>
        </div>
    );
}