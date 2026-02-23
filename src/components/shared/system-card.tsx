import React from "react";
import { Card,CardHeader,CardTitle,CardContent,CardFooter,CardDescription } from "../ui/Card";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "muted" | "outlined";

interface SystemCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  clickable?: boolean;
  className?: string;
}

function SystemCard({
  children,
  variant = "default",
  clickable = false,
  className,
}: SystemCardProps) {
  return (
    <Card
      className={cn(
        // Global system rules
        "rounded-[12px] shadow-none",

        // Variants
        variant === "default" && "bg-card",
        variant === "muted" && "bg-muted",
        variant === "outlined" && "border border-border/40",

        // Interaction
        clickable &&
          "cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted",

        className
      )}
    >
      {children}
    </Card>
  );
}

function SystemCardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardHeader className={cn("pb-4 space-y-1", className)}>
      {children}
    </CardHeader>
  );
}

function SystemCardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardTitle
      className={cn(
        "text-section-title text-2xl font-medium text-foreground",
        className
      )}
    >
      {children}
    </CardTitle>
  );
}

function SystemCardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardDescription
      className={cn(
        "text-body text-muted-foreground",
        className
      )}
    >
      {children}
    </CardDescription>
  );
}

function SystemCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContent className={cn("pt-0", className)}>
      {children}
    </CardContent>
  );
}

function SystemCardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardFooter className={cn("pt-4", className)}>
      {children}
    </CardFooter>
  );
}

export {
  SystemCard,
  SystemCardHeader,
  SystemCardTitle,
  SystemCardDescription,
  SystemCardContent,
  SystemCardFooter,
};
