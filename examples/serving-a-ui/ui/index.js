/* @flow */
import * as React from 'react'
import { render } from 'react-dom'
import { sendRpc } from '../api'

async function run() {
  render(<div>Loading</div>, window.root)

  const response = await sendRpc({ action: 'getThings', params: {} })
  render(
    <div>{response.result.map(thing => <div key={thing}>{thing}</div>)}</div>,
    window.root
  )
}
run()
