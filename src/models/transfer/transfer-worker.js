/**
Transfer class represents a binary file inside a firmware update zip.
A firmware update consists of a init package and data file. The StateMachine
parases the zip file and creates a transfer object for each entry in the zip

The statemachine uses a queue to slot the Transfers in order
**/
import Transfer from './transfer'
import TransferStates from './states'

const TransferWorker = function (task, onCompleition) {
  if (task instanceof Transfer === false) {
    throw new Error('task is not of type Task')
  }
  if (!onCompleition) {
    throw new Error('onCompleition is not set')
  }
  let stateUpdateFunction = (event) => {
    if(event.state === TransferStates.Failed) {
      task.end()
      onCompleition('transfer failed')
    } else if (event.state === TransferStates.Completed) {
      task.end()
      onCompleition()
    }
  }
  task.on('stateChanged', stateUpdateFunction)
  task.begin()
}

module.exports.TransferWorker = TransferWorker
export default TransferWorker
