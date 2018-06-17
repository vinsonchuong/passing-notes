/* @flow */
import type { LogLine } from 'passing-notes/lib/log'

export default function({ labels, messages }: LogLine): string {
  const prefix = labels.map(label => `[${label}]`).join(' ')
  return [prefix, ...messages].join(' › ')
}
