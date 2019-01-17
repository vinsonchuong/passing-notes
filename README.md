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
