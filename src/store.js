import * as THREE from 'three'
import { Curves } from 'three/examples/jsm/curves/CurveExtras'
import { addEffect } from '@react-three/fiber'
import create from 'zustand'
import * as audio from './audio'

class CustomSinCurve extends THREE.Curve {
	constructor( scale = 1, angle = 7 * Math.PI / 4 ) {
		super();
		this.scale = scale;
    this.angle = angle;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const tx = t * 4 - 1.5;
		const ty = Math.sin( 1 * Math.PI * t );
		const tz = 0;

    var axis = new THREE.Vector3( 0, 1, 0 );
    var angle = this.angle;

		return optionalTarget.set( tx, ty, tz ).applyAxisAngle( axis, angle ).multiplyScalar( this.scale );
	}
}

let guid = 1

const text2 = [['Work Experience'], ['Cornerstone Resources Credit Union League', '2016-2017: They put a lot of trust in an 18-19 year old'], ['Full Stack: Worked in VBA and Ruby on Rails'],
['S5 Stratos - Software Engineer', 'Nowadays, 2017 - 2022'], ['Worked in a lot of things'], ['Mainly React, Java, and lots of database work'], ['It was a small team for a while so', 'We wore lots of hats'], 
['Lazy.com', 'My full-stack work on the side'], ["It's a little Mark Cuban backed website"]];
const text3 = [['Cool Things'], ['Runner-Up Riot Games API Challenge 2017', 'I made a React app and it took 2nd'], ['Flappy Doge for Android', 'I was proud of this getting popular in high school']];
const text4 = [['Education'], ['High School', 'Had a 4.15 GPA... I think that is good'], ['Collin College', '2016-2018: Associates Degree', 'Also was a member of the student government for my time there'], ['Western Governors University', '2019-Present: 14 credit hours from graduating', 'I work a lot so doing this part-time.']]
const text5 = [['Well anyways'], ['Thats it'], ['Did you get a lot of points?']]
const endTime = 70;

const useStore = create((set, get) => {
  let spline = new Curves.GrannyKnot();
  let track = new THREE.TubeBufferGeometry(spline, 250, 0.2, 10, true)
  let cancelLaserTO = undefined
  let cancelExplosionTO = undefined
  const box = new THREE.Box3()

  let track2 = new THREE.TubeGeometry(new CustomSinCurve(40 * 8), 250, 0.2, 10, false)
  let track3 = new THREE.TubeGeometry(new CustomSinCurve(40 * 8, 7 * Math.PI / 6), 250, 0.2, 10, false)
  let track4 = new THREE.TubeGeometry(new CustomSinCurve(40 * 8, 3 * Math.PI / 2), 250, 0.2, 10, false)
  let track5 = new THREE.TubeGeometry(new CustomSinCurve(40 * 8), 250, 0.2, 10, false)
  //  Math.floor(Math.random() * 3);
  let hardMode = localStorage.getItem('hardMode') ? localStorage.getItem('hardMode')  === 'true' : true;
  let text6 = [];
  if (hardMode) {
    text6 = [['Hey, you picked the hard mode'], ['You get some extra text', 'Ya know, more points'], ['Thanks for caring about the points'], ['Your name will be etched in the upper echilons'], ['...of stevenbarsam.com']]
  }
   
  return {
    sound: false,
    camera: undefined,
   
    texts: [['Hello I am Steven Barsam'],['This is my website'],['Shoot the text like the Smash Bros Melee credits'], ['Aim by moving your mouse', 'Click to shoot'],['Skills', 'Like Things I Code In'], ['Unreal', 'Blueprints and C++'], ['Unity', 'Obsessed with LINQ'], ['React.js'], ['Java', 'And a lil Scala'], ['This was made in threejs'], ['Relational Databases', 'SQL, Postgres, Clickhouse, etc.'], ['Solidity and Huff (Assembly-ish)', "I'm sorry"], ['All the other languages I took classes in school in', 'C++, MIPS, etc']]
      .concat(text2).concat(text3).concat(text4).concat(text5).concat(text6).map((x,i) => ({ trackNo: hardMode ? Math.floor(Math.random() * 5) : 0, index: i, isHit: false, text: x,  hit: new THREE.Vector3()})),
    rocks: randomRocks(5, track, 150, 8, () => 1 + Math.random() * 2.5),
    enemies: randomData(10, track, 20, 15, 1),
    points: 0,
    textsHit: [],
    health: 100,
    lasers: [],
    explosions: [],

    mutation: {
      t: 0,
      position: new THREE.Vector3(),
      startTime: Date.now(),

      track,
      track2,
      track3,
      track4,
      track5,
      scale: 15,
      fov: 70,
      hits: false,
      rings: randomRings(30, track),
      particles: randomData(1500, track, 100, 1, () => 0.5 + Math.random() * 0.8),
      looptime: 40 * 1000,
      binormal: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      clock: new THREE.Clock(false),
      mouse: new THREE.Vector2(-250, 50),

      // Re-usable objects
      dummy: new THREE.Object3D(),
      ray: new THREE.Ray(),
      box: new THREE.Box3()
    },

    actions: {
      reset() {
        set({   points: 0,
          textsHit: [],
          health: 100,
          lasers: [],
          texts: [],
          explosions: [],
           mutation: {
          position: new THREE.Vector3(),
          startTime: Date.now(),
    
          track,
          track2,
          scale: 15,
          fov: 70,
          hits: false,
          rings: randomRings(30, track),
          particles: randomData(1500, track, 100, 1, () => 0.5 + Math.random() * 0.8),
          looptime: 40 * 1000,
          binormal: new THREE.Vector3(),
          normal: new THREE.Vector3(),
          clock: new THREE.Clock(false),
          mouse: new THREE.Vector2(-250, 50),
    
          // Re-usable objects
          dummy: new THREE.Object3D(),
          ray: new THREE.Ray(),
          box: new THREE.Box3()
        },})
      },
      init(camera) {
        const { mutation, actions } = get()

        set({ camera })
        mutation.clock.start()
        actions.toggleSound(get().sound)

        addEffect(() => {
          const { rocks, enemies, texts, clock } = get()

          const time = Date.now()
          const t = (mutation.t = ((time - mutation.startTime) % mutation.looptime) / mutation.looptime)
          mutation.position = track.parameters.path.getPointAt(t)
          mutation.position.multiplyScalar(mutation.scale)

          // test for wormhole/warp
          let warping = false
          if (t > 0.3 && t < 0.4) {
            if (!warping) {
              warping = true
              playAudio(audio.warp)
            }
          } else if (t > 0.5) warping = false

          // test for hits
          const r = texts.filter(actions.test)
          //const e = enemies.filter(actions.test)
          const a = r
          const previous = mutation.hits
          mutation.hits = a.length
          if (previous === 0 && mutation.hits) playAudio(audio.click)
          const lasers = get().lasers
          if (mutation.hits && lasers.length && time - lasers[lasers.length - 1] < 100) {
            const updates = a.map((data) => ({ time: Date.now(), ...data }))
            set((state) => ({ explosions: [...state.explosions, ...updates] }))
            clearTimeout(cancelExplosionTO)
            cancelExplosionTO = setTimeout(() => set((state) => ({ explosions: state.explosions.filter(({ time }) => Date.now() - time <= 1000) })), 1000)
            const indexes = r.map(x => x.index);
            set((state) => ({
              points: state.points + r.length * (hardMode ? 300 : 100),
              //textsHit: state.textsHit.concat(indexes),
              texts: state.texts.map((rock) => ({...rock, isHit: indexes.indexOf(rock.index) > -1 ? true : rock.isHit}))
              //rocks: state.rocks.map((rock) => ({...rock, isHit: r.guid == rock.guid ? true : rock.isHit})),
              //enemies: state.enemies.filter((enemy) => !e.find((e) => e.guid === enemy.guid))
            }))
          }
          //if (a.some(data => data.distance < 15)) set(state => ({ health: state.health - 1 }))
        })
      },
      shoot() {
        set((state) => ({ lasers: [...state.lasers, Date.now()] }))
        clearTimeout(cancelLaserTO)
        cancelLaserTO = setTimeout(() => set((state) => ({ lasers: state.lasers.filter((t) => Date.now() - t <= 1000) })), 1000)
        playAudio(audio.zap, 0.5)
      },
      toggleSound(sound = !get().sound) {
        set({ sound })
        playAudio(audio.engine, 1, true)
        playAudio(audio.engine2, 0.3, true)
        playAudio(audio.bg, 1, true)
      },
      updateMouse({ clientX: x, clientY: y }) {
        get().mutation.mouse.set(x - window.innerWidth / 2, y - window.innerHeight / 2)
      },
      setBox(data) {
        const {index, box, posi} = data;
        const { texts } = get();
        if (texts[index] && box) {
          texts[index].box = box;
          texts[index].posi = posi
        }
        set(texts)
      },
      setPosi(data) {
        const {index, posi} = data;
        const { texts } = get();
        if (texts[index] && posi) {
          texts[index].posi = posi
        }
        set(texts)
      },
      test(data) {
        //console.log(data)
        if (data.box && !data.isHit) {
          data.hit.set(10000, 10000, 10000)
          const result = get().mutation.ray.intersectBox(data.box, data.hit)
          data.distance = get().mutation.ray.origin.distanceTo(data.hit)
          return result
        }
        /*
        box.min.copy(data.offset)
        box.max.copy(data.offset)
        box.expandByScalar(data.size * data.scale)
        data.hit.set(10000, 10000, 10000)
        const result = get().mutation.ray.intersectBox(box, data.hit)
        data.distance = get().mutation.ray.origin.distanceTo(data.hit)
        return result*/
      }
    }
  }
})

function randomRocks(count, track, radius, size, scale) {
  return new Array(count).fill().map((x,i) => {
    const t = rand
    const rand = i / 10;
    const pos = track.parameters.path.getPointAt(t)
    pos.multiplyScalar(15)
    const offset = pos
      .clone()
      .add(new THREE.Vector3(-radius + rand * radius * 2, -radius + rand * radius * 2, -radius + rand * radius * 2))
    const speed = 0.1 + rand
    return { isHit: false, index: i, guid: guid++, scale: typeof scale === 'function' ? scale() : scale, size, offset, pos, speed, radius, t, hit: new THREE.Vector3(), distance: 1000 }
  })
}

function randomData(count, track, radius, size, scale) {
  return new Array(count).fill().map(() => {
    const t = Math.random()
    const pos = track.parameters.path.getPointAt(t)
    pos.multiplyScalar(15)
    const offset = pos
      .clone()
      .add(new THREE.Vector3(-radius + Math.random() * radius * 2, -radius + Math.random() * radius * 2, -radius + Math.random() * radius * 2))
    const speed = 0.1 + Math.random()
    return { guid: guid++, scale: typeof scale === 'function' ? scale() : scale, size, offset, pos, speed, radius, t, hit: new THREE.Vector3(), distance: 1000 }
  })
}

function randomRings(count, track) {
  let temp = []
  let t = 0.4
  for (let i = 0; i < count; i++) {
    t += 0.003
    const pos = track.parameters.path.getPointAt(t)
    pos.multiplyScalar(15)
    const segments = track.tangents.length
    const pickt = t * segments
    const pick = Math.floor(pickt)
    const lookAt = track.parameters.path.getPointAt((t + 1 / track.parameters.path.getLength()) % 1).multiplyScalar(15)
    const matrix = new THREE.Matrix4().lookAt(pos, lookAt, track.binormals[pick])
    temp.push([pos.toArray(), matrix])
  }
  return temp
}

function playAudio(audio, volume = 1, loop = false) {
  if (useStore.getState().sound) {
    audio.currentTime = 0
    audio.volume = volume
    audio.loop = loop
    audio.play()
  } else audio.pause()
}

export default useStore
export { audio, playAudio }
