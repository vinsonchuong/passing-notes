/* @flow */
import * as React from 'react'
import { render } from 'react-dom'
import { sendRpc } from 'passing-notes'

async function run() {
  render(<div>Loading</div>, window.root)

  const response = await sendRpc({ action: 'getItems', params: [] })

  if (
    typeof response.result === 'object' &&
    Array.isArray(response.result) &&
    response.result.every(Boolean)
  ) {
    render(
      <div>
        {response.result.map(item => (
          <div key={String(item)}>{String(item)}</div>
        ))}
      </div>,
      window.root
    )
  }
}
run()
