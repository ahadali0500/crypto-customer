import React from "react";
import { Button } from "../ui";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface SystemButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md"; // md = default
  children: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary: "bg-muted cursor-pointer text-muted-foreground hover:bg-muted/90 active:bg-muted/80",
  ghost: "bg-transparent border cursor-pointer text-primary hover:bg-primary/10 active:bg-primary/20",
};

const SIZE_STYLES: Record<"sm" | "md", string> = {
  sm: "h-9 px-3 text-sm", // 36–40px
  md: "h-11 px-4 text-base", // 40–44px
};

export const SystemButton: React.FC<SystemButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={twMerge(
        "rounded-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
