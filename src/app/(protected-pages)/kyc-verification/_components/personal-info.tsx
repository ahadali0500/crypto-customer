"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui";
import { SystemButton } from "@/components/shared/system-button";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/Select";
import { BodyText, PageTitle } from "@/components/typography";

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
    const form = useForm<PersonalInfoForm>();
    const [countries, setCountries] = useState<string[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);

    useEffect(() => {
        fetch("https://restcountries.com/v3.1/all?fields=name")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch countries");
                return res.json();
            })
            .then((data) => {
                const names = data
                    .map((c: any) => c.name.common)
                    .sort((a: string, b: string) => a.localeCompare(b));
                setCountries(names);
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
        <div className="w-full max-w-3xl bg-card border rounded-lg p-8">
            {/* Header */}
            <div className="mb-8">
                <PageTitle className="text-2xl font-semibold mb-2">
                    Step 1: Personal Information
                </PageTitle>
                <BodyText className="text-sm">
                    Please provide your legal information as it appears on your official documents.
                </BodyText>
            </div>

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Legal First Name</label>
                        <Input
                            {...form.register("firstName")}
                            placeholder="Enter your first name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Legal Last Name</label>
                        <Input
                            {...form.register("lastName")}
                            placeholder="Enter your last name"
                        />
                    </div>
                </div>

                {/* DOB */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <Input type="date" {...form.register("dob")} />
                </div>

                {/* Country */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Country of Residence</label>
                    <Select
                        onValueChange={(val) => form.setValue("country", val)}
                        value={form.watch("country")}
                        disabled={isLoadingCountries}
                    >
                        <SelectTrigger className="w-full">
                            {isLoadingCountries ? "Loading countries..." : (form.watch("country") || "Select a country")}
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                            {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                    {country}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Street Address</label>
                    <Input
                        {...form.register("address")}
                        placeholder="Enter your street address"
                    />
                </div>

                {/* City + Postal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input
                            {...form.register("city")}
                            placeholder="Enter your city"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Postal Code</label>
                        <Input
                            {...form.register("postalCode")}
                            placeholder="Enter your postal code"
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="flex justify-end pt-4">
                    <SystemButton type="submit">
                        Continue to Email Verification
                    </SystemButton>
                </div>
            </form>
        </div>
    );
}