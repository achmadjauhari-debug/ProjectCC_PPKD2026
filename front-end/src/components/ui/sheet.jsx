import { forwardRef } from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { DialogOverlay, CloseButton } from './dialog';

export const Sheet = SheetPrimitive.Root;
export const SheetTitle = forwardRef(({ className, ...props }, ref) => (
  <SheetPrimitive.Title ref={ref} className={cn('tw-text-2xl tw-font-semibold tw-tracking-tight tw-pr-8', className)} {...props} />
));
SheetTitle.displayName = 'SheetTitle';

// Panel geser dari kanan (varian Dialog, seperti komponen Sheet pada shadcn).
export const SheetContent = forwardRef(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <DialogOverlay />
    <SheetPrimitive.Content
      ref={ref}
      aria-describedby={undefined}
      className={cn(
        'tw-fixed tw-inset-y-0 tw-right-0 tw-z-[1100] tw-h-full tw-w-full tw-max-w-xl tw-overflow-y-auto tw-border-l tw-bg-background tw-p-6 tw-shadow-lg tw-ease-in-out data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-duration-300 data-[state=open]:tw-duration-500 data-[state=closed]:tw-slide-out-to-right data-[state=open]:tw-slide-in-from-right',
        className
      )}
      {...props}
    >
      {children}
      <CloseButton />
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';
