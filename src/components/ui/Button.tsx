import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps } from "motion/react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-sm": variant === "primary",
            "bg-blue-100 text-blue-900 hover:bg-blue-200": variant === "secondary",
            "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-900": variant === "outline",
            "bg-transparent hover:bg-gray-100 text-gray-700": variant === "ghost",
            "bg-red-100 text-red-900 hover:bg-red-200": variant === "danger",
            "h-9 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
