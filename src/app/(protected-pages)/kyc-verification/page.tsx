"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Check, User, Mail, FileText, CheckCircle, ShieldCheck } from "lucide-react";

import PersonalInfo from "./_components/personal-info";
import EmailVerification from "./_components/email-verification";
import UploadDocuments from "./_components/upload-documents";
import SubmitForReview from "./_components/submit-for-review";

import { PageTitle } from "@/components/typography";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";

const steps = [
  { id: 1, name: "Personal Information", icon: User },
  { id: 2, name: "Email Verification", icon: Mail },
  { id: 3, name: "Upload Documents", icon: FileText },
  { id: 4, name: "Submit for Review", icon: CheckCircle },
];

export default function KYCVerification() {
  const [currentStep, setCurrentStep] = useState(1);
  const [kycData, setKycData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  const computeStepFromCustomer = (customer: any, docs: any[]) => {
    const kycStatus = customer?.kycStatus;
    const emailVerified = Boolean(customer?.kycEmailVerified);

   
    const hasIdentity = docs.some((d: any) => d.category === "KycIdentity");
    const hasAddress = docs.some((d: any) => d.category === "KycAddress");

    // Final states -> always show Step 4 status screen
    if (["Submitted", "InReview", "Approved", "Rejected"].includes(kycStatus)) return 4;

    // Email verified -> Step 3 (upload docs)
    if (emailVerified) {
      // If docs uploaded -> Step 4
      if (hasIdentity && hasAddress) return 4;
      return 3;
    }

    // Personal info saved -> Step 2 (email)
    if (kycStatus === "EmailPending") return 2;

    // Default
    return 1;
  };

  const fetchKycStatus = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
console.log("res",res.data.data.customer);

      const customer = res.data?.data?.customer;
      const docs = res.data?.data?.docs || [];

      setKycData({ customer, docs });

      const step = computeStepFromCustomer(customer, docs);
      setCurrentStep(step);
    } catch (e) {
      console.error("Failed to fetch KYC status", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <div className="p-4 md:p-8">
      <div className="flex mb-10 flex-col items-center text-center">
        <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-blue-500/20">
          <ShieldCheck className="h-8 w-8 text-blue-400" />
        </div>

        <PageTitle>Identity Verification</PageTitle>

        <p className="text-muted-foreground max-w-md mt-2">
          To comply with financial regulations and ensure the security of your account,
          please complete the following verification steps.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-6 left-0 right-0 h-[2px] bg-slate-700/50 -z-10">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{
                  width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-blue-500 border-2 border-blue-500"
                        : isActive
                        ? "bg-blue-500 border-2 border-blue-400"
                        : "bg-slate-800 border-2 border-slate-700"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-400"}`} />
                    )}
                  </div>

                  <span
                    className={`text-xs md:text-sm text-center max-w-[100px] md:max-w-none ${
                      isActive
                        ? "text-blue-400 font-medium"
                        : isCompleted
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {loading ? (
            <div className="text-slate-400">Loading KYC status...</div>
          ) : (
            <>
              {currentStep === 1 && (
                <PersonalInfo
                  onNext={nextStep} // optional (recommended: remove usage in child)
                  onRefresh={fetchKycStatus}
                  kycData={kycData}
                />
              )}

              {currentStep === 2 && (
                <EmailVerification
                  onNext={nextStep} // optional
                  onBack={prevStep}
                  onRefresh={fetchKycStatus}
                  kycData={kycData}
                />
              )}

              {currentStep === 3 && (
                <UploadDocuments
                  onNext={nextStep} // optional
                  onBack={prevStep}
                  onRefresh={fetchKycStatus}
                  kycData={kycData}
                />
              )}

              {currentStep === 4 && (
                <SubmitForReview
                  onBack={prevStep}
                  onRefresh={fetchKycStatus}
                  kycData={kycData}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}