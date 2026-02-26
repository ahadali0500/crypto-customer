"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import Select from "@/components/ui/Select/Select";
import { BodyText, PageTitle } from "@/components/typography";
import Card from "@/components/ui/Card/Card";

type PersonalInfoForm = {
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
};

interface PersonalInfoProps {
  onNext?: () => void; // optional (you can remove later if you want strict backend flow)
  onRefresh?: () => void | Promise<void>;
  kycData?: any;
}

function splitName(full?: string | null) {
  const name = (full || "").trim();
  if (!name) return { firstName: "", lastName: "" };
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default function PersonalInfo({ onNext, onRefresh, kycData }: PersonalInfoProps) {
  const form = useForm<PersonalInfoForm>({
    defaultValues: {
      firstName: "",
      lastName: "",
      dob: "",
      country: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(true);

  const token = useMemo(() => {
    if (typeof window !== "undefined") return localStorage.getItem("authToken");
    return null;
  }, []);

  // 1) Fetch countries
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch countries");
        return res.json();
      })
      .then((data) => {
        const options = data
          .map((c: any) => ({ value: c.name.common, label: c.name.common }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label));

        setCountryOptions(options);
      })
      .catch((err) => console.error("Country fetch error:", err))
      .finally(() => setIsLoadingCountries(false));
  }, []);

  // 2) Prefill from /user/auth/fetch (your existing profile fetch)
  useEffect(() => {
    const prefill = async () => {
      if (!token) {
        setPrefillLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data?.data;
        if (!u) {
          setPrefillLoading(false);
          return;
        }

        const { firstName, lastName } = splitName(u.name);

        // IMPORTANT: use reset() so RHF updates input values properly
        form.reset({
          firstName,
          lastName,
          dob: u.birthDate || "",
          country: u.country || "",
          address: u.address || "",
          city: u.city || "",
          postalCode: u.postalCode || "",
        });
      } catch (e) {
        console.error("Failed to prefill user profile:", e);
      } finally {
        setPrefillLoading(false);
      }
    };

    prefill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 3) Optional: if you pass kycData, prefer those values (only if present)
  useEffect(() => {
    const c = kycData?.customer;
    if (!c) return;

    // we only overwrite fields if backend has value
    const current = form.getValues();
    const nameParts = splitName(c.name);

    form.reset({
      firstName: nameParts.firstName || current.firstName,
      lastName: nameParts.lastName || current.lastName,
      dob: c.birthDate ?? current.dob,
      country: c.country ?? current.country,
      address: c.address ?? current.address,
      city: c.city ?? current.city,
      postalCode: c.postalCode ?? current.postalCode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kycData]);

  const onSubmit = async (data: PersonalInfoForm) => {
    setApiError(null);

    if (!token) {
      setApiError("You are not logged in. Please login again.");
      return;
    }

    const payload = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      birthDate: data.dob,
      country: data.country,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode,
    };

    try {
      setSubmitting(true);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/personal-info`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await onRefresh?.();

      // optional navigation
      onNext?.();
    } catch (err: any) {
      console.error("KYC personal info save failed:", err);
      setApiError(err?.response?.data?.message || "Failed to save personal info");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      header={{
        content: (
          <div>
            <PageTitle>Step 1: Personal Information</PageTitle>
            <BodyText>
              Please provide your legal information as it appears on your official documents.
            </BodyText>
          </div>
        ),
        bordered: true,
      }}
      footer={{
        content: (
          <div className="flex justify-end gap-3">
            {apiError ? <p className="text-sm text-red-400 mr-auto">{apiError}</p> : null}
            <button
              type="submit"
              form="personal-info-form"
              disabled={submitting || prefillLoading}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {prefillLoading ? "Loading..." : submitting ? "Saving..." : "Continue to Email Verification"}
            </button>
          </div>
        ),
        bordered: true,
      }}
    >
      <form
        id="personal-info-form"
        className="max-w-3xl w-full"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label>Legal First Name</label>
            <Input {...form.register("firstName", { required: true })} />
          </div>

          <div className="flex flex-col gap-1">
            <label>Legal Last Name</label>
            <Input {...form.register("lastName", { required: true })} />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label>Date of Birth</label>
            <Input type="date" {...form.register("dob", { required: true })} />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label>Country of Residence</label>
            <Controller
              name="country"
              control={form.control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  options={countryOptions}
                  isLoading={isLoadingCountries}
                  placeholder={isLoadingCountries ? "Loading countries..." : "Select a country"}
                  value={countryOptions.find((opt) => opt.value === field.value) ?? null}
                  onChange={(opt: any) => field.onChange(opt?.value ?? "")}
                  isClearable
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label>Street Address</label>
            <Input {...form.register("address", { required: true })} />
          </div>

          <div className="flex flex-col gap-1">
            <label>City</label>
            <Input {...form.register("city", { required: true })} />
          </div>

          <div className="flex flex-col gap-1">
            <label>Postal Code</label>
            <Input {...form.register("postalCode", { required: true })} />
          </div>
        </div>
      </form>
    </Card>
  );
}