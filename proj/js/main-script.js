import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer, stereoCamera;
var moveAnelGrande = false, moveAnelPequeno = false, moveAnelMedio = false;
var currentShading = 'Gouraud';
var directionalLightOn = true, lightsOn = [], pontualLights = [];
var faixaMobius;
var directionalLight
var cilindro, anelGrande = new THREE.Object3D(), anelMedio = new THREE.Object3D(), anelPequeno = new THREE.Object3D();
var activeKeys = [];
var meshs = [];



/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));
    scene.background = new THREE.Color(0x000000);
    createSkydome();
    createCilindro();
    createAneis();
    createFaixaMobius();
    createSuperficies();
}

function createSuperficies() {
    // Define diferentes superfícies paramétricas
    const surfaces = [
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder,  // Cilindro
        ParametricGeometries.cylinder  // Cilindro
    ];

    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x000000];
    const numSurfacesPerRing = 8;
    const scaleFactor = 3;  

    // Função auxiliar para criar superfícies
    function createSurfacesForRing(ring, ringSuperficies, outerRadius) {
        for (let i = 0; i < numSurfacesPerRing; i++) {
            const surfaceFunc = surfaces[i];
            const color = colors[i];
            const geometry = new ParametricGeometry(surfaceFunc, 10, 10);
            const materialLambert = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });
            const materialPhong = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
            const materialToon = new THREE.MeshToonMaterial({ color: color, side: THREE.DoubleSide });
            const materialNormal = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, materialLambert);

            const radius = outerRadius - 3;
            const angleStep = (2 * Math.PI) / numSurfacesPerRing;
            const angle = i * angleStep;

            // Posiciona a superfície na mesma altura que o anel
            mesh.position.set(
                radius * Math.cos(angle),
                radius * Math.sin(angle),
                -1
                
            );
            mesh.lookAt(new THREE.Vector3(ring.position.x, ring.position.y, ring.position.z));

            mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

            mesh.userData = {
                rotationSpeed: Math.random() * 0.02 + 0.01,
                rotationAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
                materials: [materialLambert, materialPhong, materialToon, materialNormal]
            };

            ring.add(mesh);
            meshs.push(mesh);
            ringSuperficies.push(mesh);
        }
    }

    // Arrays para armazenar as formas de cada anel
    const anelGrandeSuperficies = [];
    const anelMedioSuperficies = [];
    const anelPequenoSuperficies = [];

    // Cria superfícies para cada anel com o raio correto
    createSurfacesForRing(anelGrande, anelGrandeSuperficies, 20); // Outer radius of anelGrande is 20
    createSurfacesForRing(anelMedio, anelMedioSuperficies, 15);  // Outer radius of anelMedio is 15
    createSurfacesForRing(anelPequeno, anelPequenoSuperficies, 10); // Outer radius of anelPequeno is 10

    // Opcional: Armazena os arrays de superfícies em um objeto para facilitar o acesso posterior
    scene.userData.anelSuperficies = {
        anelGrande: anelGrandeSuperficies,
        anelMedio: anelMedioSuperficies,
        anelPequeno: anelPequenoSuperficies
    };
}


function createSkydome(){
    const skyGeometry = new THREE.SphereGeometry(45, 32, 32, Math.PI/ 2, Math.PI);    
    const skydomePhong = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('js/skydome.jpg'), // Carregar a textura do frame do vídeo
        side: THREE.BackSide, // A textura é aplicada no lado de fora do skydome
    });
    const skydomeLambert = new THREE.MeshLambertMaterial({
        map: new THREE.TextureLoader().load('js/skydome.jpg'), // Carregar a textura do frame do vídeo
        side: THREE.BackSide, // A textura é aplicada no lado de fora do skydome
    });
    const skydomeToon = new THREE.MeshToonMaterial({
        map: new THREE.TextureLoader().load('js/skydome.jpg'), // Carregar a textura do frame do vídeo
        side: THREE.BackSide, // A textura é aplicada no lado de fora do skydome
    });
    const skydomeNormal = new THREE.MeshNormalMaterial({
        map: new THREE.TextureLoader().load('js/skydome.jpg'), // Carregar a textura do frame do vídeo
        side: THREE.BackSide, // A textura é aplicada no lado de fora do skydome
    });
    
    // Create a mesh with the skydome geometry and multi-material
    var skyDome = new THREE.Mesh(skyGeometry, skydomeLambert);
    skyDome.userData = {materials: [skydomeLambert, skydomePhong, skydomeToon, skydomeNormal]};
    meshs.push(skyDome);
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
    camera.position.set(20, 30, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //camera.position.z = 5; // Set the camera position

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;    
    camera.lookAt(scene.position);
    scene.add(camera);

}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function create_Lights(){
    var ambientLight = new THREE.AmbientLight(0xffa500, 3); // Tom alaranjado
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 4);
    directionalLight.position.set(0, 12, 12)
    directionalLight.target.position.set(0, 0, 0);
    // light axes helper
    scene.add(directionalLight);
    directionalLightOn = true;

    const lightColor = 0xffffff;
    const lightIntensity = 1;
    const lightRadius = 15; // Raio em que as luzes serão distribuídas

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = lightRadius * Math.cos(angle);
        const z = lightRadius * Math.sin(angle);
        const light = new THREE.PointLight(lightColor, lightIntensity);
        light.position.set(x, 41, z); // Colocar as luzes na mesma altura da faixa
        light.lookAt(faixaMobius.position); // Apontar para a faixa
        pontualLights.push(light);
        lightsOn[i] = true;
        scene.add(light);
    }
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createCilindro() {
    var materialLambert = new THREE.MeshLambertMaterial({ color: 0xff7800 });
    materialLambert.flatShading = true;
    var materialPhong = new THREE.MeshPhongMaterial({ color: 0xff7800 });
    materialPhong.specular = new THREE.Color(0x111111);
    materialPhong.shininess = 30;
    materialPhong.flatShading = true;
    var materialToon = new THREE.MeshToonMaterial({ color: 0xff7800 });
    var materialNormal = new THREE.MeshNormalMaterial();
    cilindro = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 40, 100), materialLambert);
    cilindro.normalsNeedUpdate = true;
    cilindro.userData = {materials: [materialLambert, materialPhong, materialToon, materialNormal]};
    meshs.push(cilindro);

    cilindro.position.set(0, 20, 0);
    
    scene.add(cilindro);
}

function createAneis() {
    var anelGrandeLambert = new THREE.MeshLambertMaterial({ color: 0xff9933, side: THREE.DoubleSide });
    var anelGrandePhong = new THREE.MeshPhongMaterial({ color: 0xff9933, side: THREE.DoubleSide });
    var anelGrandeToon = new THREE.MeshToonMaterial({ color: 0xff9933, side: THREE.DoubleSide });
    var anelGrandeNormal = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    anelGrande = new THREE.Mesh(new THREE.RingGeometry(15, 20, 64, 20, 0, 2*Math.PI), anelGrandeLambert);
    meshs.push(anelGrande);
    var anelMedioLambert = new THREE.MeshLambertMaterial({ color: 0x0099ff, side: THREE.DoubleSide });
    var anelMedioPhong = new THREE.MeshPhongMaterial({ color: 0x0099ff, side: THREE.DoubleSide });
    var anelMedioToon = new THREE.MeshToonMaterial({ color: 0x0099ff, side: THREE.DoubleSide });
    var anelMedioNormal = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    anelMedio = new THREE.Mesh(new THREE.RingGeometry(10, 15, 64, 20, 0, 2*Math.PI), anelMedioLambert);
    meshs.push(anelMedio);
    var anelPequenoLambert = new THREE.MeshLambertMaterial({ color: 0x99ff99, side: THREE.DoubleSide });
    var anelPequenoPhong = new THREE.MeshPhongMaterial({ color: 0x99ff99, side: THREE.DoubleSide });
    var anelPequenoToon = new THREE.MeshToonMaterial({ color: 0x99ff99, side: THREE.DoubleSide });
    var anelPequenoNormal = new THREE.MeshNormalMaterial({side: THREE.DoubleSide});
    anelPequeno = new THREE.Mesh(new THREE.RingGeometry(5, 10, 64, 20, 0, 2*Math.PI), anelPequenoLambert);
    meshs.push(anelPequeno);

    anelGrande.position.set(0, 5, 0);
    anelMedio.position.set(0, 25, 0);
    anelPequeno.position.set(0, 15, 0);
    
    
     
    anelMedio.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    anelPequeno.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    anelGrande.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

    /*movingUp inicializado a true para quando o botão de mover o anel
    for pressionada ele começar a subir */
    anelGrande.userData = {movingUp: true, movingDown: false, materials: [anelGrandeLambert, anelGrandePhong, anelGrandeToon, anelGrandeNormal]};
    anelMedio.userData = {movingUp: true, movingDown: false, materials: [anelMedioLambert, anelMedioPhong, anelMedioToon, anelMedioNormal]};
    anelPequeno.userData = {movingUp: true, movingDown: false, materials: [anelPequenoLambert, anelPequenoPhong, anelPequenoToon, anelPequenoNormal]};
    scene.add(anelGrande);
    scene.add(anelMedio);
    scene.add(anelPequeno);
}

function createFaixaMobius() {
    const mobiusGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const segments = 200;
    const radius = 9, width = 6;

    for (let i = 0; i <= segments; i++) {
        const t = i / segments * Math.PI * 2;
        const cosT = Math.cos(t);
        const sinT = Math.sin(t);

        for (let j = -1; j <= 1; j += 2) {
            const u = j * width / 2;
            const x = (radius + u * cosT / 2) * cosT;
            const y = (radius + u * cosT / 2) * sinT;
            const z = u * sinT / 2;

            vertices.push(x, y, z);
        }

        if (i < segments) {
            const k = i * 2;
            indices.push(k, k + 1, k + 3);
            indices.push(k, k + 2, k + 3);
        }
    }

    mobiusGeometry.setIndex(indices);
    mobiusGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    mobiusGeometry.computeVertexNormals();

    // Criar e adicionar a faixa de Möbius
    const materialMobius = new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true });
    faixaMobius = new THREE.Mesh(mobiusGeometry, materialMobius); 
    faixaMobius.position.y = 41; 
    faixaMobius.rotation.x = Math.PI/2; 
    scene.add(faixaMobius);
}




//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';

}

///////////////////////
/* ANIMAÇÃO */
///////////////////////


////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    if(moveAnelGrande){
        if(anelGrande.userData.movingUp){
            anelGrande.position.y += 0.25;
            if(anelGrande.position.y >= 37){
                anelGrande.userData.movingUp = false;
                anelGrande.userData.movingDown = true;
            }
        }
        if(anelGrande.userData.movingDown){
            anelGrande.position.y -= 0.25;
            if(anelGrande.position.y <= 3){
                anelGrande.userData.movingUp = true;
                anelGrande.userData.movingDown = false;
            }
        }
    }
    if(moveAnelMedio){
        if(anelMedio.userData.movingUp){
            anelMedio.position.y += 0.25;
            if(anelMedio.position.y >= 37){
                anelMedio.userData.movingUp = false;
                anelMedio.userData.movingDown = true;
            }
        }
        if(anelMedio.userData.movingDown){
            anelMedio.position.y -= 0.25;
            if(anelMedio.position.y <= 3){
                anelMedio.userData.movingUp = true;
                anelMedio.userData.movingDown = false;
            }
        }
    }
    if(moveAnelPequeno){
        if(anelPequeno.userData.movingUp){
            anelPequeno.position.y += 0.25;
            if(anelPequeno.position.y >= 37){
                anelPequeno.userData.movingUp = false;
                anelPequeno.userData.movingDown = true;
            }
        }
        if(anelPequeno.userData.movingDown == true){
            anelPequeno.position.y -= 0.25;
            if(anelPequeno.position.y <= 3){
                anelPequeno.userData.movingUp = true;
                anelPequeno.userData.movingDown = false;
            }
        }
    }

    // Atualiza a rotação das superfícies
    meshs.forEach(mesh => {
        if (mesh.userData.rotationSpeed) {
            mesh.rotateOnAxis(mesh.userData.rotationAxis, mesh.userData.rotationSpeed);
        }
    });

    // CHANGE LIGHTS
    directionalLight.visible = directionalLightOn;
    for (let i = 0; i < 8; i++){
        pontualLights[i].visible = lightsOn[i];
        console.log("lights on: " + lightsOn[i]);
    }

    if (currentShading == 'Gouraud'){
        meshs.forEach(function (mesh) {
            mesh.material = mesh.userData.materials[0];
        });
    } else if (currentShading == 'Phong'){
        meshs.forEach(function (mesh) {
            mesh.material = mesh.userData.materials[1];
        });
    } else if (currentShading == 'Cartoon'){
        meshs.forEach(function (mesh) {
            mesh.material = mesh.userData.materials[2];
        });
    } else if (currentShading == 'NormalMap'){
        meshs.forEach(function (mesh) {
            mesh.material = mesh.userData.materials[3];
        });
    }
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
    cilindro.normalsNeedUpdate = true;
    render();

    update();
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
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

        case 80: //P
        case 112: //p
            for (let i = 0; i < 8; i++){
                lightsOn[i] = !lightsOn[i];
            };
            break;

        case 81: //Q
        case 113: //q
            currentShading = 'Gouraud';
            break;

        case 68: //D
        case 100: //d
            directionalLightOn = !directionalLightOn;
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