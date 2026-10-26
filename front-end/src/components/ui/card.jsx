import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('tw-rounded-lg tw-border tw-bg-card tw-text-card-foreground tw-shadow-sm', className)} {...props} />
));
Card.displayName = 'Card';
export const CardHeader = ({ className, ...props }) => <div className={cn('tw-flex tw-flex-col tw-space-y-1.5 tw-p-6', className)} {...props} />;
export const CardTitle = ({ className, ...props }) => <h3 className={cn('tw-text-2xl tw-font-semibold tw-leading-none tw-tracking-tight', className)} {...props} />;
export const CardDescription = ({ className, ...props }) => <p className={cn('tw-text-sm tw-text-muted-foreground tw-m-0', className)} {...props} />;
export const CardContent = ({ className, ...props }) => <div className={cn('tw-p-6 tw-pt-0', className)} {...props} />;
