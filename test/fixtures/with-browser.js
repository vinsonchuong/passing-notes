/* eslint-disable flowtype/no-weak-types */
/* @flow */
import type { TestInterface } from 'ava'
import type { Browser } from 'puppet-strings'
import { closeBrowser } from 'puppet-strings'
import { openChrome } from 'puppet-strings-chrome'

export default function<Context: {}>(
  test: TestInterface<Context>
): TestInterface<{ ...$Exact<Context>, browser: Browser }> {
  const testWithBrowser: TestInterface<{
    ...$Exact<Context>,
    browser: Browser
  }> = (test: any)

  let browser

  testWithBrowser.before(async () => {
    browser = await openChrome()
  })

  testWithBrowser.after.always(async () => {
    if (browser) {
      await closeBrowser(browser)
    }
  })

  testWithBrowser.beforeEach(t => {
    t.context.browser = browser
  })

  return testWithBrowser
}
