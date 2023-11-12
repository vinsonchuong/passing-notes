export {default as getHeader} from './http/get-header/index.js'
export * from './middleware/index.js'

export async function sendRequest({method, headers = {}, url, body}) {
  const response = await fetch(url, {method, headers, body})

  const responseHeaders = {}
  // eslint-disable-next-line unicorn/no-array-for-each
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    status: response.status,
    headers: responseHeaders,
    body: await parseBody(response),
  }
}

function parseBody(response) {
  const contentType = response.headers.get('content-type') || ''

  if (
    contentType.includes('json') ||
    (contentType.includes('text') &&
      !contentType.includes('text/event-stream')) ||
    contentType.includes('xml')
  ) {
    return response.text()
  }

  return response.body
}
