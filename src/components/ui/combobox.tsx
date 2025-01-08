import * as React from 'react';
    import * as ComboboxPrimitive from '@radix-ui/react-combobox';
    import {
      MagnifyingGlassIcon,
      CheckIcon,
      ChevronDownIcon,
      ChevronUpIcon,
    } from '@radix-ui/react-icons';
    
    import { cn } from '@/lib/utils';
    
    const Combobox = ComboboxPrimitive.Root;
    
    const ComboboxInput = React.forwardRef<
      React.ElementRef<typeof ComboboxPrimitive.Input>,
      React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
    >(({ className, ...props }, ref) => (
      <ComboboxPrimitive.Input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
          className
        )}
        {...props}
      />
    ));
    ComboboxInput.displayName = ComboboxPrimitive.Input.displayName;
    
    const ComboboxLabel = React.forwardRef<
      React.ElementRef<typeof ComboboxPrimitive.Label>,
      React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Label>
    >(({ className, ...props }, ref) => (
      <ComboboxPrimitive.Label
        ref={ref}
        className={cn('text-sm font-medium leading-none', className)}
        {...props}
      />
    ));
    ComboboxLabel.displayName = ComboboxPrimitive.Label.displayName;
    
    const ComboboxViewport = React.forwardRef<
      React.ElementRef<typeof ComboboxPrimitive.Viewport>,
      React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Viewport>
    >(({ className, children, ...props }, ref) => (
      <ComboboxPrimitive.Viewport
        ref={ref}
        className={cn(
          'max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </ComboboxPrimitive.Viewport>
    ));
    ComboboxViewport.displayName = ComboboxPrimitive.Viewport.displayName;
    
    const ComboboxItem = React.forwardRef<
      React.ElementRef<typeof ComboboxPrimitive.Item>,
      React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item>
    >(({ className, children, ...props }, ref) => (
      <ComboboxPrimitive.Item
        ref={ref}
        className={cn(
          'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          className
        )}
        {...props}
      >
        {children}
        <ComboboxPrimitive.ItemIndicator className="ml-auto">
          <CheckIcon className="h-4 w-4" />
        </ComboboxPrimitive.ItemIndicator>
      </ComboboxPrimitive.Item>
    ));
    ComboboxItem.displayName = ComboboxPrimitive.Item.displayName;
    
    const ComboboxList = React.forwardRef<
      React.ElementRef<typeof ComboboxPrimitive.List>,
      React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.List>
    >(({ className, ...props }, ref) => (
      <ComboboxPrimitive.List
        ref={ref}
        className={cn(
          'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    ));
    ComboboxList.displayName = ComboboxPrimitive.List.displayName;
    
    export {
      Combobox,
      ComboboxInput,
      ComboboxLabel,
      ComboboxViewport,
      ComboboxItem,
      ComboboxList,
    };
