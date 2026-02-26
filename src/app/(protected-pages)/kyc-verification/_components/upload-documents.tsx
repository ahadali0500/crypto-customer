"use client";

import { useMemo, useState } from "react";
import axios from "axios";
import { Form } from "@/components/ui";
import { SystemButton } from "@/components/shared/system-button";
import { useForm } from "react-hook-form";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";
import { BodyText, PageTitle } from "@/components/typography";
import Select from "@/components/ui/Select/Select";

interface UploadDocumentsProps {
  onNext: () => void;
  onBack: () => void;
  onRefresh?: () => void | Promise<void>;
  kycData?: any;
}

type UploadedFile = {
  id: string;
  file: File;
  name: string;
  size: string;
  type: string;
};

type DocForm = {
  idType: { value: string; label: string } | null;
};

const idTypeOptions = [
  { value: "Passport", label: "Passport" },
  { value: "IDCard", label: "ID Card" },
  { value: "Others", label: "Other" },
];

export default function UploadDocuments({
  onNext,
  onBack,
  onRefresh,
  kycData,
}: UploadDocumentsProps) {
  const form = useForm<DocForm>({ defaultValues: { idType: idTypeOptions[1] } });
console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

  const [idDocument, setIdDocument] = useState<UploadedFile | null>(null);
  const [proofOfAddress, setProofOfAddress] = useState<UploadedFile | null>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "address"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // basic size guard (10MB)
    const max = 10 * 1024 * 1024;
    if (file.size > max) {
      setError("Max file size is 10MB.");
      return;
    }

    const fileData: UploadedFile = {
      id: Math.random().toString(36),
      file,
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type,
    };

    setError(null);

    if (type === "id") setIdDocument(fileData);
    else setProofOfAddress(fileData);

    // allow re-uploading the same file again
    event.target.value = "";
  };

  const removeFile = (type: "id" | "address") => {
    if (type === "id") setIdDocument(null);
    else setProofOfAddress(null);
  };

  const onSubmit = async (data: DocForm) => {
    setError(null);

    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    if (!idDocument || !proofOfAddress) {
      setError("Please upload both required documents.");
      return;
    }

    const idType = data.idType?.value || "IDCard";

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("idType", idType);

      // Must match backend multer field names
      fd.append("governmentId", idDocument.file);
      fd.append("proofOfAddress", proofOfAddress.file);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/documents`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      await onRefresh?.();

    } catch (err: any) {
      console.error("KYC upload failed:", err);
      setError(err?.response?.data?.message || "Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  // Optional: show already uploaded docs (from backend status)
  const existingDocs = kycData?.docs || [];
  const existingIdentity = existingDocs.find((d: any) => d.category === "KycIdentity");
  const existingAddress = existingDocs.find((d: any) => d.category === "KycAddress");
const kycStatus = kycData?.customer?.kycStatus;
const canReupload = kycStatus === "Rejected";
  return (
    <div className="w-full max-w-3xl bg-card border rounded-lg p-8">
      <div className="mb-8">
        <PageTitle className="mb-2">Step 3: Upload Documents</PageTitle>
        <BodyText>Please upload clear copies of your identification documents.</BodyText>
      </div>
<Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
  {!!error && <p className="text-sm text-red-400">{error}</p>}

  {/* ID Type */}
  <div className="my-2">
    <label className="block font-medium mb-2">ID Document Type</label>
    <Select
      options={idTypeOptions}
      value={form.watch("idType")}
      onChange={(opt: any) => form.setValue("idType", opt)}
      isSearchable={false}
    />
  </div>

  
{/* If already uploaded from backend and no new file chosen */}
{existingIdentity && !idDocument && !canReupload ? (
  <div className="bg-slate-700/40 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FileText className="w-8 h-8 text-blue-400" />
      <div>
        <p className="text-white font-medium">Existing identity document uploaded</p>
        <p className="text-sm text-slate-400">
          Verified: {existingIdentity.verified ? "Yes" : "No"}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => removeFile("id")}
      className="text-slate-400 hover:text-red-400 transition-colors"
      title="Replace by uploading a new file below"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
) : !idDocument ? (
  <label className="block">
    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition-all">
      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
      <p className="text-slate-300 mb-2">Click to upload or drag and drop</p>
      <p className="text-sm text-slate-500">PNG, JPG or PDF (max. 10MB)</p>
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
{existingAddress && !proofOfAddress && !canReupload ? (
  <div className="mt-2 bg-slate-700/40 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FileText className="w-8 h-8 text-blue-400" />
      <div>
        <p className="text-white font-medium">Existing address document uploaded</p>
        <p className="text-sm text-slate-400">
          Verified: {existingAddress.verified ? "Yes" : "No"}
        </p>
      </div>
    </div>
    <button
      type="button"
      onClick={() => removeFile("address")}
      className="text-slate-400 hover:text-red-400 transition-colors"
      title="Replace by uploading a new file below"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
) : !proofOfAddress ? (
  <label className="block">
    <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/30 transition-all">
      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
      <p className="text-slate-300 mb-2">Click to upload or drag and drop</p>
      <p className="text-sm text-slate-500">PNG, JPG or PDF (max. 10MB)</p>
    </div>
    <input
      type="file"
      className="hidden"
      accept="image/*,.pdf"
      onChange={(e) => handleFileUpload(e, "address")}
    />
  </label>
) : (
  <div className="my-2 bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <FileText className="w-8 h-8 text-blue-400" />
      <div>
        <p className="text-white font-medium">{proofOfAddress.name}</p>
        <p className="text-sm text-slate-400">{proofOfAddress.size}</p>
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
          
  <div className="my-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
    <p className="text-sm">
      <span className="font-medium">Important:</span> Ensure all documents are clear, readable,
      and show all four corners. Blurry or cropped images may delay your verification.
    </p>
  </div>

  <div className="flex justify-between pt-4">
    <SystemButton type="button" onClick={onBack} variant="ghost">
      Back
    </SystemButton>

    <button
      type="submit"
      disabled={uploading}
      className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md border border-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {uploading ? "Uploading..." : "Continue to Review"}
    </button>
  </div>
</Form>

      
    </div>
  );
}