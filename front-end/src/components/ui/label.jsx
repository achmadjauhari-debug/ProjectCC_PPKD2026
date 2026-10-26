import { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn('tw-text-sm tw-font-medium tw-leading-none', className)} {...props} />
));
Label.displayName = 'Label';
