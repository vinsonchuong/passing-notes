# passing-notes
![npm](https://img.shields.io/npm/v/passing-notes.svg)
[![CI Status](https://github.com/vinsonchuong/passing-notes/workflows/CI/badge.svg)](https://github.com/vinsonchuong/passing-notes/actions?query=workflow%3ACI)
[![dependencies Status](https://david-dm.org/vinsonchuong/passing-notes/status.svg)](https://david-dm.org/vinsonchuong/passing-notes)
[![devDependencies Status](https://david-dm.org/vinsonchuong/passing-notes/dev-status.svg)](https://david-dm.org/vinsonchuong/passing-notes?type=dev)

Build an HTTP server out of composable blocks

## Example
```js
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

## API

### `pass-notes server.js`
A CLI that takes an ES module that exports an HTTP request handler and uses it
to start an HTTP server.

```js
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

- `method`: An HTTP request method in capital letters (e.g. `GET` or `POST`)
- `url`: The absolute URL or path to a resource
- `headers`: An object mapping case-insensitive HTTP header names to values
- `body`: The HTTP request body as a string or buffer 

And returns an object (or `Promise` resolving to an object) with the following
keys:

- `status`: The HTTP response status code (e.g. `200`)
- `headers`
- `body`

#### Protocol Support
This HTTP server supports HTTP/1.1 and HTTP/2 as well as TLS.

#### TLS Configuration
A self-signed certificate is automatically generated for `localhost` when
`NODE_ENV` is not set to `production`. Otherwise, a certificate can be provided
by exporting an object named `tls` containing any of the options for
[`tls.createSecureContext`](https://nodejs.org/api/tls.html#tls_tls_createsecurecontext_options),
for example:

```js
export const tls = {
  cert: 'PEM format string',
  key: 'PEM format string'
}
```

`CERT` and `KEY` (or `PFX`) can also be provided as environment variables.

#### Hot-Reloading
When `NODE_ENV` is not set to `production`, the provided ES module is
re-imported whenever it or its dependencies change. Note that `node_modules` are
never re-imported.

#### Logging
By default, the method and URL for every request is logged to STDOUT.

In order to log additional events to STDOUT, a custom logger can be created and
exported:

```
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
