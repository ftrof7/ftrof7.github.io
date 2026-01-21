let isHacked = false;
let hackStage = 0;

function flashEffect() {
  document.body.classList.add("flash");
  setTimeout(() => {
    document.body.classList.remove("flash");
  }, 80);
}

function shakeEffect() {
  document.body.classList.add("shake");
  setTimeout(() => {
    document.body.classList.remove("shake");
  }, 500);
}

window.onload = function () {
  const unknownLink = document.getElementById("unknownLink");
  unknownLink.addEventListener("click", hacking);

  const body = document.body;
  const numStars = 100;

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const size = Math.random() * 4 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * window.innerWidth}px`;
    star.style.top = `${Math.random() * window.innerHeight}px`;
    star.style.animationDuration = `${Math.random() * 3 + 2}s`;

    body.appendChild(star);
  }
}