"use client";

import { useId, useState, useCallback } from "react";
import { EyeIcon, EyeOffIcon, CopyIcon, CheckIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";

export default function SecretInput({
  label,
  placeholder,
  value,
  delay = 3000,
}: {
  label: string;
  placeholder: string;
  value: string;
  delay?: number;
}) {
  const id = useId();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const handleCopy = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      if (isCopied || !value) return;

      navigator.clipboard
        .writeText(value)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), delay);
        })
        .catch((error) => {
          console.error("Error copying secret", error);
        });
    },
    [isCopied, value, delay],
  );

  return (
    <div className="*:not-first:mt-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          className="pe-20"
          placeholder={placeholder}
          type={isVisible ? "text" : "password"}
          value={value}
          readOnly
        />
        <div className="absolute inset-y-0 end-0 flex">
          <button
            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide secret" : "Show secret"}
            aria-pressed={isVisible}
            aria-controls={id}
          >
            {isVisible ? (
              <EyeOffIcon size={16} aria-hidden="true" />
            ) : (
              <EyeIcon size={16} aria-hidden="true" />
            )}
          </button>
          <motion.button
            className={cn(
              "text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50",
              "flex h-full w-9 items-center justify-center transition-[color,box-shadow] outline-none",
              "focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            )}
            type="button"
            onClick={handleCopy}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isCopied ? "Copied!" : "Copy secret"}
            disabled={!value}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isCopied ? "check" : "copy"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.15 }}
              >
                {isCopied ? (
                  <CheckIcon size={16} aria-hidden="true" />
                ) : (
                  <CopyIcon size={16} aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
