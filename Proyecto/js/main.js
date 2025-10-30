
document.addEventListener('DOMContentLoaded', () => {
  // menú hamburguesa
  const hamb = document.getElementById('hamb'), nav = document.getElementById('nav');
  if (hamb && nav) { hamb.addEventListener('click', () => { nav.style.display = (getComputedStyle(nav).display === 'flex') ? 'none' : 'flex'; }); nav.querySelectorAll && nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { if (window.innerWidth < 980) nav.style.display = 'none'; })); }

  // curiosidades (20+)
  const curiosidades = [
    "El primer disco duro de IBM (1956) pesaba más de una tonelada y almacenaba solo 5 MB.",
    "La Ley de Moore observó que la cantidad de transistores se duplicaría aproximadamente cada 2 años.",
    "Intel 4004 (1971) tenía solo 2,300 transistores.",
    "Ada Lovelace escribió el primer algoritmo publicado en 1843.",
    "Las tarjetas perforadas fueron uno de los primeros medios de entrada de datos.",
    "Un SSD puede ser cientos de veces más rápido que un HDD en operaciones aleatorias.",
    "Las GPUs actuales se usan mucho en inteligencia artificial y cómputo científico.",
    "ENIAC ocupaba varias habitaciones y demandaba mantenimiento constante.",
    "El término 'bug' para errores se popularizó tras encontrar un insecto en un equipo ENIAC.",
    "Los procesadores modernos contienen miles de millones de transistores en un chip pequeño.",
    "El mouse inicial fue de madera y creado por Douglas Engelbart en 1964.",
    "QWERTY fue diseñado para mecánicas de máquinas de escribir, no para velocidad de tecleo.",
    "La RAM es volátil: pierde datos cuando se corta la electricidad.",
    "El hardware se distingue del software: el primero es físico, lo otro son instrucciones.",
    "PlayStation 2 es la consola más vendida, con más de 155 millones de unidades.",
    "La primera cámara digital de Kodak (1975) tenía 0,01 MP.",
    "Un disquete de 3.5" guardaba 1.44 MB — hoy una USB almacena terabytes.",
    "Las placas mãe de notebooks suelen tener muchos componentes soldados para ahorrar espacio.",
    "El superordenador Fugaku alcanzó más de 442 petaflops en 2020.",
    "El transistor, inventado en 1947, revolucionó la electrónica reduciendo tamaño y consumo."
  ];
  const slot = document.getElementById('curiosidad');
  if (slot) { slot.textContent = curiosidades[Math.floor(Math.random() * curiosidades.length)]; }

});
