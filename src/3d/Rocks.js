import React, { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import useStore from '../store'
import * as THREE from 'three'
import TextSprite from '@seregpie/three.text-sprite';

export default function Rocks() {
  const gltf = useLoader(GLTFLoader, '/rock.gltf')
  const rocks = useStore((state) => state.rocks)
  return rocks.map((data) => <Rock {...gltf} key={data.guid} data={data} />)
}

const Rock = React.memo(({ nodes, materials, data }) => {
  const ref = useRef()
  const { clock, track, startTime, looptime } = useStore((state) => state.mutation)
  let text = new TextSprite({
    alignment: 'left',
    color: data.isHit ? 'red' : 'white',
    fontFamily: '"Smash", Times, serif',
    fontSize: 4,
    fontStyle: 'italic',
    text: [
      'Twinkle, twinkle, little star,',
      'How ' + data.index,
    ].join('\n'),
  });

  useFrame(() => {
    const r = Math.cos((clock.getElapsedTime() / 2) * data.speed) * Math.PI
    ref.current.rotation.set(r, r, r)
    const time = Date.now()
    const a = ((time - startTime) % looptime) / looptime;
    const trackPos = track.parameters.path.getPointAt(a).multiplyScalar(15);
    /*if (ref) {
      if (trackPos > data.offset + 100 || trackPos < data.offset - 100 ) {
        ref.visible = false;
      } else {
        ref.visible = true;
      }
    }*/
    if (data.isHit) {
      console.log('ishit')
      text.color = 'red';
    }
  })
  
  return (
    <group ref={ref} position={data.offset} scale={[data.scale, data.scale, data.scale]}>
      <group
        position={[-0.016298329457640648, -0.012838120572268963, 0.24073271453380585]}
        scale={[1, 1, 1]}>
          <primitive scale={[1,1,1]} object={text}  />
      </group>
    </group>
  )
})
