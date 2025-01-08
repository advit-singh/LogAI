import * as React from 'react';
    import * as CollapsePrimitive from '@radix-ui/react-collapsible';
    import { ChevronDownIcon } from '@radix-ui/react-icons';
    
    import { cn } from '@/lib/utils';
    
    const Collapse = CollapsePrimitive.Root;
    
    const CollapseItem = React.forwardRef<
      React.ElementRef<typeof CollapsePrimitive.Item>,
      React.ComponentPropsWithoutRef<typeof CollapsePrimitive.Item>
    >(({ className, ...props }, ref) => (
      <CollapsePrimitive.Item
        ref={ref}
        className={cn('border-b', className)}
        {...props}
      />
    ));
    CollapseItem.displayName = 'CollapseItem';
    
    const CollapseTrigger = React.forwardRef<
      React.ElementRef<typeof CollapsePrimitive.Trigger>,
      React.ComponentPropsWithoutRef<typeof CollapsePrimitive.Trigger>
    >(({ className, children, ...props }, ref) => (
      <CollapsePrimitive.Trigger
        ref={ref}
        className={cn(
          'flex w-full items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </CollapsePrimitive.Trigger>
    ));
    CollapseTrigger.displayName = CollapsePrimitive.Trigger.displayName;
    
    const CollapseContent = React.forwardRef<
      React.ElementRef<typeof CollapsePrimitive.Content>,
      React.ComponentPropsWithoutRef<typeof CollapsePrimitive.Content>
    >(({ className, children, ...props }, ref) => (
      <CollapsePrimitive.Content
        ref={ref}
        className="overflow-hidden text-sm data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down"
        {...props}
      >
        <div className={cn('pb-4 pt-0', className)}>{children}</div>
      </CollapsePrimitive.Content>
    ));
    CollapseContent.displayName = CollapsePrimitive.Content.displayName;
    
    export { Collapse, CollapseItem, CollapseTrigger, CollapseContent };
