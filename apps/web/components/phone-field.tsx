"use client";

import { useEffect, useMemo, useRef, useState, type FocusEventHandler, type Ref } from "react";
import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";
import { cn } from "@/lib/utils";

const defaultCountry: CountryCode = "BW";
const preferredCountries: CountryCode[] = ["BW", "ZA", "ZW", "NA", "ZM", "LS", "SZ"];

const countryOptions = getCountries()
  .map((country) => ({ country, callingCode: getCountryCallingCode(country) }))
  .sort((left, right) => {
    const leftIndex = preferredCountries.indexOf(left.country);
    const rightIndex = preferredCountries.indexOf(right.country);
    if (leftIndex >= 0 || rightIndex >= 0) {
      if (leftIndex < 0) return 1;
      if (rightIndex < 0) return -1;
      return leftIndex - rightIndex;
    }
    return left.country.localeCompare(right.country);
  });

function countryFromValue(value?: string) {
  return parsePhoneNumberFromString(value ?? "")?.country;
}

function nationalDigits(value: string | undefined, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(value ?? "");
  if (parsed?.country) return parsed.formatNational().replace(/\D/g, "");
  const digits = (value ?? "").replace(/\D/g, "");
  const callingCode = getCountryCallingCode(country);
  return digits.startsWith(callingCode) ? digits.slice(callingCode.length) : digits;
}

function internationalValue(localValue: string, country: CountryCode) {
  if (!localValue) return "";
  const parsed = parsePhoneNumberFromString(localValue, country);
  if (parsed) return parsed.number;
  const digits = localValue.replace(/\D/g, "").replace(/^0/, "");
  return digits ? `+${getCountryCallingCode(country)}${digits}` : "";
}

function formatLocal(value: string, country: CountryCode) {
  return new AsYouType(country).input(value);
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
  placeholder = "Phone number",
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
  const initialValue = value ?? defaultValue;
  const initialCountry = countryFromValue(initialValue) ?? defaultCountry;
  const [country, setCountry] = useState<CountryCode>(initialCountry);
  const [localValue, setLocalValue] = useState(() => nationalDigits(initialValue, initialCountry));
  const lastEmittedValue = useRef<string | undefined>(undefined);
  const fullValue = useMemo(() => internationalValue(localValue, country), [country, localValue]);

  useEffect(() => {
    if (value === undefined || value === lastEmittedValue.current) return;
    const nextCountry = countryFromValue(value) ?? country;
    setCountry(nextCountry);
    setLocalValue(nationalDigits(value, nextCountry));
  }, [country, value]);

  const emitValue = (nextLocal: string, nextCountry: CountryCode) => {
    const nextValue = internationalValue(nextLocal, nextCountry);
    lastEmittedValue.current = nextValue;
    onValueChange?.(nextValue);
  };

  const changeCountry = (nextCountry: CountryCode) => {
    setCountry(nextCountry);
    emitValue(localValue, nextCountry);
  };

  const changeNumber = (nextValue: string) => {
    const nextLocal = nextValue.replace(/\D/g, "").slice(0, 15);
    setLocalValue(nextLocal);
    emitValue(nextLocal, country);
  };

  return (
    <div className={cn("flex h-11 w-full overflow-hidden rounded-xl border border-black/15 bg-white text-sm text-ink transition focus-within:border-brand focus-within:ring-4 focus-within:ring-blue-100 dark:border-white/20 dark:bg-[#0b1524] dark:text-white dark:focus-within:ring-blue-950/50", disabled && "bg-slate-100 opacity-70 dark:bg-white/5", className)}>
      <select
        aria-label="Country calling code"
        className="w-[116px] shrink-0 cursor-pointer border-r border-black/10 bg-slate-50 px-2 text-xs font-medium text-slate-600 outline-none dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
        disabled={disabled}
        onChange={(event) => changeCountry(event.target.value as CountryCode)}
        title="Select country calling code"
        value={country}
      >
        {countryOptions.map((option) => (
          <option key={option.country} value={option.country}>
            {option.country} +{option.callingCode}
          </option>
        ))}
      </select>
      <input
        aria-invalid={ariaInvalid || undefined}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent px-3 text-sm text-inherit outline-none placeholder:text-slate-400"
        disabled={disabled}
        id={id}
        inputMode="tel"
        maxLength={20}
        onBlur={onBlur}
        onChange={(event) => changeNumber(event.target.value)}
        placeholder={placeholder}
        ref={inputRef}
        required={required}
        type="tel"
        value={formatLocal(localValue, country)}
      />
      {name && <input name={name} readOnly type="hidden" value={fullValue} />}
    </div>
  );
}
