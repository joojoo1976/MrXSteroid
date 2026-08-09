'use client';

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "toast !bg-zinc-950 !text-zinc-100 !border-zinc-800 shadow-2xl rounded-2xl",
          description: "!text-zinc-400",
          actionButton: "!bg-gold-500 !text-black font-bold",
          cancelButton: "!bg-zinc-800 !text-zinc-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
