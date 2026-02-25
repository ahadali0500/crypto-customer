"use client";

import { useState } from "react";
import { Check, User, Mail, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import PersonalInfo from "./_components/personal-info";
import EmailVerification from "./_components/email-verification";
import UploadDocuments from "./_components/upload-documents";
import SubmitForReview from "./_components/submit-for-review";
import { PageTitle } from "@/components/typography";
const steps = [
    { id: 1, name: "Personal Information", icon: User },
    { id: 2, name: "Email Verification", icon: Mail },
    { id: 3, name: "Upload Documents", icon: FileText },
    { id: 4, name: "Submit for Review", icon: CheckCircle },
];

export default function KYCVerification() {
    const [currentStep, setCurrentStep] = useState(1);

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className=" p-4 md:p-8">
            <div className="flex mb-10 flex-col items-center text-center">
                {/* Icon with background */}
                <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-blue-500/20">
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                </div>

                <PageTitle>
                    Identity Verification
                </PageTitle>

                <p className="text-muted-foreground max-w-md mt-2">
                    To comply with financial regulations and ensure the security of your account, please complete the following verification steps.
                </p>
            </div>

            <div className="max-w-5xl  mx-auto">
                {/* Stepper */}
                <div className="mb-12">
                    <div className="flex items-center justify-between relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-0 right-0 h-[2px] bg-slate-700/50 -z-10">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{
                                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                }}
                            />
                        </div>

                        {/* Steps */}
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center relative z-10"
                                >
                                    {/* Circle */}
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                                            ? "bg-blue-500 border-2 border-blue-500"
                                            : isActive
                                                ? "bg-blue-500 border-2 border-blue-400"
                                                : "bg-slate-800 border-2 border-slate-700"
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-6 h-6 text-white" />
                                        ) : (
                                            <Icon
                                                className={`w-6 h-6 ${isActive ? "text-white" : "text-slate-400"
                                                    }`}
                                            />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`text-xs md:text-sm text-center max-w-[100px] md:max-w-none ${isActive
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

                {/* Form Content */}
                <div className="flex justify-center">
                    {currentStep === 1 && <PersonalInfo onNext={nextStep} />}
                    {currentStep === 2 && (
                        <EmailVerification onNext={nextStep} onBack={prevStep} />
                    )}
                    {currentStep === 3 && (
                        <UploadDocuments onNext={nextStep} onBack={prevStep} />
                    )}
                    {currentStep === 4 && <SubmitForReview onBack={prevStep} />}
                </div>
            </div>
        </div>
    );
}