"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui";
import { BodyText, SectionTitle } from "@/components/typography";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
import Card from "@/components/ui/Card/Card";

type EmailVerificationForm = {
  email: string;
  verificationCode: string;
};

interface EmailVerificationProps {
  onNext: () => void;
  onBack: () => void;
  onRefresh?: () => void | Promise<void>;
  kycData?: any;
}

export default function EmailVerification({
  onNext,
  onBack,
  onRefresh,
  kycData,
}: EmailVerificationProps) {
  const form = useForm<EmailVerificationForm>({
    defaultValues: {
      email: kycData?.customer?.email ?? "",
      verificationCode: "",
    },
  });

  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  const { session } = useSessionContext();
  const userEmail = session?.user?.email;

  const alreadyVerified = Boolean(kycData?.customer?.kycEmailVerified);

  const sendVerificationCode = async () => {
    setError(null);
    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    try {
      setSending(true);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/email/send-code`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ if backend says already verified, refresh + move on
      const msg = res?.data?.message;
      if (msg === "Email already verified") {
        await onRefresh?.();
        onNext();
        return;
      }

      setCodeSent(true);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(err?.response?.data?.message || "Failed to send code");
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (data: EmailVerificationForm) => {
    setError(null);

    // ✅ Safety: if already verified, just move forward (don’t validate code)
    if (alreadyVerified) {
      onNext();
      return;
    }

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    if (!codeSent) {
      setError("Please send verification code first.");
      return;
    }

    if (!data.verificationCode || data.verificationCode.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    try {
      setVerifying(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/email/verify-code`,
        { code: data.verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await onRefresh?.();
      onNext(); // ✅ go next after verify
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err?.response?.data?.message || "Invalid or expired code");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <div className="mb-8">
        <SectionTitle>Step 2: Email Verification</SectionTitle>
        <BodyText>We'll send a verification code to your email address to confirm it's you.</BodyText>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!!error && <p className="text-sm text-red-400">{error}</p>}

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <div className="flex gap-3">
            <Input
              {...form.register("email")}
              type="email"
              value={userEmail || ""}
              placeholder="Your account email"
              disabled
            />
            <button
              type="button"
              onClick={sendVerificationCode}
              disabled={alreadyVerified || sending}
              className="px-10 rounded-md border border-slate-500 text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {alreadyVerified
                ? "Verified"
                : sending
                ? "Sending..."
                : codeSent
                ? "Resend"
                : "Send Code"}
            </button>
          </div>
          <BodyText className="text-xs">We’ll send the code to your registered email.</BodyText>
        </div>

        {/* Verification Code */}
        {!alreadyVerified && codeSent && (
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

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
          <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <SectionTitle className="font-medium mb-1">Why do we need this?</SectionTitle>
            <BodyText>
              Email verification ensures account security and allows us to send important updates
              about your verification status.
            </BodyText>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-1 bg-gray-500 text-white hover:bg-gray-600 rounded-md border border-slate-500"
          >
            Back
          </button>

          {/* ✅ If already verified, do NOT submit form */}
          {alreadyVerified ? (
            <button
              type="button"
              onClick={onNext}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md border border-slate-500"
            >
              Continue to Upload Documents
            </button>
          ) : (
            <button
              type="submit"
              disabled={verifying}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md border border-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifying ? "Verifying..." : "Continue to Upload Documents"}
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}