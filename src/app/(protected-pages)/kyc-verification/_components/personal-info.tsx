"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import { SystemButton } from "@/components/shared/system-button";
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
  onNext: () => void;
}

export default function PersonalInfo({ onNext }: PersonalInfoProps) {
  const form = useForm();
  const [countryOptions, setCountryOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch countries");
        return res.json();
      })
      .then((data) => {
        const options = data
          .map((c: any) => ({
            value: c.name.common,
            label: c.name.common,
          }))
          .sort((a: { label: string }, b: { label: string }) =>
            a.label.localeCompare(b.label)
          );
        setCountryOptions(options);
        setIsLoadingCountries(false);
      })
      .catch((err) => {
        console.error("Country fetch error:", err);
        setIsLoadingCountries(false);
      });
  }, []);

  const onSubmit = (data: PersonalInfoForm) => {
    console.log("Personal Info:", data);
    onNext();
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
          <div className="flex justify-end">
            <button type="submit" form="personal-info-form" className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md">
              Continue to Email Verification
            </button>
          </div>
        ),
        bordered: true,
      }}
    >
      <form id="personal-info-form" className="max-w-3xl w-full " onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-4">
          {/* Names */}
          <div className="flex flex-col gap-1">
            <label>Legal First Name</label>
            <Input {...form.register("firstName")} className="bg-[#374151]" />
          </div>
          <div className="flex flex-col gap-1">
            <label>Legal Last Name</label>
            <Input {...form.register("lastName")} />
          </div>

          {/* DOB */}
          <div className="flex flex-col gap-1 col-span-2">
            <label>Date of Birth</label>
            <Input type="date" {...form.register("dob")} />
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1 col-span-2">
            <label>Country of Residence</label>
            <Controller
              name="country"
              control={form.control}
              render={({ field }) => (
                <Select
                  {...field}
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

          {/* Address */}
          <div className="flex flex-col gap-1 col-span-2">
            <label>Street Address</label>
            <Input {...form.register("address")} />
          </div>

          {/* City + Postal */}
          <div className="flex flex-col gap-1">
            <label>City</label>
            <Input {...form.register("city")} />
          </div>
          <div className="flex flex-col gap-1">
            <label>Postal Code</label>
            <Input {...form.register("postalCode")} />
          </div>
        </div>
      </form>
    </Card>
  );
}