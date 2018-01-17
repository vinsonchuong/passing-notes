/* @flow */
import test from 'ava'
import greeting from 'passing-notes'

test('is the correct string', t => {
  t.is(greeting, 'Hello World!')
})
