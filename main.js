import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let angle = 0;
const rotationSpeed = 0.05;

// Créer la scène, la caméra et le rendu
// Créer la scène, la caméra et le rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Définir une couleur de fond douce (par exemple, un bleu-gris)
renderer.setClearColor(0x1E1E2F, 1);  // Couleur bleu-gris foncé
document.body.appendChild(renderer.domElement);

// Créer un groupe d'étoiles
const starGroup = new THREE.Group();

// Fonction pour créer une étoile (un petit point lumineux)
function createStar() {
  const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);  // Petite sphère pour représenter une étoile
  const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(starGeometry, starMaterial);

  // Positionner l'étoile à une position aléatoire dans l'espace
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
  star.position.set(x, y, z);
  
  return star;
}

// Créer et ajouter 100 étoiles à la scène
for (let i = 0; i < 300; i++) {
  const star = createStar();
  starGroup.add(star);
}

// Ajouter les étoiles à la scène
scene.add(starGroup);


// Créer une plateforme ronde (cylinder)
const radius = 20;
const height = 2;
const platformGeometry = new THREE.CylinderGeometry(radius, radius, height, 32);
const platformMaterial = new THREE.MeshStandardMaterial({ color: 0x774A08 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);

// Créer un trou circulaire
const holeRadius = 15;
const holeGeometry = new THREE.CircleGeometry(holeRadius, 32);
const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.FrontSide });
const hole = new THREE.Mesh(holeGeometry, holeMaterial);
hole.rotation.x = -Math.PI / 2;
hole.position.y = height / 2 + 0.001;

// Groupe pour la plateforme et le trou
const platformGroup = new THREE.Group();
platformGroup.add(platform);
platformGroup.add(hole);
scene.add(platformGroup);

// Tableau pour stocker les boules
const balls = [];
const maxBalls = 10; // Nombre maximum de balles en jeu simultanément

// Ajouter un Raycaster pour la détection des intersections
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variable pour le couteau
let knifeActive = false;


function rotateCameraAutomatically() {
  angle += 0.003;
  rotateCamera();
}

// Fonction pour créer une boule
function createBall() {
  const ballRadius = 0.6;
  const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
  const ballMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const ball = new THREE.Mesh(ballGeometry, ballMaterial);
  ball.userData = {
    velocity: new THREE.Vector3(0, 15, 0), // Vitesse initiale vers le haut
    isVisible: true,
    isCut: false
  };
  scene.add(ball);
  return ball;
}

// Fonction pour couper une boule en deux
function cutBall(ball) {
  if (ball.userData.isCut) return;

  ball.userData.isCut = true;
  
  // Créer deux moitiés de boule
  const halfBallGeometry = new THREE.SphereGeometry(0.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const halfBallMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  
  const topHalf = new THREE.Mesh(halfBallGeometry, halfBallMaterial);
  const bottomHalf = new THREE.Mesh(halfBallGeometry, halfBallMaterial);
  
  topHalf.position.copy(ball.position);
  bottomHalf.position.copy(ball.position);
  bottomHalf.rotation.x = Math.PI;
  
  topHalf.userData = { velocity: new THREE.Vector3(Math.random() - 0.5, 5, Math.random() - 0.5), isCut: true };
  bottomHalf.userData = { velocity: new THREE.Vector3(Math.random() - 0.5, 5, Math.random() - 0.5), isCut: true };
  
  scene.add(topHalf);
  scene.add(bottomHalf);
  
  // Retirer la boule originale
  scene.remove(ball);
  balls.splice(balls.indexOf(ball), 1);
  
  // Ajouter les moitiés à un tableau temporaire pour l'animation
  balls.push(topHalf, bottomHalf);
  
  // Augmenter le score
  score += 2;
  scoreElement.innerText = `${score}`;
}

// Ajouter une lumière ambiante
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Ajouter une lumière directionnelle
const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
directionalLight1.position.set(5, 10, 7);
scene.add(directionalLight1);

// Ajouter une deuxième lumière directionnelle
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-5, 5, -7);
scene.add(directionalLight2);

// Ajouter un spot de lumière
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 20, 20);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
scene.add(spotLight);

// Positionner la caméra
camera.position.set(0, 10, 35);

// Ajouter OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

// Variables pour le timer, le score et les vies
let timeElapsed = 0;
let score = 0;
let lives = 3;
let gameActive = false;

const timerElement = document.createElement('div');
const scoreElement = document.createElement('div');
const livesElement = document.createElement('div');
const startButton = document.createElement('button');

// Style des éléments
timerElement.style.position = 'absolute';
timerElement.style.top = '20px';
timerElement.style.left = '20px';
timerElement.style.color = 'white';
timerElement.style.fontSize = '24px';

scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.right = '120px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '24px';

livesElement.style.position = 'absolute';
livesElement.style.top = '20px';
livesElement.style.right = '20px';
livesElement.style.color = 'white';
livesElement.style.fontSize = '24px';

startButton.innerText = 'Start';
startButton.style.position = 'absolute';
startButton.style.top = '20px';
startButton.style.left = '50%';
startButton.style.transform = 'translate(-50%, 0)';
startButton.style.padding = '10px 20px';
startButton.style.fontSize = '18px';

document.body.appendChild(timerElement);
document.body.appendChild(scoreElement);
document.body.appendChild(livesElement);
document.body.appendChild(startButton);

const initialCameraPosition = camera.position.clone();

function rotateCamera() {
  const radius = 35;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  camera.position.set(x, 10, z);
  camera.lookAt(platformGroup.position);
}

function resetBall(ball) {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.random() * (holeRadius - 0.6);
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  ball.position.set(x, height / 2 + 0.6, z);
  ball.userData.velocity.set(0, 15, 0); // Vitesse initiale vers le haut
  ball.userData.isVisible = true;
  ball.userData.isCut = false;
  ball.visible = true;
  ball.scale.set(1, 1, 1);
}

const gravity = new THREE.Vector3(0, -9.8, 0);

function animate() {
  requestAnimationFrame(animate);

  if (gameActive) {
    const deltaTime = Math.min(0.016, clock.getDelta()); // Limiter deltaTime à 60 FPS

    timeElapsed += deltaTime;
    const timeRemaining = 10 - Math.floor(timeElapsed);
    timerElement.innerText = `${timeRemaining}s`;

    if (timeRemaining <= 0) {
      endGame();
      return;
    }

    balls.forEach((ball, index) => {
      ball.position.add(ball.userData.velocity.clone().multiplyScalar(deltaTime));
      ball.userData.velocity.add(gravity.clone().multiplyScalar(deltaTime));

      if (ball.position.y <= height / 2 + 0.6 && ball.userData.velocity.y < 0) {
        if (Math.sqrt(ball.position.x * ball.position.x + ball.position.z * ball.position.z) < holeRadius) {
          scene.remove(ball);
          balls.splice(index, 1);
          if (!ball.userData.isCut) {
            scoreElement.innerText = `${score}`;
            if(lives > 0){
              lives--;
            }
            livesElement.innerText = `Vies: ${lives}`;
            if (lives === 0) {
              endGame();
              return;
            }
          }
        } else {
          ball.position.y = height / 2 + 0.6;
          ball.userData.velocity.y = -ball.userData.velocity.y * 0.5; // Rebond
          ball.userData.velocity.x *= 0.9; // Friction
          ball.userData.velocity.z *= 0.9; // Friction
        }
      }
    });

    // Vérifier les intersections avec le couteau
    if (knifeActive) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(balls);
      if (intersects.length > 0) {
        cutBall(intersects[0].object);
      }
    }

    rotateCamera();
  } else {
    balls.forEach(ball => {
      if (ball.position.y > -10) {
        ball.position.y -= 0.1;
      } else {
        scene.remove(ball);
      }
    });
    rotateCameraAutomatically();
  }

  controls.update();
  renderer.render(scene, camera);
}

function addRandomBalls() {
  if (gameActive) {
    const ballsToAdd = Math.floor(Math.random() * 8) + 1; // Ajouter entre 1 et 8 balles
    for (let i = 0; i < ballsToAdd; i++) {
      if (balls.length < maxBalls) {
        const ball = createBall();
        resetBall(ball);
        balls.push(ball);
      }
    }

    // Planifier le prochain ajout de balles
    const nextAddTime = Math.random() * 2000 + 2000; // Entre 2 et 4 secondes
    setTimeout(addRandomBalls, nextAddTime);
  }
}

function startGame() {
  gameActive = true;
  timeElapsed = 0;
  score = 0;
  lives = 5;
  scoreElement.innerText = `${score}`;
  livesElement.innerText = `Vies: ${lives}`;
  timerElement.innerText = '60s';
  balls.forEach(ball => scene.remove(ball));
  balls.length = 0; // Vider le tableau de balles
  startButton.style.display = 'none';
  
  // Commencer à ajouter des balles aléatoirement
  addRandomBalls();
  
  animate();
}

function endGame() {
  gameActive = false;
  timerElement.innerText = '';

  if (lives > 0) {
    // Si des vies restent, affichez "Partie Gagnée!" et créez des feux d'artifice
    const messageElement = document.createElement('div');
    messageElement.innerText = 'Partie Gagnée!';
    messageElement.style.position = 'absolute';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.color = 'white';
    messageElement.style.fontSize = '48px';
    document.body.appendChild(messageElement);
    setTimeout(() => {
      document.body.removeChild(messageElement);
      startButton.style.display = 'block';
      lives = 5;
      livesElement.innerText = ``;
    }, 5000); // Délai de 5 secondes
  }

}


const clock = new THREE.Clock();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowRight') {
    angle += rotationSpeed;
  } else if (event.key === 'ArrowLeft') {
    angle -= rotationSpeed;
  }
});

window.addEventListener('mousedown', () => {
  knifeActive = true;
});

window.addEventListener('mouseup', () => {
  knifeActive = false;
});

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

startButton.addEventListener('click', startGame);

animate();