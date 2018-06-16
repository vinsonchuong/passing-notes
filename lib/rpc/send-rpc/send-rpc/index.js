/* @flow */
import { sendRequest } from 'passing-notes/lib/http'
import { lift } from 'passing-notes/lib/rpc/send-rpc'

export default lift(sendRequest)
