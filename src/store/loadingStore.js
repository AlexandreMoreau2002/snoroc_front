// src/store/loadingStore.js
const subscribers = new Set()
let pendingRequests = 0

const notifySubscribers = () => {
  const isLoading = pendingRequests > 0
  subscribers.forEach((callback) => callback(isLoading))
}

export const subscribeToLoading = (callback) => {
  if (typeof callback !== 'function') {
    return () => {}
  }
  subscribers.add(callback)
  callback(pendingRequests > 0)
  return () => {
    subscribers.delete(callback)
  }
}

export const incrementLoading = () => {
  pendingRequests += 1
  notifySubscribers()
}

export const decrementLoading = () => {
  pendingRequests = Math.max(0, pendingRequests - 1)
  notifySubscribers()
}

export const resetLoading = () => {
  pendingRequests = 0
  notifySubscribers()
}
