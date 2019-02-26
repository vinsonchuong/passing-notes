# passing-notes
![npm](https://img.shields.io/npm/v/passing-notes.svg)
[![Build Status](https://travis-ci.org/vinsonchuong/passing-notes.svg?branch=master)](https://travis-ci.org/vinsonchuong/passing-notes)
[![dependencies Status](https://david-dm.org/vinsonchuong/passing-notes/status.svg)](https://david-dm.org/vinsonchuong/passing-notes)
[![devDependencies Status](https://david-dm.org/vinsonchuong/passing-notes/dev-status.svg)](https://david-dm.org/vinsonchuong/passing-notes?type=dev)

Workflows for transfering data between frontend and backend

## Examples
- [Serving a REST API](examples/serving-a-rest-api): An lightweight REST API
  operating directly on HTTP request and response objects
- [Serving a Web Application](examples/serving-a-web-app): A React UI backed by
  an RPC API, with HTTP semantics abstracted away

## Installation
Install [passing-notes](https://yarnpkg.com/en/package/passing-notes)
by running

```sh
yarn add passing-notes
```

## API

### `pass-notes request-handler.js`
A CLI script that takes the path to a file that exports a
[Node.js request handler](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener),
transpiles that handler, and uses it to start an HTTP server.

```js
// api.js
import { respondToRequests } from 'passing-notes'

export default respondToRequests(
  next => async request => {
    console.log(request)
    // {
    //    method: 'GET',
    //    url: 'http://localhost:8080',
    //    headers: {},
    //    body: ''
    // }

    return {
      status: 200,
      headers: {},
      body: 'Hello World!'
    }
  }
)
```

```sh
$ yarn pass-notes api.js
```

ES.next code is automatically compiled using
[`@babel/register`](https://babeljs.io/docs/en/babel-register). Changed files
are hot-reloaded.

This CLI tool is meant to be used in conjunction with other functions provided
by `passing-notes`. But, if transpiling or hot-reloading is not needed, handlers
can simply be run using `node`.

### `sendRequest(request)`
A function usable both in Node.js and in the browser for making HTTP requests

```js
import { sendRequest } from 'passing-notes'

async function run() {
  const response = await sendRequest({
    method: 'GET',
    url: 'http://example.com',
    headers: {
      accept: 'text/html'
    },
    body: ''
  })

  console.log(response)
  // {
  //   status: 200,
  //   headers: {
  //     'content-type': 'text/html; charset=UTF-8'
  //     ...
  //   },
  //   body: '<!doctype html>...'
  // }
}

run()
```

### `respondToRequests(...middleware)`
Take an array of middleware and returns a
[Node.js request handler](https://nodejs.org/api/http.html#http_http_createserver_options_requestlistener).

```js
import { respondToRequests } from 'passing-notes'

export default respondToRequests(
  next => async request => {
    const response = next({
      ...request,
      body: JSON.parse(request.body)
    })

    return {
      ...response,
      headers: {
        ...response.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.body)
    }
  },

  next => async request => {
    return {
      status: 200,
      headers: {},
      body: { message: 'Hello World!' }
    }
  }
)
```

Each incoming request is passed to the first given middleware. That middleware
can then:

- Perform side-effects
- Return the results of the `next` middleware, passing in the same or a
  modified `request`
- Return a `Promise` that resolves to a `response`
- Throw an exception, which is translated into a `500` response.

In this way, requests go from top to bottom, and responses come back from bottom
to top.

### Middleware
`puppet-strings` provides a set of middleware to support modern web application
development.

#### `logRequestsAndResponses({ log })`
Log all requests and responses, along with their timings.

```js
import { respondToRequests, logRequestsAndResponses } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'

export default respondToRequests(
  logRequestsAndResponses({ log: printLog }),
  next => async request => {
    return {
      status: 200,
      headers: {},
      body: ''
    }
  }
)
```

`log` is a function that takes 2 arguments, a starting entry and an ending
entry. For example, for each request-response cycle, when the request is
received, a log entry is emitted with details about that request, and, when the
response is returned, the same log entry is emitted alongside one giving details
about the response.

Shown above, `printLog` from `passing-notes/lib/log` formats and prints log
entries to `stdout`.

#### `serveUi({ entry, log })`
Compile and serve an ES.next web UI.

```js
// api.js
import {
  respondToRequests,
  logRequestsAndResponses,
  serveUi
} from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'

export default respondToRequests(
  serveUi({ entry: 'ui/index.html', log: printLog })
)
```

```html
<!-- ui/index.html -->
<!doctype html>
<meta charset="utf-8">
<script async src="index.js"></script>
<div id="root"></div>
```

```js
// ui/index.js
import React from 'react'
import { render } from 'react-dom'

render(<div>Hello World!</div>, window.root)
```

`entry` is the path (relative to `package.json`) to the HTML entry point of the
web UI. It is assumed to be a file named `index.html`. It is compiled and
served using [parcel-bundler](https://github.com/parcel-bundler/parcel).

If a requested file cannot be found, the contents of `/` are returned.

`log` is as described [above](#serveui-entry-log-). Log entries are emitted to
indicate compilation status and any compilation errors.

#### `serveRpc({ actions, path, log, ...dependencies })`
Define a server-side middleware that when used in conjunction with
[`makeRpcClient`](#makerpcclientserverurl), enables calling actions defined
on the server over HTTP.

```js
import { respondToRequests, serveRpc } from 'passing-notes'
import { printLog } from 'passing-notes/lib/log'

const actions = {
  getItems: () => () => ['Item 1', 'Item 2', 'Item 3'],
  add: () => (x, y) => x + y,
  readFromDatabase: ({ db }) => () => db.select('some_table')
}

export default respondToRequests(
  serveRpc({ actions, path: '/rpc', log: printLog, db: someDbAdapter }),
)
```

Each action can take any number of parameters and return any value so long as
they are JSON serializable.

`serveRpc` will respond to `POST` requests to the given `path`:

```
POST /rpc

{
  "action": "add",
  "params": [1, 2]
}
```

The result returned by the action will be serialized to JSON and returned in
response:

```
{
  "result": 3
}

```

If the action throws an error, the error message will be serialized and returned:

```
{
  "error": "ReferenceError: foo is not defined"
}
```
`serveRpc` can take additional dependencies, all of which are injected into each
action. In this way, actions can be tested independently from HTTP and any
outside dependencies.

#### `makeRpcClient(serverUrl)`
Define a client for use in conjunction with
[`serveRpc`](#serverpcactionspathlogdependencies) to call actions defined on
the server over HTTP.

```js
import { makeRpcClient } from 'passing-notes'

const api = makeRpcClient('http://localhost:8080/rpc')

async function run() {
  const items = await api.getItems()
  const sum = await api.add(4, 3)
  const records = await api.readFromDatabase()
}

run()
```

`makeRpcClient` returns an object. When a method on that object is called, a
`POST` request is sent to the given `serverUrl` with the name of the method and
any parameters. For example:

```js
async function run() {
  const api = makeRpcClient('http://localhost:8080/rpc')
  const sum = await api.add(4, 3)
}
```

is translated into:

```
POST http://localhost:8080/rpc
{
  "action": "add",
  "params": [4, 3]
}
```

The response:

```
POST http://localhost:8080/rpc
{
  "result": 7
}
```

is returned by the method.

If, instead the response indicates an error:

```
POST http://localhost:8080/rpc
{
  "error": "Something went wrong."
}
```

The method will throw an error with that message.
