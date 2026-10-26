import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva } from "class-variance-authority";
import { cn } from "cn"

const buttonVariants = cva(
  "tw-group/button tw-inline-flex tw-shrink-0 tw-items-center tw-justify-center tw-rounded-lg tw-border tw-border-transparent tw-bg-clip-padding tw-text-sm tw-font-medium tw-whitespace-nowrap tw-transition-all tw-outline-none tw-select-none focus-visible:tw-border-ring focus-visible:tw-ring-3 focus-visible:tw-ring-ring/50 active:not-aria-[haspopup]:tw-translate-y-px disabled:tw-pointer-events-none disabled:tw-opacity-50 aria-invalid:tw-border-destructive aria-invalid:tw-ring-3 aria-invalid:tw-ring-destructive/20 dark:aria-invalid:tw-border-destructive/50 dark:aria-invalid:tw-ring-destructive/40 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*=size-])]:tw-size-4",
  {
    variants: {
      variant: {
        default: "tw-bg-primary tw-text-primary-foreground hover:tw-bg-primary/80",
        outline:
          "tw-border-border tw-bg-background hover:tw-bg-muted hover:tw-text-foreground aria-expanded:tw-bg-muted aria-expanded:tw-text-foreground dark:tw-border-input dark:tw-bg-input/30 dark:hover:tw-bg-input/50",
        secondary:
          "tw-bg-secondary tw-text-secondary-foreground hover:tw-bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:tw-bg-secondary aria-expanded:tw-text-secondary-foreground",
        ghost:
          "hover:tw-bg-muted hover:tw-text-foreground aria-expanded:tw-bg-muted aria-expanded:tw-text-foreground dark:hover:tw-bg-muted/50",
        destructive:
          "tw-bg-destructive/10 tw-text-destructive hover:tw-bg-destructive/20 focus-visible:tw-border-destructive/40 focus-visible:tw-ring-destructive/20 dark:tw-bg-destructive/20 dark:hover:tw-bg-destructive/30 dark:focus-visible:tw-ring-destructive/40",
        link: "tw-text-primary tw-underline-offset-4 hover:tw-underline",
      },
      size: {
        default:
          "tw-h-8 tw-gap-1.5 tw-px-2.5 has-data-[icon=inline-end]:tw-pr-2 has-data-[icon=inline-start]:tw-pl-2",
        xs: "tw-h-6 tw-gap-1 tw-rounded-[min(var(--radius-md),10px)] tw-px-2 tw-text-xs in-data-[slot=button-group]:tw-rounded-lg has-data-[icon=inline-end]:tw-pr-1.5 has-data-[icon=inline-start]:tw-pl-1.5 [&_svg:not([class*=size-])]:tw-size-3",
        sm: "tw-h-7 tw-gap-1 tw-rounded-[min(var(--radius-md),12px)] tw-px-2.5 tw-text-[0.8rem] in-data-[slot=button-group]:tw-rounded-lg has-data-[icon=inline-end]:tw-pr-1.5 has-data-[icon=inline-start]:tw-pl-1.5 [&_svg:not([class*=size-])]:tw-size-3.5",
        lg: "tw-h-9 tw-gap-1.5 tw-px-2.5 has-data-[icon=inline-end]:tw-pr-2 has-data-[icon=inline-start]:tw-pl-2",
        icon: "tw-size-8",
        "icon-xs":
          "tw-size-6 tw-rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:tw-rounded-lg [&_svg:not([class*=size-])]:tw-size-3",
        "icon-sm":
          "tw-size-7 tw-rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:tw-rounded-lg",
        "icon-lg": "tw-size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
