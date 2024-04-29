import * as THREE from 'three';

var camera, scene, renderer;

var geometry, material, mesh;

var garra, cable_garra, cable, conjunto_carrinho, topo_grua, topo;

var cameraFrontal, cameraLateral, cameraTopo, cameraFixaOrtogonal, cameraFixaPerspectiva, cameraMovelPerspectiva;

function add_finger(obj, x, y, z) {
    var cub, t, g;
    cub = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    t = new THREE.Mesh(new THREE.TetrahedronGeometry(1), material);
    t.position.set(0, -1, 0);
    t.rotateX(Math.PI/2);
    g = new THREE.Object3D();
    g.add(cub);
    g.add(t);
    g.position.set(x, y, z);
    obj.add(g);
}

function createGarra() {
    'use strict';
    var big_cube;
    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    big_cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material);
    big_cube.position.set(0,0,0);
    garra = new THREE.Object3D();
    garra.add(big_cube);
    add_finger(garra, 2, -3, 2);
    add_finger(garra, -2, -3, 2);
    add_finger(garra, 2, -3, -2);
    add_finger(garra, -2, -3, -2);
    cameraMovelPerspectiva = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // Posicionar a câmera móvel no gancho da grua (supondo que o gancho está em (0, 0, 0))
    cameraMovelPerspectiva.position.set(0, -2.5 , 0); 
    cameraMovelPerspectiva.lookAt(0,cameraMovelPerspectiva.position.y - 1,0); // Apontar para baixo
    garra.add(cameraMovelPerspectiva);

    scene.add(garra);
}

function createConjuntoCarrinho() {
    cable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 32), material);
    cable.position.set(0, 7, 0);
    cable_garra = new THREE.Object3D();
    cable_garra.add(garra);
    cable_garra.add(cable);
    var carrinho = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 20), material);
    carrinho.position.set(0, 15, 0);
    conjunto_carrinho = new THREE.Object3D();
    conjunto_carrinho.add(carrinho);
    conjunto_carrinho.add(cable_garra);
}

function createTopoGrua() {
    var traçao_do_carrinho = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 90), material);
    traçao_do_carrinho.position.set(0, 0, 35);
    var lança = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 60), material);
    lança.position.set(0, 5, 45);
    var contra_lança = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 40), material);
    contra_lança.position.set(0, 0, -30);

    topo_grua = new THREE.Object3D();
    topo_grua.add(traçao_do_carrinho);
    topo_grua.add(lança);
    topo_grua.add(contra_lança);
    topo_grua.position.set(0, 20, 0);
}

function createGrua(x, y, z) {
    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    createGarra();
    createConjuntoCarrinho();
    createTopoGrua();
    topo = new THREE.Object3D();
    topo.add(topo_grua);
    topo.add(conjunto_carrinho);
    scene.add(topo);
}

/* CREATE SCENE*/

function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));
    scene.background = new THREE.Color(0x000000);

    //createTable(0,0,0);
    createGrua(0,0,0);

}

/* CREATE CAMERAS */

function createCameras() {
    'use strict';
    cameraFrontal = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 500);
    cameraFrontal.position.x = 0;
    cameraFrontal.position.y = 0;
    cameraFrontal.position.z = 150;
    cameraFrontal.lookAt(scene.position);
    scene.add(cameraFrontal);

    cameraLateral = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraLateral.position.x = 150;
    cameraLateral.position.y = 0;
    cameraLateral.position.z = 0;
    cameraLateral.lookAt(scene.position);
    scene.add(cameraLateral);

    cameraTopo = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraTopo.position.x = 0;
    cameraTopo.position.y = 150;
    cameraTopo.position.z = 0;
    cameraTopo.lookAt(scene.position);
    scene.add(cameraTopo);

    cameraFixaOrtogonal = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 1000); // ? Não entendi os valores
    cameraFixaOrtogonal.position.x = 120;
    cameraFixaOrtogonal.position.y = 120;
    cameraFixaOrtogonal.position.z = 120;    
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

function onResize() {
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (innerHeight > 0 && innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

/* KEYDOWN */

function onKeyDown(event) {
    switch (event.keyCode) {

        case 70: //F

        case 102: //f
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            break;

        case 65: //A
        case 97: //a
            topo.rotation.y -= 0.1
            break;

        case 81: //Q
        case 113: //q
            topo.rotation.y += 0.1
            break;

        case 87: //w
        case 119: //W
            var translationVector = new THREE.Vector3(0, 0, 0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
            break;

        case 83: //s
        case 115: //S
            var translationVector = new THREE.Vector3(0, 0, -0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
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
            var translationVector = new THREE.Vector3(0, -0.5, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), garra.rotation.y);
            garra.position.add(translationVector);
            cable.scale.y += 0.05;
            translationVector = new THREE.Vector3(0, -0.25, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cable.rotation.y);
            cable.position.add(translationVector);
            break;

        case 68: //D
        case 100: //d
            var translationVector = new THREE.Vector3(0, 0.5, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), garra.rotation.y);
            garra.position.add(translationVector);
            cable.scale.y -= 0.05; 
            translationVector = new THREE.Vector3(0, 0.25, 0);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cable.rotation.y);
            cable.position.add(translationVector);

            break;
    }
}

function render() {
    'use strict';
    renderer.render(scene, camera);
}

function animate(){
    'use strict';
    render();

    requestAnimationFrame(animate);
}

function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);
}

init();

animate();
