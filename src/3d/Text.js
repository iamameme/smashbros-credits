import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import useStore from '../store'

import TextSprite from '@seregpie/three.text-sprite';

const geometry = new THREE.BoxBufferGeometry(1, 1, 40)
const lightgreen = new THREE.Color('lightgreen')
const hotpink = new THREE.Color('hotpink')
const laserMaterial = new THREE.MeshBasicMaterial({ color: lightgreen })
const crossMaterial = new THREE.MeshBasicMaterial({ color: hotpink, fog: false })
const position = new THREE.Vector3()
const direction = new THREE.Vector3()

export default function Texts() {
    const gltf = useLoader(GLTFLoader, '/rock.gltf')
    const rocks = useStore((state) => state.texts)
    return rocks.map((data, i) => <Text posit={data.posi} isHit={data.isHit} t={data.text} index={i} />)
  }

const Text = React.memo(({ nodes, materials, t, index, isHit, posit }) => {
  const mutation = useStore((state) => state.mutation)
  const actions = useStore((state) => state.actions)
  const texts = useStore((state) => state.texts)
  const { clock, mouse, ray } = mutation
  let posi = texts[index] && texts[index].posi ? texts[index].posi : -Math.abs(index / 2);
  let offset = 0;
  const test = useRef();
  const test2 = useRef();

  let text = new TextSprite({
    alignment: 'left',
    color: 'white',
    fontFamily: '"Smash", Times, serif',
    fontSize: 6,
    fontStyle: 'italic',
    text: t.join('\n'),
  });

  useFrame(() => {
    if (posi < .60) {
      posi += 0.002;
    } else {
      posi += 0.0005;
    }

    // get the point at position
    var point = mutation.track2.parameters.path.getPointAt(posi);
    test.current.position.copy(point);
    test.current.visible = true;

    if (posi > 0 && posi < 1) {
        actions.setBox({ index, posi, box: new THREE.Box3().setFromObject(test.current)})
    } else {
        actions.setPosi({ index, posi })
    }

    if (texts[index] && texts[index].isHit) {
        text.color = 'red';
    } else {
        text.color = 'white';
    }
  })

  return (
    <group>
      {/*<group name="text" >
        <mesh  position={[-350, -200, -400]} geometry={mutation.track2} >
          <meshBasicMaterial color="blue" />
        </mesh>
  </group>*/}
      <group ref={test}>
        <mesh  ref={test2} position={[-350, -200 , -400]}  renderOrder={1000} material={crossMaterial}>
          <primitive  scale={[1,1,1]} object={text}  />
        </mesh>
      </group>
    </group>
  )
});
