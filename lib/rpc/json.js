/* @flow */

export type Json =
  | null
  | boolean
  | number
  | string
  | { [string]: Json }
  | Array<Json>
