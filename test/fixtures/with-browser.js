/* @flow */
import { openBrowser, closeBrowser } from 'puppet-strings'
import { defineFixture } from 'passing-notes/test/helpers'

export const setup = openBrowser
export const teardown = closeBrowser

export default defineFixture({ setup, teardown })
