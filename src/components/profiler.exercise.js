import * as React from 'react'
import {client} from 'utils/api-client'

function Profiler({children, id}) {
  return(
    <React.Profiler
      id={id}
      onRender={data => client('profile', {data})}
    >
      {children}
    </React.Profiler>
  )
}

export {Profiler}
