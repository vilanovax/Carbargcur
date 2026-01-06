"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORK_DOMAINS, type WorkDomain } from "@/lib/onboarding";

interface DomainSelectorProps {
  value?: WorkDomain;
  onChange: (domain: WorkDomain) => void;
  error?: string;
  placeholder?: string;
}

/**
 * Work Domain Selector
 * Dropdown for selecting primary work domain in finance/accounting
 */
export default function DomainSelector({
  value,
  onChange,
  error,
  placeholder = "انتخاب حوزه فعالیت",
}: DomainSelectorProps) {
  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={(val) => onChange(val as WorkDomain)}>
        <SelectTrigger
          className={`w-full ${error ? "border-red-500" : ""}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {WORK_DOMAINS.map((domain) => (
            <SelectItem key={domain.value} value={domain.value}>
              {domain.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
