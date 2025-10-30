// Lista de curiosidades
const curiosidades = [
  "El primer mouse fue de madera en 1964.",
  "La primera impresora láser fue creada en 1969 por Xerox.",
  "El microprocesador Intel 4004 tenía solo 2.300 transistores.",
  "Las primeras computadoras ocupaban habitaciones enteras.",
  "La memoria RAM es más rápida que cualquier disco duro.",
  "Un SSD puede ser hasta 10 veces más rápido que un HDD.",
  "El término 'bug' viene de un insecto que se metió en un ordenador.",
  "Los discos duros modernos pueden superar los 20 TB.",
  "Los teclados QWERTY fueron diseñados para evitar atascos mecánicos.",
  "Las primeras memorias portátiles apenas tenían unos KB.",
  "Un superordenador moderno hace billones de cálculos por segundo.",
  "El USB se creó en 1996 y aún lo usamos.",
  "La primera cámara digital pesaba más de 3 kg.",
  "Los monitores CRT gastaban el doble de energía que los LCD.",
  "Las laptops modernas pesan menos que las tablets antiguas.",
  "Los procesadores actuales tienen miles de millones de transistores.",
  "Internet nació como un proyecto militar (ARPANET).",
  "El disquete de 3.5 pulgadas guardaba solo 1.44 MB.",
  "La Ley de Moore se cumple desde 1965.",
  "Los casetes también se usaban para almacenar programas de computadora."
];

// Lista de consejos
const consejos = [
  "Mantén tu PC libre de polvo.",
  "Usa estabilizadores de corriente para evitar daños.",
  "No bloquees las salidas de ventilación.",
  "Limpia teclado y mouse regularmente.",
  "Cambia la pasta térmica de la CPU cada cierto tiempo.",
  "Evita exponer la computadora a la humedad.",
  "No muevas la PC cuando está encendida."
];

// Función para mostrar 3 curiosidades aleatorias
function mostrarCuriosidades() {
  const lista = document.getElementById("curiosidades-list");
  lista.innerHTML = ""; // limpiar antes
  let usadas = [];
  while (usadas.length < 3) {
    let random = Math.floor(Math.random() * curiosidades.length);
    if (!usadas.includes(random)) {
      usadas.push(random);
      const li = document.createElement("li");
      li.textContent = curiosidades[random];
      lista.appendChild(li);
    }
  }
}

// Función para mostrar un consejo aleatorio
function mostrarConsejo() {
  const lugar = document.getElementById("consejo");
  if (lugar) {
    lugar.textContent = consejos[Math.floor(Math.random() * consejos.length)];
  }
}

// Ejecutar al cargar la página
window.onload = () => {
  mostrarCuriosidades();
  mostrarConsejo();
};
