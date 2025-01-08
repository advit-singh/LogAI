import * as React from 'react';
    import { ChevronRightIcon } from '@radix-ui/react-icons';
    import {
      Sheet,
      SheetContent,
      SheetTrigger,
      SheetClose,
    } from '@/components/ui/sheet';
    import { cn } from '@/lib/utils';
    
    const Sidebar = React.forwardRef<
      React.ElementRef<typeof Sheet>,
      React.ComponentPropsWithoutRef<typeof Sheet>
    >(({ className, children, ...props }, ref) => (
      <Sheet ref={ref} className={cn('fixed inset-0 z-50', className)} {...props}>
        <SheetContent className="flex flex-col w-[300px]">
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <ChevronRightIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
          {children}
        </SheetContent>
      </Sheet>
    ));
    Sidebar.displayName = 'Sidebar';
    
    const SidebarTrigger = SheetTrigger;
    
    export { Sidebar, SidebarTrigger };
