"use client";

import { useState } from "react";
import { Form } from "@/components/ui";
import { SystemButton } from "@/components/shared/system-button";
import { useForm } from "react-hook-form";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { BodyText,PageTitle } from "@/components/typography";

interface UploadDocumentsProps {
    onNext: () => void;
    onBack: () => void;
}

type UploadedFile = {
    id: string;
    name: string;
    size: string;
    type: string;
};

export default function UploadDocuments({ onNext, onBack }: UploadDocumentsProps) {
    const form = useForm();
    const [idDocument, setIdDocument] = useState<UploadedFile | null>(null);
    const [proofOfAddress, setProofOfAddress] = useState<UploadedFile | null>(null);

    const handleFileUpload = (
        event: React.ChangeEvent<HTMLInputElement>,
        type: "id" | "address"
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const fileData: UploadedFile = {
            id: Math.random().toString(36),
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            type: file.type,
        };

        if (type === "id") {
            setIdDocument(fileData);
        } else {
            setProofOfAddress(fileData);
        }
    };

    const removeFile = (type: "id" | "address") => {
        if (type === "id") {
            setIdDocument(null);
        } else {
            setProofOfAddress(null);
        }
    };

    const onSubmit = () => {
        if (!idDocument || !proofOfAddress) {
            alert("Please upload both required documents");
            return;
        }
        console.log("Documents uploaded:", { idDocument, proofOfAddress });
        onNext();
    };

    return (
        <div className="w-full max-w-3xl bg-card border rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
                <PageTitle className=" mb-2">
                    Step 3: Upload Documents
                </PageTitle>
                <BodyText>
                    Please upload clear copies of your identification documents.
                </BodyText>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* ID Document */}
                    <div>
                        <label className="block font-medium mb-3">
                            Government-Issued ID
                        </label>
                        <BodyText className="text-sm mb-4">
                            Upload a passport, driver's license, or national ID card
                        </BodyText>

                        {!idDocument ? (
                            <label className="block">
                                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition-all">
                                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-300 mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        PNG, JPG or PDF (max. 10MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, "id")}
                                />
                            </label>
                        ) : (
                            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                    <div>
                                        <p className="text-white font-medium">{idDocument.name}</p>
                                        <p className="text-sm text-slate-400">{idDocument.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile("id")}
                                        className="text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Proof of Address */}
                    <div>
                        <label className="block font-medium mb-3">
                            Proof of Address
                        </label>
                        <BodyText className="text-sm mb-4">
                            Upload a utility bill, bank statement, or rental agreement (dated
                            within last 3 months)
                        </BodyText>

                        {!proofOfAddress ? (
                            <label className="block">
                                <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition-all">
                                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-300 mb-2">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        PNG, JPG or PDF (max. 10MB)
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileUpload(e, "address")}
                                />
                            </label>
                        ) : (
                            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-400" />
                                    <div>
                                        <p className="text-white font-medium">
                                            {proofOfAddress.name}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {proofOfAddress.size}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <button
                                        type="button"
                                        onClick={() => removeFile("address")}
                                        className="text-slate-400 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                        <p className="text-sm ">
                            <span className="font-medium ">Important:</span> Ensure all
                            documents are clear, readable, and show all four corners. Blurry or
                            cropped images may delay your verification.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between pt-4">
                        <SystemButton
                            type="button"
                            onClick={onBack}
                            variant="ghost"
                        >
                            Back
                        </SystemButton>
                        <SystemButton
                            type="submit"
                            
                        >
                            Continue to Review
                        </SystemButton>
                    </div>
                </form>
            </Form>
        </div>
    );
}