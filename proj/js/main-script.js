import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer, stereoCamera;
var moveAnelGrande = false, moveAnelPequeno = false, moveAnelMedio = false;
var currentShading = 'Gouraud';
var directionalLightOn = true;
var directionalLight
/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));
    scene.background = new THREE.Color(0xf6f6ff);

    const geometry = new THREE.BoxGeometry(5,5,5);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const cube = new THREE.Mesh(geometry, material);
    createSkydome()
    scene.add(cube);

}

function createSkydome(){
    const skyGeometry = new THREE.SphereGeometry(20, 32, 32, Math.PI/ 2, Math.PI);    
    const outsideMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('js/skydome.jpg'), // Carregar a textura do frame do vídeo
        side: THREE.BackSide, // A textura é aplicada no lado de fora do skydome
    });
    
    
    // Create a mesh with the skydome geometry and multi-material
    const skyDome = new THREE.Mesh(skyGeometry, outsideMaterial);
    skyDome.rotation.z = Math.PI / 2; 
    skyDome.position.y = 0;
    scene.add(skyDome);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCamera(){
    stereoCamera = new THREE.StereoCamera();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(50, 30, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function create_Lights(){
    var ambientLight = new THREE.AmbientLight(0xffa500, 0.2); // Tom alaranjado
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-50, 50, 50)
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    directionalLightOn = true;
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update(){
    'use strict';

}

function updateStereoCamera(){
    stereoCamera.update(camera);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
    updateStereoCamera(); // Update the stereo camera based on the perspective camera

    // Clear the previous rendering
    renderer.clear();

}


////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    create_Lights();
    createCamera();

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    render();

    requestAnimationFrame(animate);
    update();

    renderer.render(scene, camera);
    renderer.autoClear = false;
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (innerHeight > 0 && innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(event) {
    switch (event.keyCode) {

        case 81: //Q
        case 113: //q
            currentShading = 'Gouraud';
            break;

        case 68: //D
        case 100: //d
            directionalLightOn = !directionalLightOn;
            directionalLight.visible = directionalLightOn;
            break;  
        case 87: //w
        case 119: //W
            currentShading = 'Phong';
            break;
        
        case 69: //E
        case 101: //e
            currentShading = 'Cartoon';
            break;

        case 82: //R
        case 114: //r
            currentShading = 'NormalMap';
            break;

        case 49: // Tecla '1' - Anel grande
            if (!activeKeys.includes('1')){
                activeKeys.push('1');
            }
            moveAnelGrande = true;
            break;
        case 50: // Tecla '2' - Anel médio
            if (!activeKeys.includes('2')){
                activeKeys.push('2');
            }
            moveAnelMedio = true;
            break;
        case 51: // Tecla '3' - Anel pequeno
            if (!activeKeys.includes('3')){
                activeKeys.push('3');
            }
            moveAnelPequeno = true;
            break;
        
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
    switch (e.keyCode) {
        case 49: //1
            activeKeys.splice(activeKeys.indexOf('1'), 1);
            moveAnelGrande = false;
            break;
        case 50: //2
            activeKeys.splice(activeKeys.indexOf('2'), 1);
            moveAnelMedio = false;
            break;
        case 51: //3
            activeKeys.splice(activeKeys.indexOf('3'), 1);
            moveAnelPequeno = false;
        break;

        
    }

}

init();
animate();