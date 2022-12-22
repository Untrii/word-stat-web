export default function createQueue(dispatch: (request: string) => Promise<unknown>) {
  const requests = new Set<string>()
  const requestQueue = new Map<string, string[]>()
  const ipQueue: string[] = []

  let hasRunningProcess = false

  async function runAll() {
    hasRunningProcess = true

    let request: string
    while ((request = popFirst())) {
      await dispatch(request)
    }

    hasRunningProcess = false
  }

  function addRequest(ip: string, request: string) {
    if (!requests.has(request)) {
      ipQueue.push(ip)
      requests.add(request)

      if (!requestQueue.has(ip)) requestQueue.set(ip, [])
      requestQueue.get(ip).push(request)
    }

    if (!hasRunningProcess) runAll()
  }

  function hasRequest(request: string) {
    return requests.has(request)
  }

  function getRequestPosition(request: string) {
    let position = 1
    for (let i = 0; i < ipQueue.length; i++) {
      const ipRequests = requestQueue.get(ipQueue[i])
      if (!ipRequests) continue

      for (let j = 0; j < ipRequests.length; j++) {
        if (ipRequests[j] == request) return position
        else position++
      }
    }
  }

  function popFirst() {
    if (ipQueue.length === 0) return null
    const firstIp = ipQueue[0]

    if (!requestQueue.has(firstIp)) return null
    const ipRequests = requestQueue.get(firstIp)

    if (ipRequests.length === 0) return null

    ipQueue.splice(0, 1)

    const result = ipRequests.splice(0, 1)[0]
    if (ipRequests.length === 0) requestQueue.delete(firstIp)
    requests.delete(result)

    return result
  }

  return {
    addRequest,
    hasRequest,
    getRequestPosition,
    popFirst,
  }
}
