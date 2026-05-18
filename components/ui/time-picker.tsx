"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TimePickerProps {
  value: string
  onChange: (value: string) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const hours24 = value ? parseInt(value.split(":")[0] ?? "12") : 12
  const minutes = value ? parseInt(value.split(":")[1] ?? "0") : 0

  const period = hours24 >= 12 ? "PM" : "AM"
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24

  function handleHourChange(h: string | null) {
    if (!h) return;
    const h12 = parseInt(h)
    const h24 =
      period === "PM"
        ? h12 === 12
          ? 12
          : h12 + 12
        : h12 === 12
          ? 0
          : h12
    onChange(`${h24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
  }

  function handleMinuteChange(m: string | null) {
    if (!m) return;
    const min = parseInt(m)
    onChange(`${hours24.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
  }

  function handlePeriodChange(p: string | null) {
    if (!p) return;
    const h24 =
      p === "PM"
        ? hours12 === 12
          ? 12
          : hours12 + 12
        : hours12 === 12
          ? 0
          : hours12
    onChange(`${h24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`)
  }

  return (
    <div className="flex items-center gap-1">
      <Select value={hours12.toString()} onValueChange={handleHourChange}>
        <SelectTrigger size="sm" className="w-[64px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <SelectItem key={h} value={h.toString()}>
              {h.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-sm font-medium text-muted-foreground">:</span>

      <Select value={minutes.toString()} onValueChange={handleMinuteChange}>
        <SelectTrigger size="sm" className="w-[64px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
            <SelectItem key={m} value={m.toString()}>
              {m.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger size="sm" className="w-[68px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
