export function addMinutes(baseDate: Date, minutes: number): Date {
  return new Date(baseDate.getTime() + minutes * 60_000);
}

export function addHours(baseDate: Date, hours: number): Date {
  return new Date(baseDate.getTime() + hours * 3_600_000);
}
