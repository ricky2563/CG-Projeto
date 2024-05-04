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

var garra, cable_garra, cable, conjunto_carrinho, topo_grua, base_grua, finger_1, finger_2, finger_3, finger_4;

var contentor;
var cargas;

var cameraFrontal, cameraLateral, cameraTopo, cameraFixaOrtogonal, cameraFixaPerspectiva, cameraMovelPerspectiva;

var boundingBoxGarra, boundingBoxes;

var cabineDireita, cabineEsquerda, carrinhoIn, carrinhoOut, garraAbre = false, garraFecha, garraDesce, garraSobe = false;

function add_finger(obj, x, y, z, finger) {
    var cub, t;
    cub = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
    t = new THREE.Mesh(new THREE.TetrahedronGeometry(1), material);
    t.position.set(0, -1, 0);
    t.rotateX(Math.PI/2);
    finger = new THREE.Object3D();
    finger.add(cub);
    finger.add(t);
    finger.position.set(x, y, z);
    obj.add(finger);

    if (finger_1 === undefined) {
        finger_1 = finger;
    } else if (finger_2 === undefined) {
        finger_2 = finger;
    } else if (finger_3 === undefined) {
        finger_3 = finger;
    } else if (finger_4 === undefined) {
        finger_4 = finger;
    }
}

function createGarra() {
    'use strict';
    var big_cube;
    big_cube = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), material);
    big_cube.position.set(0,0,10);
    garra = new THREE.Object3D();
    garra.add(big_cube);
    add_finger(garra, 2, -3, 12, finger_1);
    add_finger(garra, -2, -3, 12, finger_2);
    add_finger(garra, 2, -3, 8, finger_3);
    add_finger(garra, -2, -3, 8, finger_4);
    cameraMovelPerspectiva = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    // Posicionar a câmera móvel no gancho da grua (supondo que o gancho está em (0, 0, 0))
    cameraMovelPerspectiva.position.set(0, -2.5 , 0); 
    cameraMovelPerspectiva.lookAt(0,cameraMovelPerspectiva.position.y - 1,0); // Apontar para baixo
    garra.position.set(0, -20, 0);
    garra.add(cameraMovelPerspectiva);
    const box = new THREE.Box3();

    boundingBoxGarra = new THREE.Box3().setFromObject(garra);

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

    contentor = new THREE.Object3D();
    contentor.add(plane1);
    contentor.add(plane2);
    contentor.add(plane3);
    contentor.add(plane4);
    contentor.add(plane5);
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
    cameraFrontal.position.y = 100;
    cameraFrontal.position.z = 170;
    cameraFrontal.lookAt(scene.position);
    scene.add(cameraFrontal);

    cameraLateral = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    cameraLateral.position.x = 80;
    cameraLateral.position.y = 80;
    cameraLateral.position.z = 100;
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

    boundingBoxGarra.setFromObject(garra);
    for (var i = 0; i < cargas.length; i++) {
        boundingBoxes[i].setFromObject(cargas[i]);

        if (boundingBoxGarra.intersectsBox(boundingBoxes[i])) {
            console.log("Colisão detectada!");
            handleCollisions(cargas[i]);
            break;
        }
    }
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(carga){
    'use strict';

    // Calcula o vetor de direção entre a carga e o contentor
    var direction = new THREE.Vector3().subVectors(contentor.position, carga.position).normalize();

    // Configura o tempo de duração da animação
    var duration = 5000; // Duração da animação em milissegundos
    var startTime = Date.now();
    console.log("transportarCarga");
    garra.add(carga);
    var translationVector = new THREE.Vector3(0, 0.5, 0);
    translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), garra.rotation.y);
    garra.position.add(translationVector);
    cable.scale.y -= 1.05; 
    translationVector = new THREE.Vector3(0, 0.25, 0);
    translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cable.rotation.y);
    cable.position.add(translationVector);

    // Função de animação que será chamada a cada quadro
    function animate() {
        var now = Date.now();
        var elapsedTime = now - startTime;
        if (elapsedTime < duration) {
            // Calcula a posição intermediária usando .lerp()
            var t = elapsedTime / duration;
            carga.position.lerpVectors(carga.position, contentor.position, t);
            // Requer outro quadro para continuar a animação
            requestAnimationFrame(animate);
        } else {
            // Animação concluída, faça algo se necessário
            garra.remove(carga);
            console.log("Transporte concluído!");
        }
    }

    // Inicia a animação
    animate();

    /*function transportarCarga(carga) {
        // Número de translações desejadas
        var numeroDeTranslacoes = 2;
        // Contador de translações realizadas
        var translacoesRealizadas = 0;
    
        // Configura o tempo de duração da animação de translação
        var durationTranslacao = 5000; // Duração da animação em milissegundos
        var startTimeTranslacao = Date.now();
    
        console.log("transportarCarga");
    
        // Função de animação de translação que será chamada a cada quadro
        function animateTranslacao() {
            var now = Date.now();
            var elapsedTime = now - startTimeTranslacao;
            if (elapsedTime < durationTranslacao && translacoesRealizadas < numeroDeTranslacoes) {
                // Calcula a posição intermediária usando .lerp()
                var t = elapsedTime / durationTranslacao;
                carga.position.lerpVectors(carga.position, contentor.position, t);
                // Requer outro quadro para continuar a animação
                requestAnimationFrame(animateTranslacao);
            } else {
                // Translação concluída, faça algo se necessário
                // Verificar se ainda é necessário girar a grua
                if (translacoesRealizadas < numeroDeTranslacoes) {
                    translacoesRealizadas++;
                    // Realize a translação novamente se ainda houver translações restantes
                    startTimeTranslacao = Date.now();
                    requestAnimationFrame(animateTranslacao);
                } else {
                    // Iniciar rotação da grua em direção ao contentor
                    iniciarRotacaoGrua();
                }
            }
        }
    
        // Inicia a animação de translação
        animateTranslacao();
    }
    
    // Função para iniciar a rotação da grua em direção ao contentor
    function iniciarRotacaoGrua() {
        // Aqui você pode adicionar a lógica para iniciar a rotação da grua
        // por exemplo:
        // var anguloAlvo = ...; // Calcular o ângulo necessário para a grua girar em direção ao contentor
        // grua.rotation.y = anguloAlvo; // Definir o ângulo da rotação da grua diretamente
    
        console.log("Iniciando rotação da grua");
    }
*/    
}



////////////
/* UPDATE */
////////////
function update(){
    'use strict';

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
    if(carrinhoOut){
        if (conjunto_carrinho.position.z < 58) { // carrinho não passa dos limites
            var translationVector = new THREE.Vector3(0, 0, 0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
        }
    }

    if (carrinhoIn){
        if (conjunto_carrinho.position.z > 10) { 
            var translationVector = new THREE.Vector3(0, 0, -0.5);
            translationVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), conjunto_carrinho.rotation.y);
            conjunto_carrinho.position.add(translationVector);
        }
    }
    if (cabineDireita){
        topo_grua.rotation.y += 0.1
    }
    if (cabineEsquerda) {
        topo_grua.rotation.y -= 0.1
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
    }

    if (garraAbre) {
        moveFinger(finger_1, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); // Move finger_3 de sua posição atual para uma nova posição
        moveFinger(finger_2, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); // Move finger_4 de sua posição atual para uma nova posição
        moveFinger(finger_3, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); // Move finger_1 de sua posição atual para uma nova posição
        moveFinger(finger_4, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); // Move finger_2 de sua posição atual para uma nova posição
    } 
    
    if (garraFecha) {
        moveFinger(finger_1, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); // Move finger_2 de sua posição atual para uma nova posição
        moveFinger(finger_2, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); // Move finger_1 de sua posição atual para uma nova posição
        moveFinger(finger_3, new THREE.Vector3(-2, -3, 0.2), new THREE.Vector3(-3, -3, 0.2), 0.1); // Move finger_4 de sua posição atual para uma nova posição
        moveFinger(finger_4, new THREE.Vector3(2, -3, 0.2), new THREE.Vector3(3, -3, 0.2), 0.1); // Move finger_3 de sua posição atual para uma nova posição
    }   
    
    // Função para mover um dedo da garra para uma nova posição
    function moveFinger(finger, currentPosition, targetPosition, speed) {
        var direction = targetPosition.clone().sub(currentPosition).normalize();
    
        // Calcula o ângulo entre a posição atual e a posição de destino
        var angle = currentPosition.angleTo(targetPosition);
        
        // Calcula o vetor de rotação em torno do eixo Z
        var axis = new THREE.Vector3(0, 0, 1);
        
        // Rotaciona o vetor de direção em torno do eixo Z para simular um movimento de rotação
        direction.applyAxisAngle(axis, angle * speed);
        // Calcula o deslocamento baseado na velocidade
        var displacement = direction.clone().multiplyScalar(speed);
        finger.children[1].position.add(displacement);

        var quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(currentPosition.normalize(), targetPosition.normalize());
    
        // Aplica a rotação
        finger.children[1].applyQuaternion(quaternion);
    
    }
    checkCollisions();
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

        case 55: // Tecla '7' - Wireframe
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            break;

        case 65: //A
        case 97: //a
            cabineEsquerda = true;
            break;

        case 81: //Q
        case 113: //q
            cabineDireita = true;
            break;

        case 87: //w
        case 119: //W
            carrinhoOut = true;
            break;

        case 83: //s
        case 115: //S
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
            garraDesce = true;
            break;

        case 68: //D
        case 100: //d
            garraSobe = true;
            break;

        case 82: //R
        case 114: //r
            garraAbre = true;
            break;

        case 70: //F
        case 102: //f
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
            cabineEsquerda = false;
            break;

        case 81: //Q
        case 113: //q
            cabineDireita = false;
            break;

        case 87: //w
        case 119: //W
            carrinhoOut = false;
            break;

        case 83: //s
        case 115: //S
            carrinhoIn = false;
            break;
        case 69: //E
        case 101: //e
            garraDesce = false;
            break;

        case 68: //D
        case 100: //d
            garraSobe = false;
            break;
        
        case 82: //R
        case 114: //r
            garraAbre = false;
            break;

        case 70: //F
        case 102: //f
            garraFecha = false;
            break;
        
    }

}

init();

animate();
