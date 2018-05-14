/* @flow */
import { openBrowser, closeBrowser } from 'puppet-strings'
import { defineFixture } from 'passing-notes/test/helpers'

export default defineFixture({
  setup: openBrowser,
  teardown: closeBrowser
})
