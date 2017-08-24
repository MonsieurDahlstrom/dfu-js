/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/
import Transfer from './transfer'

let CurrentTransfer = undefined

const TransferWorker = function (task, onCompleition) {
  if (task instanceof Transfer === false) {
    throw new Error('task is not of type Task')
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set')
  }
  CurrentTransfer = task
  task.begin()
  const intervalTimer = setInterval(() => {
    if (task.state === TransferState.Failed) {
      clearInterval(intervalTimer)
      task.end()
      CurrentTransfer = undefined
      onCompleition('Failed Transfer')
    } else if (task.state === TransferState.Completed) {
      clearInterval(intervalTimer)
      task.end()
      CurrentTransfer = undefined
      onCompleition()
    }
  }, 1000)
}

module.exports.CurrentTransfer = CurrentTransfer
module.exports.TransferWorker = TransferWorker
