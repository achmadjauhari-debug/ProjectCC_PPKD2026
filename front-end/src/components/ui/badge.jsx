import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'tw-inline-flex tw-items-center tw-gap-1 tw-rounded-full tw-border tw-px-2.5 tw-py-0.5 tw-text-xs tw-font-semibold tw-transition-colors',
  {
    variants: {
      variant: {
        default: 'tw-border-transparent tw-bg-primary tw-text-primary-foreground',
        secondary: 'tw-border-transparent tw-bg-secondary tw-text-secondary-foreground',
        destructive: 'tw-border-destructive tw-text-destructive',
        outline: 'tw-text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export const Badge = ({ className, variant, ...props }) => <span className={cn(badgeVariants({ variant }), className)} {...props} />;
