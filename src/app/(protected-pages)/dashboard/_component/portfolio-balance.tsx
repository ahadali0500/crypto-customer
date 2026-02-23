import React from "react";
import { SystemCard,SystemCardContent } from "@/components/shared/system-card";
import { Wallet, ArrowRight, Link } from "lucide-react";
import { SystemButton } from "@/components/shared/system-button";
import { useRouter } from "next/navigation";
export default function PortfolioBalance() {
    const router = useRouter()
    return (
        <SystemCard >
            <SystemCardContent>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                            <Wallet className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-300">Your Portfolio Balance</p>
                            <p className="text-xl font-semibold text-emerald-400">€0.00</p>
                        </div>
                    </div>


                    <SystemButton onClick={()=>router.push("/client-dashboard/client-transactions")} variant="ghost"> View details <ArrowRight className="h-4 w-4" /></SystemButton>

                </div>

                {/* Empty State */}
                <div className="flex flex-col items-center justify-center text-center py-8 space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-700/40">
                        <Wallet className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-300">No assets in portfolio</p>
                    <p className="text-xs text-slate-500">
                        Make a deposit to see your balance
                    </p>
                </div>
            </SystemCardContent>
        </SystemCard>
    );
}
