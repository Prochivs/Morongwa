"use client";

import { useState, type FocusEventHandler, type Ref } from "react";
import { cn } from "@/lib/utils";

const countryCode = "+267";

function localDigits(value = "") {
  const digits = value.replace(/\D/g, "");
  return (digits.startsWith("267") ? digits.slice(3) : digits).slice(0, 8);
}

function formatLocal(value: string) {
  return [value.slice(0, 2), value.slice(2, 5), value.slice(5, 8)].filter(Boolean).join(" ");
}

export function PhoneField({
  id,
  name,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  inputRef,
  required,
  disabled,
  autoComplete = "tel-national",
  className,
  placeholder = "71 123 456",
  ariaInvalid,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  inputRef?: Ref<HTMLInputElement>;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  placeholder?: string;
  ariaInvalid?: boolean;
}) {
  const [internalValue, setInternalValue] = useState(() => localDigits(defaultValue));
  const localValue = value === undefined ? internalValue : localDigits(value);
  const fullValue = localValue ? `${countryCode}${localValue}` : "";

  const updateValue = (nextValue: string) => {
    const nextLocal = localDigits(nextValue);
    if (value === undefined) setInternalValue(nextLocal);
    onValueChange?.(nextLocal ? `${countryCode}${nextLocal}` : "");
  };

  return (
    <div className={cn("flex h-11 w-full overflow-hidden rounded-xl border border-black/15 bg-white text-sm text-ink transition focus-within:border-brand focus-within:ring-4 focus-within:ring-blue-100 dark:border-white/20 dark:bg-[#0b1524] dark:text-white dark:focus-within:ring-blue-950/50", disabled && "bg-slate-100 opacity-70 dark:bg-white/5", className)}>
      <span className="flex shrink-0 items-center border-r border-black/10 bg-slate-50 px-3 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300" title="Botswana country code">
        BW&nbsp;&nbsp;{countryCode}
      </span>
      <input
        aria-invalid={ariaInvalid || undefined}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-inherit outline-none placeholder:text-slate-400"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        maxLength={10}
        onBlur={onBlur}
        onChange={(event) => updateValue(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        required={required}
        type="tel"
        value={formatLocal(localValue)}
      />
      {name && <input name={name} readOnly type="hidden" value={fullValue} />}
    </div>
  );
}
