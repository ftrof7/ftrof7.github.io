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

const creepyTexts = [
  "he sees you",
  "leave now",
  "you can't hide",
  "0xDEADFADE",
  "watching..."
];

function injectCreepyText() {
  const span = document.createElement("div");
  span.innerText = creepyTexts[Math.floor(Math.random() * creepyTexts.length)];
  span.style.position = "fixed";
  span.style.left = Math.random() * window.innerWidth + "px";
  span.style.top = Math.random() * window.innerHeight + "px";
  span.style.color = "red";
  span.style.fontSize = "20px";
  document.body.appendChild(span);
}

function hacking(event) {
  event.preventDefault();
  const btn = event.target;

  flashEffect();
  shakeEffect();

  btn.classList.add('glitch');
  setTimeout(() => {
    btn.classList.remove('glitch');
  }, 1000);

  if (hackStage >= 3) {
    injectCreepyText();
  }

  if (!isHacked) {
    btn.innerText = "Joke";
    alert("You were hacked!");
    isHacked = true;
  } else if (hackStage === 1) {
    btn.innerText = "Why did you click again?";
  } else if (hackStage === 2) {
    btn.innerText = "Don't...";
  } else if (hackStage === 3) {
    btn.innerText = "It wasn't a joke..";
    btn.style.color = "red";

    setTimeout(() => {
      btn.innerText = "LEAVEEe..";
    }, 2000);

    setTimeout(() => {
      btn.innerText = "before it's T0oO late...";
    }, 5000);
  } else if (hackStage > 7) {
    alert(`ERROR: undefined; value: (${value});\nAttempting to restore..`)
    btn.innerText = "ERROR " + value;
    if (hackStage === 8)
      document.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
        el.className = '';
      });
    if (hackStage === 9) {
      document.querySelectorAll('*').forEach(el => {
        el.innerHTML = "ERROR at undefined:49;\nKilling all tasks and entites\nFailed kill: bGVhdmUgYmVmb3JlIGl0J3MgdG9vIGxhdGUuLg==";
        setTimeout(() => {
          window.location.href = "terminal.html";
        }, 5000);
      });
    }
  } else if (hackStage > 3) {
    var value = hackStage - 4
    if (value == 0)
      btn.innerText = "Watching...";
    else
      btn.innerText = "Chance..." + value;
    btn.style.fontSize = "32px";
    document.querySelectorAll('body *').forEach(el => {
      el.style.color = 'red';
      el.classList.add('red-theme');
    });
  }

  hackStage++;
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