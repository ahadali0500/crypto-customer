"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { SystemButton } from "@/components/shared/system-button";
import { CheckCircle2, AlertCircle, Loader2, XCircle } from "lucide-react";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";
interface SubmitForReviewProps {
  onBack: () => void;
  onRefresh?: () => void | Promise<void>;
  kycData?: any;
}

const formatDateTime = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString();
};

export default function SubmitForReview({ onBack, onRefresh, kycData }: SubmitForReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  const customer = kycData?.customer;
  const docs = kycData?.docs || [];
 const { session } = useSessionContext();
     
       const userEmail =
         session?.user?.email
  const kycStatus: string | undefined = customer?.kycStatus;
  const submittedAt = customer?.kycSubmittedAt;
  const rejectedReason = customer?.kycRejectedReason;

  const hasIdentity = docs.some((d: any) => d.category === "KycIdentity");
  const hasAddress = docs.some((d: any) => d.category === "KycAddress");

  const alreadySubmitted = ["Submitted", "InReview"].includes(kycStatus);
  const approved = kycStatus === "Approved";
  const rejected = kycStatus === "Rejected";

  const handleSubmit = async () => {
    setError(null);

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await onRefresh?.();
    } catch (err: any) {
      console.error("KYC submit error:", err);
      setError(err?.response?.data?.message || "Failed to submit KYC");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Status screens
  if (approved) {
    return (
      <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">KYC Approved!</h2>
          <p className="text-slate-400 mb-3 max-w-md mx-auto">
            Your identity verification has been approved.
          </p>
          <p className="text-sm text-slate-500">
            Submitted: {formatDateTime(submittedAt)}
          </p>
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-blue-400" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-4">
            Verification Submitted!
          </h2>
          <p className="text-slate-400 mb-2 max-w-md mx-auto">
            Your documents have been submitted successfully. Our team will review your
            information and update your status.
          </p>
          <p className="text-sm text-slate-500 mb-8">
            Submitted: {formatDateTime(submittedAt)}
          </p>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-slate-300">
              <span className="font-medium text-white">Current status:</span>{" "}
              {kycStatus}
              <br />
              You’ll receive an email notification once your verification is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (rejected) {
    return (
      <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
        <div className="text-center py-10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-3xl font-semibold text-white mb-3">KYC Rejected</h2>
          <p className="text-slate-400 mb-2 max-w-md mx-auto">
            Your submission was rejected. Please correct the issue and resubmit.
          </p>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-xl mx-auto text-left">
            <p className="text-sm text-slate-200">
              <span className="font-medium text-white">Reason:</span>{" "}
              {rejectedReason || "No reason provided."}
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <SystemButton type="button" onClick={onBack} variant="ghost">
              Back to Documents
            </SystemButton>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Default: Review + Submit screen
  return (
    <div className="w-full max-w-3xl bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Step 4: Submit for Review
        </h2>
        <p className="text-sm text-slate-400">
          Review your information before submitting for verification.
        </p>
      </div>

      <div className="space-y-6">
        {!!error && <p className="text-sm text-red-400">{error}</p>}

        {/* Personal Info Summary */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Name</p>
              <p className="text-white">{customer?.name || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400">Date of Birth</p>
              <p className="text-white">{customer?.birthDate || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400">Country</p>
              <p className="text-white">{customer?.country || "-"}</p>
            </div>
            <div>
              <p className="text-slate-400">City</p>
              <p className="text-white">{customer?.city || "-"}</p>
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
          <p className="text-white">{userEmail || "-"}</p>
          <p className={`text-sm mt-2 ${customer?.kycEmailVerified ? "text-green-400" : "text-amber-400"}`}>
            {customer?.kycEmailVerified ? "✓ Verified" : "Not verified"}
          </p>
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
              <span className={hasIdentity ? "text-green-400" : "text-amber-400"}>
                {hasIdentity ? "✓ Uploaded" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Proof of Address</span>
              <span className={hasAddress ? "text-green-400" : "text-amber-400"}>
                {hasAddress ? "✓ Uploaded" : "Missing"}
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white mb-2">Before you submit</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>All information provided is accurate and truthful</li>
              <li>Documents are clear, valid, and unaltered</li>
              <li>You consent to the verification of your information by our team</li>
            </ul>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <SystemButton type="button" onClick={onBack} variant="ghost" disabled={isSubmitting}>
            Back
          </SystemButton>

          <SystemButton
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !customer?.kycEmailVerified ||
              !hasIdentity ||
              !hasAddress
            }
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