"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  User,
  AlertTriangle,
  Shield,
  Clock,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { SystemButton } from "@/components/shared/system-button";
import Link from "next/link";
import Card from "@/components/ui/Card/Card";
import { useSessionContext } from "@/components/auth/AuthProvider/SessionContext";

type KycStatus =
  | "EmailPending"
  | "DocumentsPending"
  | "Submitted"
  | "InReview"
  | "Approved"
  | "Rejected"
  | string;

export default function AccountStatus() {
  const { session } = useSessionContext();
  const token = session?.user?.token;

  const [lastLoginText, setLastLoginText] = useState<string>("Loading...");
  const [kycStatus, setKycStatus] = useState<KycStatus | null>(null);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLastLoginText("Not available");
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data.data;
        const lastLoginRaw =
          data?.lastLoginAt ?? data?.lastLogin ?? data?.last_login ?? null;

        if (!lastLoginRaw) {
          setLastLoginText("Not available");
          return;
        }

        const d = new Date(lastLoginRaw);
        if (Number.isNaN(d.getTime())) {
          setLastLoginText("Not available");
          return;
        }

        setLastLoginText(
          d.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (error) {
        setLastLoginText("Not available");
      }
    };

    fetchUserDetails();
  }, [token]);

  const fetchKycStatus = async () => {
    if (!token) return;
    try {
      setKycLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/kyc/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const customer = res.data?.data?.customer;
      setKycStatus(customer?.kycStatus ?? null);
    } catch (e) {
      console.error("Failed to fetch KYC status", e);
    } finally {
      setKycLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
    const t = setInterval(fetchKycStatus, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const kycUi = useMemo(() => {
    if (kycLoading && !kycStatus) {
      return {
        title: "KYC Verification",
        desc: "Checking your KYC status…",
        badgeText: "Loading…",
        badgeClass: "bg-card text-muted-foreground",
        showCta: false,
        ctaText: "Complete Verification",
      };
    }

    if (!kycStatus) {
      return {
        title: "KYC Verification",
        desc: "Please complete KYC verification",
        badgeText: "Not Submitted",
        badgeClass: "bg-card text-muted-foreground",
        showCta: true,
        ctaText: "Complete Verification",
      };
    }

    if (kycStatus === "Approved") {
      return {
        title: "KYC Verification",
        desc: "Your KYC is approved",
        badgeText: "Approved",
        badgeClass: "bg-green-500/20 text-green-400",
        showCta: false,
        ctaText: "View",
      };
    }

    if (kycStatus === "Rejected") {
      return {
        title: "KYC Verification",
        desc: "Your KYC was rejected — please re-upload documents",
        badgeText: "Rejected",
        badgeClass: "bg-red-500/20 text-red-400",
        showCta: true,
        ctaText: "Fix & Resubmit",
      };
    }

    if (kycStatus === "Submitted" || kycStatus === "InReview") {
      return {
        title: "KYC Verification",
        desc: "Your KYC is submitted and under review",
        badgeText: kycStatus,
        badgeClass: "bg-blue-500/20 text-blue-400",
        showCta: true,
        ctaText: "View Status",
      };
    }

    if (kycStatus === "DocumentsPending") {
      return {
        title: "KYC Verification",
        desc: "Upload your documents to continue",
        badgeText: "Documents Pending",
        badgeClass: "bg-amber-500/20 text-amber-400",
        showCta: true,
        ctaText: "Upload Documents",
      };
    }

    if (kycStatus === "EmailPending") {
      return {
        title: "KYC Verification",
        desc: "Verify your email to continue",
        badgeText: "Email Pending",
        badgeClass: "bg-amber-500/20 text-amber-400",
        showCta: true,
        ctaText: "Verify Email",
      };
    }

    return {
      title: "KYC Verification",
      desc: "KYC in progress",
      badgeText: kycStatus,
      badgeClass: "bg-card text-muted-foreground",
      showCta: true,
      ctaText: "View",
    };
  }, [kycLoading, kycStatus]);

  const showActionRequired =
    !kycStatus ||
    (kycStatus !== "Approved" &&
      kycStatus !== "InReview" &&
      kycStatus !== "Submitted");

  return (
    <Card
      header={{
        content: (
          <div className="flex items-center gap-2 text-lg font-semibold">
            <User className="w-5 h-5 text-blue-400" />
            Account Status
          </div>
        ),
        bordered: true,
      }}
    >
      <div className="space-y-4">
        {/* KYC */}
        <div className="rounded-xl border border-themed bg-muted/40 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">{kycUi.title}</p>
              <p className="text-sm text-muted-foreground">{kycUi.desc}</p>
              {kycUi.showCta && (
                <Link href="/kyc-verification">
                  <p className="text-sm text-blue-500 mt-1 cursor-pointer">
                    {kycUi.ctaText}
                    <ChevronRight className="w-4 h-4 inline-block ml-1" />
                  </p>
                </Link>
              )}
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${kycUi.badgeClass}`}>
            {kycUi.badgeText}
          </span>
        </div>

        {/* ACCOUNT ACCESS */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium">Account Access</p>
              <p className="text-sm text-muted-foreground">Account setup in progress</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
            Pending
          </span>
        </div>

        {/* 2FA */}
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Enhance security with 2FA</p>
              <p className="text-sm text-orange-400 mt-1 cursor-pointer">Enable 2FA</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
            Disabled
          </span>
        </div>

        {/* LAST LOGIN */}
        <div className="rounded-xl border border-themed bg-muted/40 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium">Last Login</p>
            <p className="text-sm text-muted-foreground">{lastLoginText}</p>
          </div>
        </div>

        {/* ACTION REQUIRED */}
        {showActionRequired && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
            <p className="font-medium text-blue-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Action Required
            </p>
            <p className="text-sm text-muted-foreground">
              Complete KYC verification to unlock full trading features and higher limits.
            </p>
            <Link href="/kyc-verification">
              <SystemButton size="sm">Verify Now</SystemButton>
            </Link>
          </div>
        )}

        {/* SECURITY ALERT */}
        <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 space-y-3">
          <p className="font-medium text-orange-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Alert
          </p>
          <p className="text-sm text-muted-foreground">
            Enable Two-Factor Authentication (2FA) to add an extra layer of security to your account.
          </p>
          <SystemButton size="sm" className="bg-orange-500 hover:bg-orange-600">
            Enable 2FA Now
          </SystemButton>
        </div>
      </div>
    </Card>
  );
}