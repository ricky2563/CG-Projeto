import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var camera, scene, renderer;

var geometry, material, mesh;

var garra = new THREE.Object3D(), cable_garra, cable, conjunto_carrinho, topo_grua, base_grua = new THREE.Object3D(), finger_1, finger_2, finger_3, finger_4;

var contentor = new THREE.Object3D();
var cargas;
var cargaMover = new THREE.Object3D;

var cameraFrontal, cameraLateral, cameraTopo, cameraFixaOrtogonal, cameraFixaPerspectiva, cameraMovelPerspectiva;

var boundingBoxGarra, boundingBoxes;

var cabineDireita = false, cabineEsquerda = false, carrinhoIn = false, carrinhoOut = false, 
    garraAbre, garraFecha = false, garraDesce = false, garraSobe = false, colisao = false;

var activeKeys = [];

var materials = [];

function createTetrahedron(obj, vertices, x, y, z, tetrahedron_material){

    var indices = [ 0,  1,  2,   0,  2,  3,    0,  3,  1,    1,  3,  2];
    geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(vertices);
    geometry.setIndex(indices);
    mesh = new THREE.Mesh(geometry, tetrahedron_material);
    mesh.position.set(x, y, z);
    obj.add(mesh)
    
}

function add_finger(obj, x, y, z, finger) {
    var cub;
    var finger_cube_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(finger_cube_material);
    cub = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), finger_cube_material);
    var vertices = [
        new THREE.Vector3(0, -2, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(-0.5, 0, -0.5)
    ];
    var finger_claw_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(finger_claw_material);
    createTetrahedron(finger, vertices, 0, -0.5, 0, finger_claw_material);
    finger.add(cub);
    finger.position.set(x, y, z);
    obj.add(finger);

}

function createGarra() {
    'use strict';
    var big_cube;
    var big_cube_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(big_cube_material);
    big_cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), big_cube_material);
    big_cube.position.set(0,0,0);
    garra.add(big_cube);
    finger_1 = new THREE.Object3D();
    finger_2 = new THREE.Object3D();
    finger_3 = new THREE.Object3D();
    finger_4 = new THREE.Object3D();
    add_finger(garra, 2, -3, 2, finger_1);
    add_finger(garra, -2, -3, 2, finger_2);
    add_finger(garra, 2, -3, -2, finger_3);
    add_finger(garra, -2, -3, -2, finger_4);
    cameraMovelPerspectiva = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // Posicionar a câmera móvel no gancho da grua (supondo que o gancho está em (0, 0, 0))
    cameraMovelPerspectiva.position.set(0, -2.5 , 0); 
    cameraMovelPerspectiva.lookAt(0,cameraMovelPerspectiva.position.y - 1,0); // Apontar para baixo
    garra.position.set(0, -20, 10);
    garra.add(cameraMovelPerspectiva);
    const box = new THREE.Box3();

    boundingBoxGarra = new THREE.Box3().setFromObject(garra);

    scene.add(garra);
}

function createConjuntoCarrinho() {
    var cable_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(cable_material);
    var carrinho_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(carrinho_material);
    cable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 32), cable_material);
    cable.position.set(0, -13, 10);
    var carrinho = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 20), carrinho_material);
    carrinho.position.set(0, -5, 10);
    conjunto_carrinho = new THREE.Object3D();
    conjunto_carrinho.add(carrinho);
    conjunto_carrinho.add(cable);
    conjunto_carrinho.add(garra);
    conjunto_carrinho.position.z = 10;
}

function createTirant(obj, radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, rotation, x, y, z){

    // Create geometry for the cylinder
    var material_tirant = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);

    // Create the cylinder mesh
    var tirant = new THREE.Mesh(geometry, material_tirant);
    tirant.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotation);
    tirant.position.set(x, y, z);
    obj.add(tirant);
}

function createTopoGrua() {
    var material_traçao_do_carrinho = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(material_traçao_do_carrinho);
    var material_lança = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(material_lança);
    var material_contra_lança = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(material_contra_lança);
    var material_contra_peso = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(material_contra_peso);
    var material_cabinete = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(material_cabinete);
    var traçao_do_carrinho = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 90), material_traçao_do_carrinho);
    traçao_do_carrinho.position.set(0, 0, 35);
    var lança = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 60), material_lança);
    lança.position.set(0, 5, 45);
    var contra_lança = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 40), material_contra_lança);
    contra_lança.position.set(0, 0, -30);
    var contra_peso = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 30), material_contra_peso);
    contra_peso.position.set(0, -8, -30);
    var cabinete = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), material_cabinete);
    cabinete.position.set(0, -8, 0);

    topo_grua = new THREE.Object3D();
    topo_grua.add(traçao_do_carrinho);
    topo_grua.add(lança);
    topo_grua.add(contra_lança);
    topo_grua.add(contra_peso);
    topo_grua.add(cabinete);
    var vertices = [
        new THREE.Vector3(0, 40, -10),
        new THREE.Vector3(-10, 0, -10),
        new THREE.Vector3(10, 0, -10),
        new THREE.Vector3(0, 0, 10)
    ];
    var porta_lança_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(porta_lança_material);
    createTetrahedron(topo_grua, vertices, 0, 0, 0, porta_lança_material);
    createTirant(topo_grua, 0.5, 0.5, 56, 32, 32, false, -Math.PI/2.9, 0, 23, 17);
    createTirant(topo_grua, 0.5, 0.5, 38, 32, 32, false, Math.PI/6, 0, 20, -19);
    topo_grua.add(conjunto_carrinho)
    topo_grua.position.set(0, 85, 0);
    scene.add(topo_grua);
}

function createBaseGrua() {
    var base_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(base_material);
    var suporte_material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    materials.push(suporte_material);
    var base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 30), base_material);
    base.position.set(0, 5, 0);
    var suporte = new THREE.Mesh(new THREE.BoxGeometry(20, 65, 20), suporte_material);
    suporte.position.set(0, 40, 0);
    base_grua.add(base);
    base_grua.add(suporte);
    scene.add(base_grua);

}

function createGrua() {
    createGarra();
    createConjuntoCarrinho();
    createTopoGrua();
    createBaseGrua();
}

function createContentorCargas() {
    var carga1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3, 1), new THREE.MeshBasicMaterial( { color: 0x08080, wireframe: true } ));
    carga1.position.set(77, 2, 50);
    carga1.userData = { movingUp: false, movingForward: false, movingDown: false, movingLeft: false, movingBackUp: false};
    scene.add(carga1);
    var carga2 = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 0), new THREE.MeshBasicMaterial( { color: 0x00080, wireframe: true } ));
    carga2.position.set(-77, 2, 30);
    carga2.userData = { movingUp: false, movingForward: false, movingDown: false, movingLeft: false, movingBackUp: false};
    scene.add(carga2);
    var carga3 = new THREE.Mesh(new THREE.TorusKnotGeometry( 1, 0.4, 100, 2 ), new THREE.MeshBasicMaterial( { color: 0x08000, wireframe: true } ));
    carga3.position.set(57, 2, -44);
    carga3.userData = { movingUp: false, movingForward: false, movingDown: false, movingLeft: false, movingBackUp: false};
    scene.add(carga3);
    var carga4 = new THREE.Mesh(new THREE.TorusGeometry(1, 1, 12, 48), new THREE.MeshBasicMaterial( { color: 0xff70cb, wireframe: true } ));
    carga4.position.set(0, 2, 54);
    carga4.userData = { movingUp: false, movingForward: false, movingDown: false, movingLeft: false, movingBackUp: false};
    scene.add(carga4);
    
    cargas = [carga1, carga2, carga3, carga4];
    boundingBoxes = [];
    for(var i = 0; i < cargas.length; i++){
        boundingBoxes[i] = new THREE.Box3().setFromObject(cargas[i]);
    }

    var color = new THREE.MeshBasicMaterial({ color: 0xf97306 , wireframe: true});

    // Create planes for each side except the top
    var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(15, 30), color); //laranja
    plane1.rotation.set(-Math.PI / 2, 0, 0); // Bottom
    plane1.position.set(37.5, 0, -30);
   // scene.add(plane1);

    var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.MeshBasicMaterial({ color: 0xffff00 , wireframe: true})); //amarelo
    plane2.rotation.set(0, 0, 0); // Front
    plane2.position.set(37.5, 5, -15);
    //scene.add(plane2);

    var plane3 = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true  })); //rosa
    plane3.rotation.set(0, Math.PI / 2, 0); // Left
    plane3.position.set(45, 5, -30);
    //scene.add(plane3);

    var plane4 = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), new THREE.MeshBasicMaterial({ color: 0x00ff00 , wireframe: true})); //verde
    plane4.rotation.set(0, Math.PI / 2, 0); // Right
    plane4.position.set(30, 5, -30);
    //scene.add(plane4);

    var plane5 = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })); //azul
    plane5.rotation.set(0, 0, 0); // Front
    plane5.position.set(37.5, 5, -45);
    //scene.add(plane5);

    contentor.add(plane1);
    contentor.add(plane2);
    contentor.add(plane3);
    contentor.add(plane4);
    contentor.add(plane5);
    contentor.position.set(0, 0, 30);
    scene.add(contentor);

}

function createChao() {
    var chao = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ color: 0xff1299, wireframe: true}));  
    chao.rotation.set(-Math.PI / 2, 0, 0); // Bottom
    chao.position.set(37.5, 0, -30);
    scene.add(chao);
}

/* CREATE SCENE*/

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));
    scene.background = new THREE.Color(0xffffff);

    //createTable(0,0,0);
    createGrua();
    createContentorCargas();
    createChao();    

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCameras() {
    'use strict';
    cameraFrontal = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 500);
    cameraFrontal.position.x = 0;
    cameraFrontal.position.y = 50;
    cameraFrontal.position.z = 80;
    cameraFrontal.lookAt(new THREE.Vector3(0, 50, 0));
    scene.add(cameraFrontal);

    cameraLateral = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraLateral.position.x = 80;
    cameraLateral.position.y = 50;
    cameraLateral.position.z = 0;
    cameraLateral.lookAt(new THREE.Vector3(0, 50, 0));
    scene.add(cameraLateral);

    cameraTopo = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraTopo.position.x = 0;
    cameraTopo.position.y = 170;
    cameraTopo.position.z = 0;
    cameraTopo.lookAt(scene.position);
    scene.add(cameraTopo);
    // TODO: Mudar para (170, 170, 170) (mudei para ajudar a ver a colisão)
    cameraFixaOrtogonal = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 1000); // ? Não entendi os valores
    cameraFixaOrtogonal.position.x = 170;
    cameraFixaOrtogonal.position.y = 170;
    cameraFixaOrtogonal.position.z = 170;    
    cameraFixaOrtogonal.lookAt(scene.position);
    scene.add(cameraFixaOrtogonal);

    cameraFixaPerspectiva = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraFixaPerspectiva.position.x = cameraFixaOrtogonal.position.x;
    cameraFixaPerspectiva.position.y = cameraFixaOrtogonal.position.y;
    cameraFixaPerspectiva.position.z = cameraFixaOrtogonal.position.z;    
    cameraFixaPerspectiva.lookAt(scene.position);
    scene.add(cameraFixaPerspectiva);


    camera = cameraFixaPerspectiva;
}


/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
    'use strict';
    if (colisao){return;}
    boundingBoxGarra.setFromObject(garra);
    for (var i = 0; i < cargas.length; i++) {
        boundingBoxes[i].setFromObject(cargas[i]);

        if (boundingBoxGarra.intersectsBox(boundingBoxes[i])) {
            colisao = true;
            
            
            garra.add(cargas[i]);
            var cargaPosicaoRelativa = new THREE.Vector3();
            garra.getWorldPosition(cargaPosicaoRelativa);
            var worldPosition = garra.worldToLocal(cargaPosicaoRelativa);
            worldPosition.y -= 5;
            
            cargas[i].position.set(worldPosition.x, worldPosition.y, worldPosition.z);
            cargaMover=cargas[i];
            cargaMover.userData.movingUp = true;
            break;
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';
            
    if (cargaMover.userData.movingUp == true || cargaMover.userData.movingBackUp == true ) {
        garraSobe = true;
        if (garra.position.y > -60) {
            garraSobe = false;
            if (cargaMover.userData.movingUp == true){
                cargaMover.userData.movingUp = false;
                cargaMover.userData.movingForward = true;
            } else {
                cargaMover.userData.movingBackUp = false; 
                colisao = false;
            }
        }
    }
    if (cargaMover.userData.movingForward == true) {
        carrinhoIn = true;
        var worldPosition = new THREE.Vector3();
        garra.getWorldPosition(worldPosition);

        var distanceToOrigin = worldPosition.distanceTo(new THREE.Vector3(0, 0, 0));
        if (distanceToOrigin < 50) {
            carrinhoIn = false;
            cargaMover.userData.movingForward = false;
            cargaMover.userData.movingLeft = true;
        }
    }
    if (cargaMover.userData.movingLeft == true) {
        console.log('esquerda');
        cabineEsquerda = true;
        var contentorPosition = new THREE.Vector3();
        contentor.getWorldPosition(contentorPosition);

        var worldPosition = new THREE.Vector3();
        garra.getWorldPosition(worldPosition);

        console.log("garra world " +worldPosition.x + ", " + worldPosition.y + ", " + worldPosition.z)
        var distance = worldPosition.distanceTo(contentorPosition);

        if (distance < 59 && distance > 57 && worldPosition.x > 0) {
            console.log(distance);

            cabineEsquerda = false;
            cargaMover.userData.movingLeft = false;
            cargaMover.userData.movingDown = true;
        }
    }
    if (cargaMover.userData.movingDown == true) { 
        garraDesce = true;
        if (garra.position.y < -70) {
            garraDesce = false;
            cargaMover.userData.movingDown = false;
            garra.remove(cargaMover);
            cargaMover.userData.movingBackUp = true;
        }
    }
}


////////////
/* UPDATE */
////////////
function update(){
    'use strict';
    if(carrinhoOut){
        if (conjunto_carrinho.position.z < 58) { // carrinho não passa dos limites
            var translationVector = new THREE.Vector3(0, 0, 0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
        }
        if (colisao){
            carrinhoOut = false;
        }
    }

    if (carrinhoIn){
        if (conjunto_carrinho.position.z > 10) { 
            var translationVector = new THREE.Vector3(0, 0, -0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
        }
        if (colisao){
            carrinhoIn = false;
        }
    }
    if (cabineDireita){
        topo_grua.rotation.y += 0.02*Math.PI;
    }
    if (cabineEsquerda) {
        topo_grua.rotation.y -= 0.02*Math.PI;
        if (colisao){
            cabineEsquerda = false;
        }
    }
    if (garraDesce) {
        var garraPosicaoRelativa = new THREE.Vector3();
        garra.getWorldPosition(garraPosicaoRelativa);
        base_grua.worldToLocal(garraPosicaoRelativa);
        if(garraPosicaoRelativa.y > 5) { 
            var translationVector = new THREE.Vector3(0, -0.5, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), garra.rotation.y);
            garra.position.add(translationVector);
            cable.scale.y += 0.05;
            translationVector = new THREE.Vector3(0, -0.25, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cable.rotation.y);
            cable.position.add(translationVector);
        }
    }
    if (garraSobe) {
        var garraPosicaoRelativa = new THREE.Vector3();
        garra.getWorldPosition(garraPosicaoRelativa);
        base_grua.worldToLocal(garraPosicaoRelativa);
        if (garraPosicaoRelativa.y < 75) { 
            var translationVector = new THREE.Vector3(0, 0.5, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), garra.rotation.y);
            garra.position.add(translationVector);
            cable.scale.y -= 0.05; 
            translationVector = new THREE.Vector3(0, 0.25, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cable.rotation.y);
            cable.position.add(translationVector);
        }
        if (colisao){
            garraSobe = false;
        }
    }

    if (garraAbre) {

        if(finger_1.children[0].position.y < -0.501) {
            moveFinger(finger_1, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); 
        }

        if(finger_2.children[0].position.y > -0.499) {
            moveFinger(finger_2, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1);     
        }

        if(finger_3.children[0].position.y < -0.501) {
            moveFinger(finger_3, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); 
        }
        
        if(finger_4.children[0].position.y > -0.499) {
            moveFinger(finger_4, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1);
        }

    } 
    
    if (garraFecha) {
        if(finger_1.children[0].position.y > -0.505) {
            moveFinger(finger_1, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); 
        }

        if(finger_2.children[0].position.y < -0.496) {
            moveFinger(finger_2, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1);     
        }

        if(finger_3.children[0].position.y > -0.505) {
            moveFinger(finger_3, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); 
        }
        
        if(finger_4.children[0].position.y < -0.496) {
            moveFinger(finger_4, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1);
        }
    }  
    
    // Função para mover um dedo da garra para uma nova posição
    function moveFinger(finger, currentPosition, targetPosition, speed) {
        if (finger.children[0].position.z < 58) { 
            var direction = targetPosition.clone().sub(currentPosition).normalize();
            var angle = currentPosition.angleTo(targetPosition);
            var axis = new THREE.Vector3(0, 0, 1);
            
            direction.applyAxisAngle(axis, angle * speed);
            var displacement = direction.clone().multiplyScalar(speed);
            finger.children[0].position.add(displacement);
            var quaternion = new THREE.Quaternion();
            quaternion.setFromUnitVectors(currentPosition.normalize(), targetPosition.normalize());
            finger.children[0].applyQuaternion(quaternion);
        
        }
    }
    checkCollisions();
    if (colisao){
        handleCollisions();
    
    }

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
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
    createCameras();

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate(){
    'use strict';
    render();

    requestAnimationFrame(animate);
    update();

    updateHUDKeysText(activeKeys);
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

        case 55: // Tecla '7' - Wireframe
            materials.forEach(function (material) {
                material.wireframe = !material.wireframe;
            });
            break;

        case 65: //A
        case 97: //a
            if (!activeKeys.includes('A')){
                activeKeys.push('A');
            }
            cabineEsquerda = true;
            break;

        case 81: //Q
        case 113: //q
            if (!activeKeys.includes('Q')){
                activeKeys.push('Q');
            }
            cabineDireita = true;
            break;

        case 87: //w
        case 119: //W
            if (!activeKeys.includes('W')){
                activeKeys.push('W');
            }
            carrinhoOut = true;
            break;

        case 83: //s
        case 115: //S
            if (!activeKeys.includes('S')){
                activeKeys.push('S');
            }
            carrinhoIn = true;
            break;

        case 49: // Tecla '1' - Câmera frontal
            renderer.render(scene, cameraFrontal);
            camera = cameraFrontal;
            break;
        case 50: // Tecla '2' - Câmera lateral
            renderer.render(scene, cameraLateral);
            camera = cameraLateral;
            break;
        case 51: // Tecla '3' - Câmera topo
            renderer.render(scene, cameraTopo);
            camera = cameraTopo;
            break;
        case 52: // Tecla '4' - Câmera fixa ortogonal
            renderer.render(scene, cameraFixaOrtogonal);
            camera = cameraFixaOrtogonal;
            break;
        case 53: // Tecla '5' - Câmera fixa perspectiva
            renderer.render(scene, cameraFixaPerspectiva);
            camera = cameraFixaPerspectiva;
            break;
        case 54: // Tecla '6' - Câmera móvel perspectiva
            renderer.render(scene, cameraMovelPerspectiva);
            camera = cameraMovelPerspectiva;
            break;
        case 69: //E
        case 101: //e
            if (!activeKeys.includes('E')){
                activeKeys.push('E');
            }
            garraDesce = true;
            break;

        case 68: //D
        case 100: //d
            if (!activeKeys.includes('D')){
                activeKeys.push('D');
            }
            garraSobe = true;
            break;

        case 82: //R
        case 114: //r
            if (!activeKeys.includes('R')){
                activeKeys.push('R');
            }
            garraAbre = true;
            break;

        case 70: //F
        case 102: //f
            if (!activeKeys.includes('F')){
                activeKeys.push('F');
            }
            garraFecha = true;
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e){
    'use strict';
    switch (e.keyCode) {

        case 65: //A
        case 97: //a
            activeKeys.splice(activeKeys.indexOf('A'), 1);
            cabineEsquerda = false;
            break;

        case 81: //Q
        case 113: //q
            activeKeys.splice(activeKeys.indexOf('Q'), 1);
            cabineDireita = false;
            break;

        case 87: //w
        case 119: //W
            activeKeys.splice(activeKeys.indexOf('W'), 1);
            carrinhoOut = false;
            break;

        case 83: //s
        case 115: //S
            activeKeys.splice(activeKeys.indexOf('S'), 1);
            carrinhoIn = false;
            break;

        case 69: //E
        case 101: //e
            activeKeys.splice(activeKeys.indexOf('E'), 1);
            garraDesce = false;
            break;

        case 68: //D
        case 100: //d
            activeKeys.splice(activeKeys.indexOf('D'), 1);
            garraSobe = false;
            break;
        
        case 82: //R
        case 114: //r
            activeKeys.splice(activeKeys.indexOf('R'), 1);
            garraAbre = false;
            break;

        case 70: //F
        case 102: //f
            activeKeys.splice(activeKeys.indexOf('F'), 1);
            garraFecha = false;
            break;
        
    }

}

var hudCamera = new THREE.OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);

// Elementos do HUD
var hudElements = [];

// Função para adicionar elementos ao HUD
function addHUDElement(element) {
    hudElements.push(element);
    updateHUD();
}

// Função para atualizar o HUD
function updateHUD() {
    hudElements.forEach(function(element, index) {
        element.style.position = 'absolute';
        element.style.top = 20 + index * 30 + 'px'; // Espaçamento vertical entre elementos
        element.style.left = '20px'; // Posição horizontal fixa
        document.body.appendChild(element);
    });
}

// Exemplo de elemento do HUD para teclas ativas
var hudKeysText = document.createElement('div');
hudKeysText.textContent = 'Teclas ativas: Nenhuma';
addHUDElement(hudKeysText);

// Função para atualizar o texto do HUD com as teclas ativas
function updateHUDKeysText(activeKeys) {
    hudKeysText.textContent = 'Teclas ativas: ' + activeKeys.join(', ');
}

init();

animate();
