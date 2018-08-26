/* @flow */
import * as React from 'react'
import { render } from 'react-dom'
import { api } from '../api'

async function run() {
  render(<div>Loading</div>, window.root)

  const things = await api.getThings()
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
