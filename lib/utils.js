/**
 * Ensure that passed value is object
 * @param  {*}       object Value to check
 * @return {boolean}        Check result
 */
function isObject (object) {
  return Object(object) === object
}

/**
 * Ensure that passed value could be transfer
 * @param  {*}       object Value to check
 * @return {boolean}        Check result
 */
function isTransferable (object) {
  return object instanceof ArrayBuffer
}

/**
 * Recursively peek transferables from passed data
 * @param  {*}             data        Data source
 * @param  {Array}         [result=[]] Dist array
 * @return {ArrayBuffer[]}             List of transferables objects
 */
function peekTransferables (data, result = []) {
  if (isTransferable(data)) {
    result.push(data)
  } else if (isObject(data)) {
    for (var i in data) {
      peekTransferables(data[i], result)
    }
  }
  return result
}

/**
 * @return {string} Uniq uid
 */
function uuid () {
  return Math.floor((1 + Math.random()) * 1e10).toString(16)
}

module.exports = {
  isObject,
  isTransferable,
  peekTransferables,
  uuid
}
