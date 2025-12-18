import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number to Vietnamese Dong (VND) currency format
 * @param value - The numeric value to format
 * @param includeSymbol - Whether to include the ₫ symbol (default: true)
 * @returns Formatted VND string (e.g., "1.000.000₫" or "1.000.000")
 */
export function formatVND(value: number, includeSymbol: boolean = true): string {
  const formatted = value.toLocaleString('vi-VN');
  return includeSymbol ? `${formatted}₫` : formatted;
}
