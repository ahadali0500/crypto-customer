"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui";
import { SystemButton } from "@/components/shared/system-button";
import { BodyText,SectionTitle } from "@/components/typography";

type EmailVerificationForm = {
    email: string;
    verificationCode: string;
};

interface EmailVerificationProps {
    onNext: () => void;
    onBack: () => void;
}

export default function EmailVerification({ onNext, onBack }: EmailVerificationProps) {
    const form = useForm<EmailVerificationForm>();
    const [codeSent, setCodeSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const sendVerificationCode = async () => {
        const email = form.getValues("email");
        if (!email) {
            alert("Please enter your email address");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setCodeSent(true);
            setIsLoading(false);
            alert(`Verification code sent to ${email}`);
        }, 1000);
    };

    const onSubmit = (data: EmailVerificationForm) => {
        console.log("Email Verification:", data);
        if (!codeSent) {
            alert("Please send verification code first");
            return;
        }
        onNext();
    };

    return (
        <div className="w-full max-w-3xl bg-card border rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
                <SectionTitle>Step 2: Email Verification</SectionTitle>
                <BodyText>
                    We'll send a verification code to your email address to confirm it's you.
                </BodyText>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address</label>
                    <div className="flex gap-3">
                        <Input
                            {...form.register("email")}
                            type="email"
                            placeholder="Enter your email address"
                            disabled={codeSent}
                        />
                        <SystemButton
                            type="button"
                            onClick={sendVerificationCode}
                            disabled={codeSent || isLoading}
                            size="sm"
                        >
                            {isLoading ? "Sending..." : codeSent ? "Code Sent" : "Send Code"}
                        </SystemButton>
                    </div>
                </div>

                {/* Verification Code */}
                {codeSent && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input
                            {...form.register("verificationCode")}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                        />
                        <BodyText>Check your email inbox for the verification code</BodyText>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                    <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <SectionTitle className="font-medium mb-1">Why do we need this?</SectionTitle>
                        <BodyText>
                            Email verification ensures account security and allows us to send
                            important updates about your verification status.
                        </BodyText>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                    <SystemButton type="button" onClick={onBack} variant="ghost">
                        Back
                    </SystemButton>
                    <SystemButton type="submit">
                        Continue to Upload Documents
                    </SystemButton>
                </div>
            </form>
        </div>
    );
}