"use client";

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

export default function AccountStatus() {
  const { session } = useSessionContext();

  const lastLoginRaw =
    session?.user?.lastLoginAt ??
    session?.user?.lastLogin ??
    session?.user?.last_login ??
    session?.user?.last_login_at ??
    null;

  const lastLoginText = (() => {
    if (!lastLoginRaw) return "Not available";
    const d = new Date(lastLoginRaw);
    if (Number.isNaN(d.getTime())) return "Not available";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  })();

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
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">KYC Verification</p>
              <p className="text-sm text-muted-foreground">
                Please complete KYC verification
              </p>
              <Link href="/kyc-verification">
                <p className="text-sm text-blue-500 mt-1 cursor-pointer">
                  Complete Verification
                  <ChevronRight className="w-4 h-4 inline-block ml-1" />
                </p>
              </Link>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-card text-muted-foreground">
            Not Submitted
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
              <p className="text-sm text-muted-foreground">
                Account setup in progress
              </p>
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
              <p className="text-sm text-muted-foreground">
                Enhance security with 2FA
              </p>
              <p className="text-sm text-orange-400 mt-1 cursor-pointer">
                Enable 2FA
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
            Disabled
          </span>
        </div>

        {/* LAST LOGIN */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium">Last Login</p>
            <p className="text-sm text-muted-foreground">
              {lastLoginText}
            </p>
          </div>
        </div>

        {/* ACTION REQUIRED */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-3">
          <p className="font-medium text-blue-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Action Required
          </p>
          <p className="text-sm text-muted-foreground">
            Complete KYC verification to unlock full trading features and higher limits.
          </p>
          <SystemButton size="sm">Verify Now</SystemButton>
        </div>

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