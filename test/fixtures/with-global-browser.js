/* @flow */
import type { TestInterface } from 'ava'
import { openChrome, closeBrowser } from 'puppet-strings'

export default function<Context>(
  test: TestInterface<Context>
): TestInterface<Context> {
  test.before(async t => {
    global.browser = await openChrome()
  })

  test.after.always(async t => {
    await closeBrowser(global.browser)
  })

  return test
}
