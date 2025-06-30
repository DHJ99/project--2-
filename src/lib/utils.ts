import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }) as T
}

export function getRandomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online':
    case 'operational':
    case 'active':
      return 'text-secondary-500'
    case 'warning':
    case 'maintenance':
      return 'text-accent-500'
    case 'offline':
    case 'error':
    case 'critical':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'online':
    case 'operational':
    case 'active':
      return 'bg-secondary-100 dark:bg-secondary-900/30'
    case 'warning':
    case 'maintenance':
      return 'bg-accent-100 dark:bg-accent-900/30'
    case 'offline':
    case 'error':
    case 'critical':
      return 'bg-red-100 dark:bg-red-900/30'
    default:
      return 'bg-gray-100 dark:bg-gray-900/30'
  }
}