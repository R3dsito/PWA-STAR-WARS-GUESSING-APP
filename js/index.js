if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('sw.js')
    .then(() => console.log("SW registrado correctamente"))
    .catch(() => console.log("SW no se pudo registrar"));
}

function obtenerPersonajes() {
  return fetch('personajes.json')
    .then(response => response.json())
    .catch(error => console.error('Error al cargar el archivo JSON de personajes:', error));
}

let currentSceneIndex = 0;
let currentCharacter;
let scoreCorrect = 0;
let scoreWrong = 0;
let correctConsecutive = 0;
let nombreJugador = '';
const goodSides = ["Rebel Alliance", "Jedi Order", "República", "Resistance"];

function cargarPuntajes() {
  const scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
  scoreboard.sort((a, b) => b.correctConsecutive - a.correctConsecutive);
  
  const scoreboardList = document.getElementById('scoreboard-list');
  scoreboardList.innerHTML = '';
  
  scoreboard.forEach(entry => {
    const listItem = document.createElement('li');
    listItem.textContent = `${entry.nombre}: ${entry.correctConsecutive} correctas consecutivas`;
    scoreboardList.appendChild(listItem);
  });
}

function guardarPuntajes() {
  const scoreboard = JSON.parse(localStorage.getItem('scoreboard')) || [];
  const existingPlayerIndex = scoreboard.findIndex(entry => entry.nombre === nombreJugador);
  if (existingPlayerIndex !== -1) {
    scoreboard[existingPlayerIndex].correctConsecutive = Math.max(scoreboard[existingPlayerIndex].correctConsecutive, correctConsecutive);
  } else {
    scoreboard.push({ nombre: nombreJugador, correctConsecutive: correctConsecutive });
  }
  localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
}

function obtenerPersonajeAleatorio() {
  obtenerPersonajes()
    .then(personajes => {
      currentCharacter = personajes[Math.floor(Math.random() * personajes.length)];
      mostrarPista(currentCharacter);
    });
}

function mostrarPista(character) {
  const scenes = document.querySelectorAll('.foto');
  const currentScene = scenes[currentSceneIndex];
  const nextSceneIndex = (currentSceneIndex + 1) % scenes.length;
  const nextScene = scenes[nextSceneIndex];

  nextScene.style.backgroundImage = `url(${character.imgs})`;
  nextScene.classList.add('visible');

  setTimeout(() => {
    currentScene.classList.remove('visible');
    currentSceneIndex = nextSceneIndex;
  }, 100);

  const mostrarPregunta = document.getElementById('pregunta');
  mostrarPregunta.innerHTML = `<h2>${character.nombre}</h2><p>Color de sable: ${character['color de sable']}</p>`;
}

function comprobar(respuesta) {
  const esGoodSide = goodSides.includes(currentCharacter.bando);
  const mostrarResultado = document.getElementById('resultado');

  if ((respuesta && esGoodSide) || (!respuesta && !esGoodSide)) {
    mostrarResultado.textContent = '¡Correcto! Has adivinado correctamente.';
    scoreCorrect++;
    correctConsecutive++;
  } else {
    mostrarResultado.textContent = `Respuesta incorrecta. El bando correcto era ${esGoodSide ? 'Verde' : 'Rojo'}.`;
    scoreCorrect = 0;
    correctConsecutive = 0;
    guardarPuntajes();
    mostrarNotificacion('¡Perdiste!', `Intenta de nuevo, ${nombreJugador}!`);
    reiniciarJuego();
    return;
  }

  guardarPuntajes();
  
  document.getElementById('score').textContent = `Correctas: ${scoreCorrect}`;

  obtenerPersonajeAleatorio();
}

function solicitarPermisoNotificaciones() {
  if ('Notification' in window) {
    Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        mostrarNotificacion('¡Bienvenido a Star Wars Guessing App!', '¡Buena suerte en el juego!');
      }
    });
  }
}

function mostrarNotificacion(titulo, cuerpo) {
  if ('Notification' in window && Notification.permission === 'granted') {
    document.getElementById("saberon").play();
    new Notification(titulo, { body: cuerpo, icon:'icons/icon-192x192.png'});
  }
}

function compartir() {
  if (navigator.share) {
    navigator.share({
      title: 'Star Wars Guessing App',
      text: '¡Juega al Star Wars Guessing App y adivina a qué bando pertenece cada personaje!',
      url: 'http://localhost/clase/index.html',
    })
    .then(() => console.log('Contenido compartido exitosamente'))
    .catch((error) => console.log('Error al compartir el contenido:', error));
  } else {
    alert('La API de compartir no es soportada en este navegador.');
  }
}

function iniciarJuego() {
  nombreJugador = document.getElementById('nombre').value.trim();
  if (nombreJugador !== '') {
    document.getElementById('nombre-seccion').style.display = 'none';
    document.getElementById('scoreboard-seccion').style.display = 'none';
    document.getElementById('juego-seccion').style.display = 'block';
    obtenerPersonajeAleatorio();
    mostrarNotificacion('¡El juego ha comenzado!', `Buena suerte, ${nombreJugador}!`);
  } else {
    alert('Por favor, ingresa tu nombre para comenzar.');
  }
}

function reiniciarJuego() {
  document.getElementById('nombre-seccion').style.display = 'block';
  document.getElementById('scoreboard-seccion').style.display = 'block';
  document.getElementById('juego-seccion').style.display = 'none';
  cargarPuntajes();
}

function actualizarEstadoConexion() {
  const estadoConexion = document.getElementById('estado');
  if (navigator.onLine) {
    estadoConexion.textContent = 'Online';
    estadoConexion.style.color = 'green';
  } else {
    estadoConexion.textContent = 'Offline';
    estadoConexion.style.color = 'red';
  }
}

window.addEventListener('online', actualizarEstadoConexion);
window.addEventListener('offline', actualizarEstadoConexion);

window.onload = function () {
  obtenerPersonajeAleatorio();
  cargarPuntajes();
  actualizarEstadoConexion();
};

document.addEventListener("DOMContentLoaded", function() {
  const swElement = document.getElementById('sw');
  const showIntroButton = document.getElementById('show-intro-button');
  const closeButton = document.getElementById('close-button');

  showIntroButton.addEventListener('click', () => {
      swElement.style.display = 'block';
      showIntroButton.style.display = 'none';
  });

  closeButton.addEventListener('click', () => {
      swElement.style.display = 'none';
      showIntroButton.style.display = 'block';
  });

  setTimeout(() => {
      if (swElement.style.display === 'block') {
          swElement.style.display = 'none';
          showIntroButton.style.display = 'block';
      }
  }, 70000);
});
