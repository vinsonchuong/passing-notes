/* @flow */
import test from 'ava'

type FixtureDefinition<Params, Fixture> = {
  setup: Params => Promise<Fixture>,
  teardown: Fixture => Promise<void>
}

type AttachFixtureOptions<Params> = Params & {
  perTest: boolean,
  key: string
}

type AttachFixture<Params> = (AttachFixtureOptions<Params>) => void

export default function<Params, Fixture>({
  setup,
  teardown
}: FixtureDefinition<Params, Fixture>): AttachFixture<Params> {
  return ({ perTest, key, ...params }) => {
    if (perTest) {
      test.beforeEach(async t => {
        const value = await setup(params)
        Object.assign(t.context, { [key]: value })
      })

      test.afterEach.always(async t => {
        const { [key]: value } = t.context
        await teardown(value)
      })
    } else {
      test.before(async () => {
        const value = await setup(params)
        Object.assign(global, { [key]: value })
      })

      test.after.always(async () => {
        const { [key]: value } = global
        await teardown(value)
      })
    }
  }
}
