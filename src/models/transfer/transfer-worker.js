/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/
import Transfer from './transfer'
import TransferStates from './states'

let currentTransfer = undefined

const CurrentTransfer = function() {
  return currentTransfer
}
const TransferWorker = function (task, onCompleition) {
  if (task instanceof Transfer === false) {
    throw new Error('task is not of type Task')
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set')
  }
  currentTransfer = task
  let stateUpdateFunction = (event) => {
    if(event.state === TransferStates.Failed) {
      onCompleition('transfer failed')
      task.end()
      currentTransfer = undefined
    } else if (event.state === TransferStates.Completed) {
      task.end()
      currentTransfer = undefined
      onCompleition()
    }
  }
  currentTransfer.on('stateChanged', stateUpdateFunction)
  currentTransfer.begin()
}

module.exports.CurrentTransfer = CurrentTransfer
module.exports.TransferWorker = TransferWorker
