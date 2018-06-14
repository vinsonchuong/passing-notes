/* @flow */
import { sendRequest } from 'passing-notes/lib/http'
import { liftRequest as liftRpcRequest } from 'passing-notes/lib/rpc'

export default liftRpcRequest(sendRequest)
