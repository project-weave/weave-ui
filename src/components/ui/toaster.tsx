"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Toast, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { dismiss, toasts } = useToast();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  // switching pages clears any toasts from the previous page (unless they asked to stay)
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    toasts.filter((t) => !t.keepOnPageChange).forEach((t) => dismiss(t.id));
    // only react to page changes, not to toasts being added
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <ToastProvider swipeDirection="right">
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {toasts.map(function ({ action, description, id, keepOnPageChange, placement, title, variant, ...props }) {
        return (
          <Toast
            key={id}
            onPointerDown={(e) => e.preventDefault()}
            onPointerMove={(e) => e.preventDefault()}
            {...props}
            // timing is handled in use-toast so hovering can't keep a toast open
            duration={Infinity}
            variant={variant}
          >
            <div className="min-w-0 truncate text-sm text-black">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
          </Toast>
        );
      })}
      <ToastViewport placement={toasts[0]?.placement ?? "bottom"} />
    </ToastProvider>
  );
}
