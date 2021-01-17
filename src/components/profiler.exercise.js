import * as React from 'react'
import {client} from 'utils/api-client'

function Profiler({phases, ...props}) {
  const queue = React.useRef([])
  React.useEffect(
    () => setInterval(sendQueuedData, (5000)),
    []
  )

  function sendQueuedData() {
    if (!queue.current.length) {
      return Promise.resolve({success: true})
    }

    const queueToSend = [...queue.current]
    queue.current = []
    return client('profile', {data: queueToSend})
  }

  return (
    <React.Profiler
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
        if (! phases || phases.includes(phase)) {
          queue.current.push(
            {data: {id, phase, actualDuration, baseDuration, startTime, commitTime, interactions}}
          )
        }
      }}
      {...props}
    />
  )
}

export {Profiler}
