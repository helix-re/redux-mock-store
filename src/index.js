import { applyMiddleware } from 'redux'
import isEqual from 'lodash.isequal'
import isPlainObject from 'lodash.isplainobject'

const isFunction = arg => typeof arg === 'function'

export const configureStore = (middlewares = []) => {
  const mockStore = (getState = {}) => {
    const mockStoreWithoutMiddleware = () => {
      let actions = []
      let listeners = []

      const self = {
        clearActions () {
          actions = []
        },

        dispatch (action) {
          if (!isPlainObject(action)) {
            throw new Error(
              'Actions must be plain objects. ' +
              'Use custom middleware for async actions.'
            )
          }

          if (typeof action.type === 'undefined') {
            throw new Error(
              'Actions may not have an undefined "type" property. ' +
              'Have you misspelled a constant? ' +
              'Action: ' +
              JSON.stringify(action)
            )
          }

          actions.push(action)
          listeners.forEach(listener => listener())

          return action
        },

        findActions (payload) {
          let matches = []
          actions.forEach(action => {
            if (isEqual(action, payload)) {
              matches.push(action)
            }
          })
          return matches
        },

        getActions: () => actions,

        getState: () => isFunction(getState) ? getState(actions) : getState,

        replaceReducer (nextReducer) {
          if (!isFunction(nextReducer)) {
            throw new Error('Expected the nextReducer to be a function.')
          }
        },

        subscribe (cb) {
          if (isFunction(cb)) {
            listeners.push(cb)
          }

          return () => {
            const index = listeners.indexOf(cb)
            if (index !== -1) {
              listeners.splice(index, 1)
            }
          }
        }
      }

      return self
    }

    const mockStoreWithMiddleware = applyMiddleware(
      ...middlewares
    )(mockStoreWithoutMiddleware)

    return mockStoreWithMiddleware()
  }

  return mockStore
}

export default configureStore
