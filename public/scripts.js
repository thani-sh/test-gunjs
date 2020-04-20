document.addEventListener("DOMContentLoaded", () => {
  if (location.pathname === "/") {
    location.pathname = "/game/default";
    return;
  }

  const elPageUser = document.getElementById("page-user");
  const elFormUser = document.getElementById("form-user");
  const elFormName = document.getElementById("form-user-name");
  const elPageGame = document.getElementById("page-game");
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    elPageGame.style.display = "flex";
    loadGame(storedUser);
  } else {
    elPageUser.style.display = "flex";
  }

  elFormUser.addEventListener("submit", (e) => {
    const user = elFormName.value;
    e.preventDefault();
    localStorage.setItem("user", user);
    elPageUser.style.display = "none";
    elPageGame.style.display = "flex";
    loadGame(user);
  });

  async function getICEServers() {
    const turnServers = await fetch(`${location.origin}/turn`).then((res) =>
      res.json()
    );
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.sipgate.net:3478" },
      turnServers.iceServers,
    ];
  }

  async function loadGame(user) {
    const game = location.href.split('/').pop();
    const data = {
      [user]: { x: -50, y: -50, el: createPoint(user) },
    };

    const root = Gun({
      peers: [`${location.origin}/gun`],
      rtc: { iceServers: await getICEServers() },
    });

    // console.debug(`# ${game}/${user}: subscribe`);
    root.get(game).map().on((pos, name) => {
      // console.debug(`# ${game}/${name}: recv: ${pos}`);
      updateData(name, pos.x, pos.y);
    }, true);

    const RAND_LENGTH = 1024;
    const RAND_BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split( '' );
    const RAND_BUFFER = new Uint8Array( RAND_LENGTH );
    function generateRandom() {
      const bytes = crypto.getRandomValues( RAND_BUFFER );
      const chars = [];
      for ( let i = 0; i < RAND_LENGTH; ++i ) {
          chars[i] = RAND_BASE62[bytes[i] % 62];
      }
      return chars.join( '' );
    }

    function sendPosition(x, y) {
      // console.debug(`# ${game}/${user}: send: ${x},${y}`);
      const r = generateRandom();
      root.get(game).get(user).put({ x, y, r });
    }

    function updateData(name, x, y) {
      if (!data[name]) {
        data[name] = { x, y, el: createPoint(name) };
      } else {
        data[name].x = x;
        data[name].y = y;
      }
    }

    function createPoint(name) {
      const point = document.createElement("div");
      point.className = "point";
      const text = document.createElement("span");
      text.className = "point-text";
      text.innerText = name;
      point.appendChild(text);
      elPageGame.appendChild(point);
      return point;
    }

    function render() {
      for (const name of Object.keys(data)) {
        const { el, x, y } = data[name];
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    }
    function schedule() {
      requestAnimationFrame(() => {
        render();
        schedule();
      });
    }
    schedule();

    elPageGame.addEventListener("mousemove", (e) => {
      data[user].x = e.x;
      data[user].y = e.y;
      sendPosition(e.x, e.y);
    });
  }
});
