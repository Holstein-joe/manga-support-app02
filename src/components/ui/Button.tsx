import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "outline"
    size?: "default" | "sm" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", size = "default", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300"

        const variants = {
            default: "bg-primary text-white shadow hover:bg-primary/90 dark:bg-primary dark:text-white dark:hover:bg-primary/90",
            ghost: "hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10 dark:hover:text-primary",
            outline: "border border-primary/20 bg-transparent shadow-sm hover:bg-primary/5 hover:text-primary dark:border-primary/30 dark:hover:bg-primary/10 dark:hover:text-primary"
        }

        const sizes = {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8"
        }

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

        return (
            <button
                className={classes}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
