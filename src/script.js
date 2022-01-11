import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

import fluidVertexShader from "./shaders/fluid/vertex.glsl";
import fluidFragmentShader from "./shaders/fluid/fragment.glsl";
import gasVertexShader from "./shaders/gas/vertex.glsl";
import gasFragmentShader from "./shaders/gas/fragment.glsl";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const atomCanvas = document.querySelector('canvas.webgl')
const statesCanvas = document.querySelector('canvas.webgl1')

// Scene
const atomScene = new THREE.Scene()
const statesScene = new THREE.Scene()

/**
 * Lights (atom scene)
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
atomScene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
atomScene.add(pointLight)

/**
 * Light (states scene)
 */
 const s_ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
 statesScene.add(s_ambientLight)
 
 const s_pointLight = new THREE.PointLight(0xffffff, 0.5)
 s_pointLight.position.x = 2
 s_pointLight.position.y = 3
 s_pointLight.position.z = 4
 statesScene.add(s_pointLight)


/**
 * Objects
 */
 const solidCubeGeometry = new THREE.BoxGeometry(1.3,1.3,1.3)
 const solidCubeMaterial = new THREE.MeshStandardMaterial(
   {
     color: 0xFFFFFF,
     roughness: 0.4,
   }
 )
 // const solidCubeMaterial = new THREE.MeshBasicMaterial()
 const solidCube = new THREE.Mesh(solidCubeGeometry, solidCubeMaterial)
 solidCube.position.x = -3
 statesScene.add(solidCube)
 
 /**
  * Fluid Geometry
  */
 
 // Geometry
 const fluidGeometry = new THREE.SphereGeometry(1, 128, 128)
 
 // // Material
 const fluidMaterial = new THREE.ShaderMaterial({
     vertexShader: fluidVertexShader,
     fragmentShader: fluidFragmentShader,
     uniforms: {
         uMouseDentro: { type: 'bool', value: 'false'},
         uTime: { type: '1f', value: 0 },
         uColor: { type: 'vec3', value: new THREE.Color(0x000000) },
         uColor1: { type: 'vec3', value: new THREE.Color(0xF8F8F8) },
     },
     transparent: true,
     
 })
  
 // // Fluid Sphere 
 const sphere = new THREE.Mesh(fluidGeometry, fluidMaterial)
 statesScene.add(sphere)
 
 
 /**
  * Volume Cloud (Gas)
  */
 
 // Texture
 const size = 128;
 const data = new Uint8Array( size * size * size );
 
 let i = 0;
 const scale = 0.05;
 const perlin = new ImprovedNoise();
 const vector = new THREE.Vector3();
 
 for ( let z = 0; z < size; z ++ ) {
 
   for ( let y = 0; y < size; y ++ ) {
 
     for ( let x = 0; x < size; x ++ ) {
 
       const d = 1.0 - vector.set( x, y, z ).subScalar( size / 2 ).divideScalar( size ).length();
       data[ i ] = ( 128 + 128 * perlin.noise( x * scale / 1.5, y * scale, z * scale / 1.5 ) ) * d * d;
       i ++;
 
     }
 
   }
 
 }
 
 const gasTexture = new THREE.DataTexture3D( data, size, size, size );
 gasTexture.format = THREE.RedFormat;
 gasTexture.minFilter = THREE.LinearFilter;
 gasTexture.magFilter = THREE.LinearFilter;
 gasTexture.unpackAlignment = 1;
 
 // Geometry
 const gasGeometry = new THREE.BoxGeometry( 1, 1, 1);
 
 // Material
 const gasMaterial = new THREE.ShaderMaterial( {
   glslVersion: THREE.GLSL3,
   uniforms: {
     base: { value: new THREE.Color( 0xFFFFFF ) },
     map: { value: gasTexture },
     cameraPos: { value: new THREE.Vector3() },
     threshold: { value: 0.25 },
     opacity: { value: 0.25 },
     range: { value: 0.1 },
     steps: { value: 100 },
     frame: { value: 0 }
   },
   vertexShader: gasVertexShader,
   fragmentShader: gasFragmentShader,
   side: THREE.FrontSide,
   transparent: true
 } );
 
 // Mesh
 const mesh = new THREE.Mesh( gasGeometry, gasMaterial );
 mesh.position.x = 3
 mesh.scale.set(2.3,2.3,2.3)
statesScene.add( mesh );







//////////////////////////////////TEST OBJECTS
// // Material
// const material = new THREE.MeshStandardMaterial()
// material.roughness = 0.4

// // Objects
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     material
// )

// // Cube 
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1,1,1),
//     new THREE.MeshBasicMaterial({
//         color: 0xffffff
//     })
// )
// statesScene.add(cube)
// atomScene.add(sphere)
// statesScene.add(sphere)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    atomCamera.aspect = sizes.width / sizes.height
    atomCamera.updateProjectionMatrix()
    statesCamera.aspect = sizes.width / sizes.height
    statesCamera.updateProjectionMatrix()
 
    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer1.setSize(sizes.width/3, sizes.height/3)
    renderer1.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const atomCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
atomCamera.position.x = 1
atomCamera.position.y = 1
atomCamera.position.z = 2
atomScene.add(atomCamera)

const statesCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
statesCamera.position.x = 1
statesCamera.position.y = 1
statesCamera.position.z = 2
statesScene.add(statesCamera)

// Controls
const statesControls = new OrbitControls(atomCamera, atomCanvas)
const atomControls = new OrbitControls(statesCamera, statesCanvas)
statesControls.enableDamping = true
atomControls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: atomCanvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


const renderer1 = new THREE.WebGLRenderer({
    canvas: statesCanvas,
    alpha: true,
})
renderer1.setSize(sizes.width/3, sizes.height/3)
renderer1.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// renderer1.setClearColor(0xffffff)




/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update Solid Cube
  solidCube.rotation.x = elapsedTime * 0.01
  solidCube.rotation.y = elapsedTime * 0.02
  solidCube.rotation.z = elapsedTime * 0.01

  // Update Fluid Sphere
  fluidMaterial.uniforms.uTime.value = elapsedTime

  // Update Gas Sphere
    mesh.material.uniforms.cameraPos.value.copy( statesCamera.position );
    mesh.rotation.y = - performance.now() / 7500;
  
	mesh.material.uniforms.frame.value ++;

    // Update controls
    statesControls.update()
    atomControls.update()

    // Render
    renderer.render(atomScene, atomCamera)
    renderer1.render(statesScene, statesCamera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()