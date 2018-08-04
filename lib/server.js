/* eslint-env serviceworker */
const { parentPort } = require('worker_threads')
const { peekTransferables } = require('./utils.js')

/**
 * @callback Procedure
 * @param  {*}           data Any data
 * @return {(Promise|*)}
 */

class RpcServer {
  /**
   * Every passed method becomes remote procedure.
   * It can return Promise if it is needed.
   * Only ArrayBuffers will be transferred automatically (not TypedArrays).
   * Errors thrown by procedures would be handled by server.
   * @param {Object.<string, Procedure>} methods Dictionary of remote procedures
   * @example
   *
   * var server = new RpcServer({
   *   add ({ x, y }) { return x + y },
   *   sub ({ x, y }) { return x - y },
   *   mul ({ x, y }) { return x * y },
   *   div ({ x, y }) { return x / y },
   *   pow ({ x, y }) { return x ** y }
   * })
   */
  constructor (methods) {
    this.methods = methods
    this.listen()
  }

  /**
   * Subscribtion to "message" events
   * @protected
   */
  listen () {
    parentPort.on('message', this.handler.bind(this))
  }

  /**
   * Handle "message" events, invoke remote procedure if it possible
   * @param {Object} req        Request data
   * @param {string} req.method Procedure name
   * @param {number} req.uid    Unique id of rpc call
   * @param {*}      req.data   Procedure params
   * @protected
   */
  async handler (req) {
    var { method, uid, data } = req
    if (this.methods[method]) {
      try {
        data = await this.methods[method](data)
        this.reply(uid, method, data)
      }
      catch (error) {
        this.throw(uid, String(error))
      }
    } else {
      this.throw(uid, `Unknown RPC method "${method}"`)
    }
  }

  /**
   * Reply to remote call
   * @param {number} uid    Unique id of rpc call
   * @param {string} method Procedure name
   * @param {*}      data   Call result, could be any data
   * @protected
   */
  reply (uid, method, data) {
    var transferables = peekTransferables(data)
    parentPort.postMessage({ uid, method, data }, transferables)
  }

  /**
   * Throw error
   * @param {number} uid   Unique id of rpc call
   * @param {string} error Error description
   * @protected
   */
  throw (uid, error) {
    parentPort.postMessage({ uid, error })
  }

  /**
   * Trigger server event
   * Only ArrayBuffers will be transferred automatically (not TypedArrays).
   * @param {string} eventName Event name
   * @param {*}      data      Any data
   * @example
   *
   * setInterval(() => {
   *   server.emit('update', Date.now())
   * }, 50)
   */
  emit (eventName, data) {
    var transferables = peekTransferables(data)

    parentPort.postMessage({ eventName, data }, transferables)
  }
}

module.exports = RpcServer
