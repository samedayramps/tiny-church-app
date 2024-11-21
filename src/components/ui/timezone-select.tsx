"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  const timezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    // Add more timezones as needed
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {timezones.map((timezone) => (
          <SelectItem key={timezone} value={timezone}>
            {timezone}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 