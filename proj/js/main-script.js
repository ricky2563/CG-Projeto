import * as THREE from 'three';

var camera, scene, renderer;

var geometry, material, mesh;

var garra, cable_garra, cable, conjunto_carrinho, topo_grua, base_grua;

var contentor;
var cargas;

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
    big_cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material);
    big_cube.position.set(0,0,10);
    garra = new THREE.Object3D();
    garra.add(big_cube);
    add_finger(garra, 2, -3, 12);
    add_finger(garra, -2, -3, 12);
    add_finger(garra, 2, -3, 8);
    add_finger(garra, -2, -3, 8);
    cameraMovelPerspectiva = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // Posicionar a câmera móvel no gancho da grua (supondo que o gancho está em (0, 0, 0))
    cameraMovelPerspectiva.position.set(0, -2.5 , 0); 
    cameraMovelPerspectiva.lookAt(0,cameraMovelPerspectiva.position.y - 1,0); // Apontar para baixo
    garra.position.set(0, -20, 0);
    garra.add(cameraMovelPerspectiva);

    scene.add(garra);
}

function createConjuntoCarrinho() {
    cable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 32), material);
    cable.position.set(0, -13, 10);
    var carrinho = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 20), material);
    carrinho.position.set(0, -5, 10);
    conjunto_carrinho = new THREE.Object3D();
    conjunto_carrinho.add(carrinho);
    conjunto_carrinho.add(cable);
    conjunto_carrinho.add(garra);
    conjunto_carrinho.position.z = 10;
}


function createTetrahedron(obj, radius){
    var vertices = [
        new THREE.Vector3(0, 40, -10),
        new THREE.Vector3(-10, 0, -10),
        new THREE.Vector3(10, 0, -10),
        new THREE.Vector3(0, 0, 10)
    ];
    var indices = [ 0,  1,  2,   0,  2,  3,    0,  3,  1,    1,  3,  2];
    geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(vertices);
    geometry.setIndex(indices);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    obj.add(mesh)
    
}

function createTirant(obj, radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, rotation, x, y, z){

    // Create geometry for the cylinder
    var material1 = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
    geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded);

    // Create the cylinder mesh
    var tirant = new THREE.Mesh(geometry, material1);
    tirant.rotateOnAxis(new THREE.Vector3(1, 0, 0), rotation);
    tirant.position.set(x, y, z);
    obj.add(tirant);
}

function createTopoGrua() {
    var traçao_do_carrinho = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 90), material);
    traçao_do_carrinho.position.set(0, 0, 35);
    var lança = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 60), material);
    lança.position.set(0, 5, 45);
    var contra_lança = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 40), material);
    contra_lança.position.set(0, 0, -30);
    var contra_peso = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 30), material);
    contra_peso.position.set(0, -8, -30);
    var cabinete = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 20), material);
    cabinete.position.set(0, -8, 0);

    topo_grua = new THREE.Object3D();
    topo_grua.add(traçao_do_carrinho);
    topo_grua.add(lança);
    topo_grua.add(contra_lança);
    topo_grua.add(contra_peso);
    topo_grua.add(cabinete);

    createTetrahedron(topo_grua, 20);
    createTirant(topo_grua, 0.5, 0.5, 56, 32, 32, false, -Math.PI/2.9, 0, 23, 17);
    createTirant(topo_grua, 0.5, 0.5, 38, 32, 32, false, Math.PI/6, 0, 20, -19);
    topo_grua.add(conjunto_carrinho)
    topo_grua.position.set(0, 85, 0);
    scene.add(topo_grua);
}

function createBaseGrua() {
    var base = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 30), material);
    base.position.set(0, 5, 0);
    var suporte = new THREE.Mesh(new THREE.BoxGeometry(20, 65, 20), material);
    suporte.position.set(0, 40, 0);
    base_grua = new THREE.Object3D();
    base_grua.add(base);
    base_grua.add(suporte);
    scene.add(base_grua);

}

function createGrua() {
    material = new THREE.MeshBasicMaterial({ color: 0x7d7d7d, wireframe: true });  // NÂO SEI SE PORQUE MAS NÃO ESTÁ A MUDAR
    createGarra();
    createConjuntoCarrinho();
    createTopoGrua();
    createBaseGrua();
}

function createContentorCargas() {
    var carga1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3, 1), new THREE.MeshBasicMaterial( { color: 0x08080, wireframe: true } ));
    carga1.position.set(77, 2, 50);
    scene.add(carga1);
    var carga2 = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 0), new THREE.MeshBasicMaterial( { color: 0x00080, wireframe: true } ));
    carga2.position.set(-77, 2, 30);
    scene.add(carga2);
    var carga3 = new THREE.Mesh(new THREE.TorusKnotGeometry( 1, 0.4, 100, 2 ), new THREE.MeshBasicMaterial( { color: 0x08000, wireframe: true } ));
    carga3.position.set(57, 2, -44);
    scene.add(carga3);
    var carga4 = new THREE.Mesh(new THREE.TorusGeometry(1, 1, 12, 48), new THREE.MeshBasicMaterial( { color: 0xff70cb, wireframe: true } ));
    carga4.position.set(-47, 2, -34);
    scene.add(carga4);
    
    cargas = [carga1, carga2, carga3, carga4];

    var color = new THREE.MeshBasicMaterial({ color: 0xf97306 , wireframe: true});

    // Create planes for each side except the top
    var plane1 = new THREE.Mesh(new THREE.PlaneGeometry(15, 30), color); //laranja
    plane1.rotation.set(-Math.PI / 2, 0, 0); // Bottom
    plane1.position.set(37.5, 0, -30);
    scene.add(plane1);

    var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.MeshBasicMaterial({ color: 0xffff00 , wireframe: true})); //amarelo
    plane2.rotation.set(0, 0, 0); // Front
    plane2.position.set(37.5, 5, -15);
    scene.add(plane2);

    var plane3 = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true  })); //rosa
    plane3.rotation.set(0, Math.PI / 2, 0); // Left
    plane3.position.set(45, 5, -30);
    scene.add(plane3);

    var plane4 = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), new THREE.MeshBasicMaterial({ color: 0x00ff00 , wireframe: true})); //verde
    plane4.rotation.set(0, Math.PI / 2, 0); // Right
    plane4.position.set(30, 5, -30);
    scene.add(plane4);

    var plane5 = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })); //azul
    plane5.rotation.set(0, 0, 0); // Front
    plane5.position.set(37.5, 5, -45);
    scene.add(plane5);

    contentor = [plane1, plane2, plane3, plane4, plane5];

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

/* CREATE CAMERAS */

function createCameras() {
    'use strict';
    cameraFrontal = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 500);
    cameraFrontal.position.x = 0;
    cameraFrontal.position.y = 100;
    cameraFrontal.position.z = 170;
    cameraFrontal.lookAt(scene.position);
    scene.add(cameraFrontal);

    cameraLateral = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraLateral.position.x = 170;
    cameraLateral.position.y = 100;
    cameraLateral.position.z = 0;
    cameraLateral.lookAt(scene.position);
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


/* CREATE LIGHT(S) */

/* CREATE OBJECT3D(S) */

/* CHECK COLLISIONS */

/* HANDLE COLLISIONS */

/* UPDATE */

/* DISPLAY */

/* INITIALIZE ANIMATION CYCLE */

/* ANIMATION CYCLE */

/* RESIZE WINDOW CALLBACK */

function onResize() {
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (innerHeight > 0 && innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

/* KEY DOWN CALLBACK */
// TODO: verificar posição x e y para ver se é a carga em que estamos em cima
function checkColisao() {
    var colisao = false;
    var limiteCarga = 0;

    var garraPosicaoRelativa = new THREE.Vector3();
    garra.getWorldPosition(garraPosicaoRelativa);
    base_grua.worldToLocal(garraPosicaoRelativa);
    var limiteGarra = garraPosicaoRelativa.y - (garra.scale.y / 2) - 3.5; //posição relativa à base,- a posição y da base(0.5), - a alturra dos dedos (3), - espaço do centro da garra ao seu limite
    console.log("Posição relativa da garra:", garraPosicaoRelativa);
    console.log("limiteGarra: " + limiteGarra + " limiteCarga: " );
    for (var i = 0; i < cargas.length; i++) {
        limiteCarga = cargas[i].position.y + (cargas[i].scale.y / 2);
        console.log(limiteCarga);
        if (limiteGarra <= limiteCarga) {
            console.log("Colisao");
            colisao = true;
            break;
        }
    }
    return colisao;
}

/* KEYDOWN */

function onKeyDown(event) {
    switch (event.keyCode) {

        case 55: // Tecla '7' - Wireframe
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            break;

        case 65: //A
        case 97:obj.add(mesh) //a
            topo_grua.rotation.y -= 0.1
            break;

        case 81: //Q
        case 113: //q
            topo_grua.rotation.y += 0.1
            break;

        case 87: //w
        case 119: //W
            if (conjunto_carrinho.position.z >=58) { 
                break; }
            var translationVector = new THREE.Vector3(0, 0, 0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
            break;

        case 83: //s
        case 115: //S
            if (conjunto_carrinho.position.z <= 10) { 
                break; }
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
            if(garra.position.y <= -50) { 
                checkColisao();
            }
            if (garra.position.y <= -60) { 
                break; }
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
            console.log(garra.position.y);
            if (garra.position.y >= 10) { 
                break; }
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
