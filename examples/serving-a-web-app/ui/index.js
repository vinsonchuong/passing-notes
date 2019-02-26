/* @flow */
import typeof * as Actions from '../domain'
import * as React from 'react'
import { render } from 'react-dom'
import { makeRpcClient } from 'passing-notes'

const rpc = makeRpcClient<Actions>(`${document.location.origin}/rpc`)

async function run() {
  render(<div>Loading</div>, window.root)

  const things = await rpc.getThings()
  render(
    <div>
      {things.map(thing => (
        <div key={thing}>{thing}</div>
      ))}
    </div>,
    window.root
  )
}
run()
