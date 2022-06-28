import React, { useRef, useEffect } from 'react'

import { extend, useThree, useFrame } from '@react-three/fiber'
import useStore from '../store'

export default function Track() {
  const ref = useRef()
  const mutation = useStore((state) => state.mutation)
  const { scale, track2, position, track } = useStore((state) => state.mutation)
  const t = ((Date.now() - mutation.startTime) % mutation.looptime) / mutation.looptime
  useFrame(() => {
    ref.current.position.copy(position);
  })
  return (
    <mesh ref={ref} scale={[scale, scale, scale]} geometry={track2} >
      <meshBasicMaterial color="indianred" />
    </mesh>
  )
}
