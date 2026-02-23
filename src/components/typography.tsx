import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Page Title Component
 * 24px / 600 weight / 1.2-1.3 line height
 * Used for main page titles (e.g., "Dashboard")
 */
interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

export function PageTitle({
  className,
  as: Component = "h1",
  ...props
}: PageTitleProps) {
  return (
    <Component
      className={cn(
        "text-page-title",
        className
      )}
      {...props}
    />
  );
}

/**
 * Balance Value Component
 * 22px / 600 weight / 1.2-1.3 line height
 * Used for main numeric values (balances, amounts)
 */
interface BalanceValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "div" | "p";
}

export function BalanceValue({
  className,
  as: Component = "span",
  ...props
}: BalanceValueProps) {
  return (
    <Component
      className={cn(
        "text-balance",
        className
      )}
      {...props}
    />
  );
}

/**
 * Section Title / Card Title Component
 * 16px / 500 weight / 1.2-1.3 line height
 * Used for section titles and card titles
 */
interface SectionTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

export function SectionTitle({
  className,
  as: Component = "h2",
  ...props
}: SectionTitleProps) {
  return (
    <Component
      className={cn(
        "text-section-title",
        className
      )}
      {...props}
    />
  );
}

/**
 * Body Text Component
 * 14px / 400 weight / 1.45-1.5 line height
 * Used for labels and body text
 */
interface BodyTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: "p" | "span" | "div" | "label";
}

export function BodyText({
  className,
  as: Component = "p",
  ...props
}: BodyTextProps) {
  return (
    <Component
      className={cn(
        "text-body",
        className
      )}
      {...props}
    />
  );
}

/**
 * Meta Text / Helper Text Component
 * 12px / 400 weight / 1.45-1.5 line height
 * Used for helper text and meta information
 */
interface MetaTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span" | "p" | "div" | "small";
}

export function MetaText({
  className,
  as: Component = "span",
  ...props
}: MetaTextProps) {
  return (
    <Component
      className={cn(
        "text-meta",
        className
      )}
      {...props}
    />
  );
}

/**
 * Label Component
 * 14px / 400 weight / 1.45-1.5 line height
 * Ensures labels are never bold
 */
interface LabelTextProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  as?: "label" | "span" | "div";
}

export function LabelText({
  className,
  as: Component = "label",
  ...props
}: LabelTextProps) {
  return (
    <Component
      className={cn(
        "text-body font-normal",
        className
      )}
      {...props}
    />
  );
}

