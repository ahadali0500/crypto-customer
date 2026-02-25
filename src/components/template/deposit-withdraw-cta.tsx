import React from "react";
import { useRouter } from "next/navigation";
import withHeaderItem from "@/utils/hoc/withHeaderItem";

type CtaProps = {
    className?: string;
};

function CtaButtons({ className }: CtaProps) {
    const router = useRouter();

    return (
        <div className={`flex items-center gap-2 ${className ?? ""}`}>
            <button
                onClick={() => router.push("/deposit/crypto")}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
                <span className="text-base leading-none">+</span>
                Deposit
            </button>

            <button
                onClick={() => router.push("/withdrawal/crypto")}
                className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
                Withdraw
            </button>
        </div>
    );
}

const Cta = withHeaderItem(CtaButtons);

export default Cta;