import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const field =
  'tw-w-full tw-rounded-md tw-border tw-border-input tw-bg-background tw-px-3 tw-py-2 tw-text-sm tw-ring-offset-background placeholder:tw-text-muted-foreground focus-visible:tw-outline-none focus-visible:tw-ring-2 focus-visible:tw-ring-ring focus-visible:tw-ring-offset-2 disabled:tw-cursor-not-allowed disabled:tw-opacity-50';

export const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input ref={ref} type={type} className={cn('tw-flex tw-h-10', field, className)} {...props} />
));
Input.displayName = 'Input';

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('tw-flex tw-min-h-[80px]', field, className)} {...props} />
));
Textarea.displayName = 'Textarea';
