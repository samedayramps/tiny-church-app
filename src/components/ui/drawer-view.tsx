"use client";

import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface DrawerViewProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  trigger?: React.ReactNode;
}

export function DrawerView({ 
  open, 
  onOpenChange, 
  children,
  className,
  trigger
}: DrawerViewProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn(
        "fixed inset-x-0 bottom-0 flex h-[90vh] flex-col rounded-t-[10px] border bg-background",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        "duration-300 ease-in-out"
      )}>
        <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-muted/60" />
        <div className="scrollbar-none flex-1 overflow-y-auto overscroll-contain px-4">
          <div className={cn("pb-8", className)}>
            {children}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 