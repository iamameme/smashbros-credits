import * as THREE from 'three'
import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Stars from './3d/Stars'
import Planets from './3d/Planets'
import Effects from './3d/Effects'
import Particles from './3d/Particles'
import Enemies from './3d/Enemies'
import Rocks from './3d/Rocks'
import Explosions from './3d/Explosions'
import Rings from './3d/Rings'
import Track from './3d/Track'
import Track2 from './3d/Track2'
import Text from './3d/Text'
import Ship from './3d/Ship'
import Rig from './3d/Rig'
import Hud from './Hud'
import useStore from './store'

export default function App() {
  const { fov, track2, clock } = useStore((state) => state.mutation)
  const texts = useStore((state) => state.texts);
  const actions = useStore((state) => state.actions)
  const [backgroundStyle, setStyle ] = useState(undefined);

  useEffect(() => {
    const i = setInterval(() => {
      if (texts[texts.length - 1] && texts[texts.length - 1].posi > 1 ) {
        setStyle({ background: 'rgba(0,0,0,.9)' });
      }
    }, 1000);
    return () => clearInterval(i)
  }, [texts])
  
  return (
    <div style={backgroundStyle} onPointerMove={actions.updateMouse} onClick={actions.shoot}>
      {!backgroundStyle && (
        <Canvas
          linear
          mode="concurrent"
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
          camera={{ position: [0, 0, 2000], near: 0.01, far: 10000, fov }}
          onCreated={({ gl, camera }) => {
            actions.init(camera)
            gl.toneMapping = THREE.Uncharted2ToneMapping
            gl.setClearColor(new THREE.Color('#020209'))
        }}>
        {/*<fog attach="fog" args={['#070710', 100, 700]} />*/}
        <ambientLight intensity={0.25} />
        <Stars />
        <Track />
        <Particles />
        <Rings />
        <Suspense fallback={null}>
          <Planets />
          <Rig>
          <Text />
            <Ship />
          </Rig>
        </Suspense>
        <Effects />
      </Canvas>
      )}
      <Hud />
    </div>
  )
}
