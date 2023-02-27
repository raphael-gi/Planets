import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const baseUrl = "https://api.le-systeme-solaire.net/rest/bodies"
async function getPlanets() {
    const response = await fetch(`${baseUrl}?filter[]=isPlanet,eq,true`)
    return await response.json()
}
async function getSun() {
    const response = await fetch(`${baseUrl}?filter[]=id,eq,soleil`)
    return await response.json()
}
const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50000000 );
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set(1000,1000000,1000)
controls.update();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
async function createPlanets() {
    const planetS = 1
    const reductionSize = 100
    await getSun()
        .then(response => {
            const sun = response.bodies[0]
            const geometry = new THREE.SphereGeometry(sun.meanRadius/10, 16, 16)
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            const sunMesh = new THREE.Mesh(geometry, material)
            scene.add(sunMesh)
        })
    await getPlanets()
        .then(response => {
            console.log(response)
            response.bodies.forEach(planet => {
                const distance = planet.aphelion / reductionSize
                const eccentricity = (planet.eccentricity-1)*-1
                const geometry = new THREE.SphereGeometry(1,16,16 )
                const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
                const planetMesh = new THREE.Mesh( geometry, material )
                planetMesh.scale.set(planet.equaRadius/planetS,planet.polarRadius/planetS,planet.equaRadius/planetS)
                planetMesh.position.x = distance
                scene.add(planetMesh)
                const curve = new THREE.EllipseCurve(
                    0,  0,
                    distance,distance*eccentricity,
                    0,2*Math.PI,
                    false
                );
                const points = curve.getPoints( 50 );
                const curveGeometry = new THREE.BufferGeometry().setFromPoints( points );

                const curveMaterial = new THREE.LineBasicMaterial( { color: 0xff0000 } );
                const orbitMesh = new THREE.Line( curveGeometry, curveMaterial );
                orbitMesh.rotation.x = Math.PI/2
                orbitMesh.rotation.y = (planet.inclination/360)*Math.PI
                scene.add(orbitMesh)
            })
        })
}
createPlanets()

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}
animate();