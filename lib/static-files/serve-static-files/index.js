/* @flow */
import type { Responder } from 'passing-notes/lib/http'
import * as fse from 'fs-extra'
import * as path from 'path'
import parseUrl from 'url-parse'
import contentType from 'content-type'
import mime from 'mime'
import fresh from 'fresh'

export default function(rootDirectory: string): Responder => Responder {
  return next => async request => {
    const { pathname } = parseUrl(request.url)

    const filePath = path.join(rootDirectory, pathname)
    try {
      return await serveFile(request, filePath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return next(request)
      }
      throw error
    }
  }
}

async function serveFile(request, filePath) {
  const fileStats = await fse.stat(filePath)
  if (fileStats.isDirectory()) {
    return serveFile(request, path.join(filePath, 'index.html'))
  }

  const responseHeaders = {
    'content-type': contentType.format({
      type: mime.getType(path.extname(filePath)),
      parameters: {
        charset: 'utf-8'
      }
    }),
    'last-modified': new Date(fileStats.mtime).toUTCString()
  }
  if (fresh(request.headers, responseHeaders)) {
    return {
      status: 304,
      headers: responseHeaders,
      body: ''
    }
  }

  return {
    status: 200,
    headers: responseHeaders,
    body: await fse.createReadStream(filePath)
  }
}
