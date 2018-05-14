/* @flow */
import test from 'ava'

type FixtureDefinition<Fixture> = {
  setup: () => Promise<Fixture>,
  teardown: Fixture => Promise<void>
}

type AttachFixtureOptions = {
  perTest: boolean,
  key: string
}

type AttachFixture = AttachFixtureOptions => void

export default function<Fixture>({
  setup,
  teardown
}: FixtureDefinition<Fixture>): AttachFixture {
  return ({ perTest, key }) => {
    if (perTest) {
      test.beforeEach(async t => {
        const value = await setup()
        Object.assign(t.context, { [key]: value })
      })

      test.afterEach.always(async t => {
        const { [key]: value } = t.context
        await teardown(value)
      })
    } else {
      test.before(async () => {
        const value = await setup()
        Object.assign(global, { [key]: value })
      })

      test.after.always(async () => {
        const { [key]: value } = global
        await teardown(value)
      })
    }
  }
}
