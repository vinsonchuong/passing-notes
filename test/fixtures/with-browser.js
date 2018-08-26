/* @flow */
import { openChrome, closeBrowser } from 'puppet-strings'
import { defineFixture } from 'passing-notes/test/helpers'

export const setup = openChrome
export const teardown = closeBrowser

export default defineFixture({ setup, teardown })
