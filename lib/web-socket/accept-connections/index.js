/* @flow */
import type { HttpUpgradeHandler as NodeHttpUpgradeHandler } from 'passing-notes/lib/node'
import WebSocket from 'ws'
import pEvent from 'p-event'

type Socket = AsyncIterator<string> & {
  send: string => Promise<void>,
  close: () => Promise<void>
}

export default function(
  accept: Socket => void | Promise<void>
): NodeHttpUpgradeHandler {
  const webSocketServer = new WebSocket.Server({ noServer: true })
  webSocketServer.on('connection', webSocket => {
    const iterator = pEvent.iterator(webSocket, 'message', {
      resolutionEvents: ['close'],
      rejectionEvents: ['error']
    })

    accept({
      ...iterator,
      send: message => new Promise(resolve => webSocket.send(message, resolve)),
      close: async () => {
        webSocket.close(1000)
        await pEvent(webSocket, 'close')
      }
    })
  })

  return (request, socket, head) => {
    webSocketServer.handleUpgrade(request, socket, head, webSocket => {
      webSocketServer.emit('connection', webSocket, request)
    })
  }
}
