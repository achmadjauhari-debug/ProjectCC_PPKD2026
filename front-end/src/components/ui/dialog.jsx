import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTitle = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('tw-text-lg tw-font-semibold tw-leading-none tw-tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';
export const DialogDescription = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('tw-text-sm tw-text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogOverlay = forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('tw-fixed tw-inset-0 tw-z-[1100] tw-bg-black/60 data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0', className)}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

export const CloseButton = () => (
  <DialogPrimitive.Close className="tw-absolute tw-right-4 tw-top-4 tw-rounded-sm tw-opacity-70 tw-transition-opacity hover:tw-opacity-100 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-ring">
    <X className="tw-size-4" />
    <span className="visually-hidden">Tutup</span>
  </DialogPrimitive.Close>
);

export const DialogContent = forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'tw-fixed tw-left-1/2 tw-top-1/2 tw-z-[1100] tw-grid tw-w-full tw-max-w-lg -tw-translate-x-1/2 -tw-translate-y-1/2 tw-gap-4 tw-border tw-bg-background tw-p-6 tw-shadow-lg tw-duration-200 data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 sm:tw-rounded-lg tw-max-h-[92vh] tw-overflow-y-auto',
        className
      )}
      {...props}
    >
      {children}
      <CloseButton />
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';
