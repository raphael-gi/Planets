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
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000000000);
const controls = new OrbitControls( camera, renderer.domElement );

camera.position.set(1000, 100000000, 0)
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

async function createPlanets() {
	const sunResponse = await getSun();
	const sun = sunResponse.bodies[0]
	const geometry = new THREE.SphereGeometry(sun.meanRadius, 32, 32)
	const material = new THREE.MeshBasicMaterial({ color: 0xedd131 })
	const sunMesh = new THREE.Mesh(geometry, material)
	sunMesh.scale.set(
		15,
		15,
		15
	)
	scene.add(sunMesh)

	const planetsResponse = await getPlanets();
	planetsResponse.bodies.forEach(planet => {
		const geometry = new THREE.SphereGeometry(1,16,16 )
		const material = new THREE.MeshBasicMaterial( { color: 0xffffff } )
		const planetMesh = new THREE.Mesh( geometry, material )
		const planetS = 0.005
		planetMesh.scale.set(planet.equaRadius/planetS,planet.polarRadius/planetS,planet.equaRadius/planetS)
		scene.add(planetMesh)

		const curve = new THREE.EllipseCurve(
			0, 0,
			planet.aphelion, planet.perihelion,
			0, 2*Math.PI,
			false
		);

		const planetPoints = curve.getPoint(planet.mainAnomaly)
		planetMesh.position.set(planetPoints.x, planetPoints.y)

		const points = curve.getPoints(100);
		const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
		const curveMaterial = new THREE.LineBasicMaterial( { color: 0xb7b7b7 } );
		/*
		curveMaterial.rotateX = Math.PI/2
		curveMaterial.rotateY = (planet.inclination/360)*Math.PI
		*/
		const orbitMesh = new THREE.Line(curveGeometry, curveMaterial);
		/*
		orbitMesh.rotation.x = Math.PI/2
		orbitMesh.rotation.y = (planet.inclination/360)*Math.PI
		*/
		scene.add(orbitMesh)
	})
}
createPlanets()

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	renderer.render(scene, camera);
}
animate();
