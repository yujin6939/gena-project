import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#f1d3ec] text-[#741b53] hover:bg-[#ecc6e3]",
        outline: "border border-input bg-white text-black hover:bg-gray-100",
        ghost: "bg-transparent hover:bg-muted",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        secondary: "bg-gray-100 text-black hover:bg-gray-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 rounded-md",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default", // 이게 기본값이므로 자동으로 적용됨
      size: "default",
    },
  }
);


export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
