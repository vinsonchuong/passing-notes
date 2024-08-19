import {pEvent} from 'p-event'

export default async function stopServer(server) {
  server.close()
  await pEvent(server, 'close')
}
