import pEvent from 'p-event'

export default async function (server) {
  server.close()
  await pEvent(server, 'close')
}
