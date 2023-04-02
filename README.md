# passing-notes
![npm](https://img.shields.io/npm/v/passing-notes.svg)
[![CI Status](https://github.com/vinsonchuong/passing-notes/workflows/CI/badge.svg)](https://github.com/vinsonchuong/passing-notes/actions?query=workflow%3ACI)

Build an HTTP server out of composable blocks

## Example
```javascript
// server.mjs
export default function(request) {
  console.log(request)

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: 'Hello World!'
  }
}
```

```sh
yarn pass-notes server.mjs
```

Handle HTTP requests with a function that takes request data and returns
response data. Compose your functions with pre-built functions to quickly
implement complex workflows.

## Installation
Install [passing-notes](https://yarnpkg.com/en/package/passing-notes)
by running

```sh
yarn add passing-notes
```

## Concepts
`passing-notes` provides an interface for building HTTP servers. At its core,
it takes a function that takes in request data and returns response data.

```javascript
// server.mjs

export default function(request) {
// request = {
//  version: '2.0',
//   method: 'GET',
//   url: '/',
//   headers: {},
//   body: ''
// }

  return {
    status: 200,
    headers: {
      'content-type': 'text/plain'
    },
    body: 'Hello World!'
  }
}
```

This code can be run either from the command line:

```sh
yarn pass-notes server.mjs
```

Or from JavaScript:

```javascript
import {startServer} from 'passing-notes'
import handleRequest from './server.mjs'

startServer({port: 8080}, handleRequest)
```

### Middleware
Taking cues from popular tools like Express, we encourage organizing your
request-handling logic into middleware:

```javascript
import {compose} from 'passing-notes'

export default compose(
  (next) => (request) => {
    const response = next(request)
    return {
      ...response,
      headers: {
        ...response.headers,
        'content-type': 'application/json'
      },
      body: JSON.stringify(response.body)
    }
  },
  (next) => (request) => {
    return {
      status: 200,
      headers: {},
      body: {
        message: 'A serializable object'
      }
    }
  },
  () => () => ({ status: 404 })
)
```

Each request is passed from top to bottom until one of the middleware returns a
response. That response then moves up and is ultimately sent to the client. In
this way, each middleware is given a chance to process and modify the request
and response data.

Note that one of the middleware must return a response, otherwise, an `Error` is
thrown and translated into a `500` response.

#### Pre-Built Middleware
We've built and packaged some middleware that handle common use cases:

- [`static`](https://github.com/vinsonchuong/passing-notes-static): Serves
  static files from the file system
- [`ui`](https://github.com/vinsonchuong/passing-notes-ui): Serves application
  code to the browser
- [`rpc`](https://github.com/vinsonchuong/passing-notes-rpc): Simple
  communication between browser and server

### Developer Affordances
When using the `pass-notes` CLI tool, during development (when
`NODE_ENV !== 'production'`), additional features are provided:

#### Hot Reloading
The provided module and its dependencies are watched for changes and re-imported
before each request. Changes to your code automatically take effect without you
needing to restart the process.

The `node_modules` directory, however, is not monitored due to its size.

#### Self-Signed Certificate
HTTPS is automatically supported for `localhost` with a self-signed certificate.
This is needed for browsers to use HTTP/2.0 when making requests to the server.

### Per-Environment Configuration
A common pattern for implementing per-environment configuration is to store that
configuration in a file that is modified per environment. This is useful for
scenarios for which it's not convenient to directly set environment variables.

We support setting environment variables via a `.env.yml` file:

```
FOO: string
BAR:
  - JSON
  - array
BAZ:
  key1: JSON
  key2: object
```

### Logging
By default, the method and URL of each request and the status of the response is
logged to `STDOUT`, alongside a timestamp and how long it took to return the
response.

To log additional information:

```javascript
import {Logger} from 'passing-notes'

export const logger = new Logger()

export default function(request) {
  logger.log({
    level: 'INFO',
    topic: 'App',
    message: 'A user did a thing'
  })

  // ...
}
```

In addition, our `Logger` provides a way to log the runtime for expensive tasks,
like database queries:

```javascript
const finish = logger.measure({
  level: 'INFO',
  topic: 'DB',
  message: 'Starting DB Query'
})

// Perform DB Query

finish({
  message: 'Finished'
})
```

The logger can be passed to any middleware that needs it as an argument.

## API

### `pass-notes server.js`
A CLI that takes an ES module that exports an HTTP request handler and uses it
to start an HTTP server.

```javascript
// server.mjs
export default function(request) {
  console.log(request)

  return {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    },
    body: 'Hello World!'
  }
}
```

```sh
yarn pass-notes server.mjs
```

#### Request Handler
The ES module's default export must be a function that takes as argument an
object with the following keys:

- `version`: The HTTP version used, either `'1.1'` or `'2.0'`
- `method`: An HTTP request method in capital letters (e.g. `GET` or `POST`)
- `url`: The absolute URL or path to a resource
- `headers`: An object mapping case-insensitive HTTP header names to values
- `body`: The HTTP request body as a string or buffer 

And returns an object (or `Promise` resolving to an object) with the following
keys:

- `status`: The HTTP response status code (e.g. `200`)
- `headers`
- `body`
- `push`: An optional array of requests that will be fed back into the request
  handler to compute responses and then pushed to the client. This is only
  supported over HTTP/2 (indicated by `request.version` being `'2.0'`).

##### HTTP/1.1 Upgrade
The request handler is also able to negotiate protocol upgrades (e.g. to
WebSocket). When a client sends the `Connection: Upgrade` header, the request
handler can respond with status `101 Switching Protocols` and immediately take
control of the underlying TCP `Socket` by providing an `upgrade` method on the
response object.

```javascript
import {createHash} from 'node:crypto'
import WebSocket from 'ws'

const webSocketHashingConstant = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

export default function(request) {
  if (
    request.headers.connection === 'Upgrade' &&
    request.headers.upgrade === 'websocket'
  ) {
    const key = request.headers['sec-websocket-key']

    return {
      status: 101,
      headers: {
        Upgrade: 'websocket',
        Connection: 'Upgrade',
        'Sec-WebSocket-Accept': createHash('sha1')
          .update(`${key}${webSocketHashingConstant}`)
          .digest('base64'),
      },
      async upgrade(socket, head) {
        const ws = new WebSocket(null)
        ws.setSocket(socket, head, {
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
        })
        ws.on('message', (message) => {
          console.log(message.toString())
        })
      },
    }
  } else {
    return {
      status: 426,
    }
  }
}
```

See [Pre-Built Middleware](#pre-built-middleware) for pre-packaged solutions.

#### Protocol Support
This HTTP server supports HTTP/1.1 and HTTP/2 as well as TLS.

#### TLS Configuration
A self-signed certificate is automatically generated for `localhost` when
`NODE_ENV` is not set to `production`. Otherwise, a certificate can be provided
by exporting an object named `tls` containing any of the options for
[`tls.createSecureContext`](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options),
for example:

```javascript
export const tls = {
  cert: 'PEM format string',
  key: 'PEM format string'
}
```

`CERT` and `KEY` can also be provided as environment variables.

#### Hot-Reloading
When `NODE_ENV` is not set to `production`, the provided ES module is
re-imported whenever it or its dependencies change. Note that `node_modules` are
never re-imported.

#### Logging
By default, the method and URL for every request is logged to STDOUT.

In order to log additional events to STDOUT, a custom logger can be created and
exported:

```javascript
import {Logger} from 'passing-notes'

export const logger = new Logger()
```

This logger is expected to provide the following interface:

- It extends `EventEmitter`
- It emits `log` events with two arguments:
  - `event`: An object containing:
    - `time`: A UNIX timestamp
    - `level`: One of `TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`, or `FATAL`
    - `topic`: A string that categorizes the log event
    - `message`: A description of the log event
    - `duration`: An optional millisecond duration
    - `error`: An optional `Error` object to print
  - `logLine` a formatted string to print to STDOUT
- `log(event)`: Computes a timestamp and emits a `log` event.
- `measure(event)`: Logs the start of a task. Returns a function that when
  called, computes the duration and logs the end of the task.
