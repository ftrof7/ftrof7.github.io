const terminal = document.getElementById("terminal");
const output = document.getElementById("output");
const input = document.getElementById("commandInput");

const fileSystem = {
  "/": {
    home: {
      ftrof7: {
        "readme.txt": "Hello, world!",
        docs: {}
      },
      unknown: {
        "dGVzdDU5OA==.txt": "YmFzZTY0",
        "test598": "e6fb06210fafc02fd7479ddbed2d042cc3a5155e",
        "Y29kZQ==": "undefined"
      }
    },
    etc: {}
  }
};
var currentPath = "/"

const commands = {};

function registerCommand(name, description, callback) {
  commands[name] = {
    description,
    run: callback
  };
}

input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const command = input.value.trim();
    processCommand(command);
    input.value = "";
  }
  if (e.key === "Tab") {
    e.preventDefault();

    const text = input.value;
    const parts = text.split(" ");
    const cmd = parts[0] || "";
    const arg = parts[parts.length - 1] || "";

    if (parts.length === 1) {
      const matches = Object.keys(commands).filter(c => c.startsWith(cmd));
      if (matches.length === 1) {
        input.value = matches[0] + " ";
      } else if (matches.length > 1) {
        output.innerHTML += `<span class="prompt">ftrof7@github.io:~$</span> ${escapeHTML(text)}\n`;
        output.innerHTML += matches.join("  ") + "\n";
        terminal.scrollTop = terminal.scrollHeight;
      }
    } else {

      let basePath = currentPath;
      let partialName = arg;

      const lastSlashIndex = arg.lastIndexOf("/");
      if (lastSlashIndex !== -1) {
        basePath = resolvePath(arg.slice(0, lastSlashIndex + 1));
        partialName = arg.slice(lastSlashIndex + 1);
      }

      const entries = listDir(basePath).filter(name => name.startsWith(partialName));

      if (entries.length === 1) {
        const completion = entries[0];
        const completedPath = arg.slice(0, arg.length - partialName.length) + completion;
        parts[parts.length - 1] = completedPath;

        const node = getNode(resolvePath(basePath + completion));
        if (typeof node === "object") {
          parts[parts.length - 1] += "/";
        }

        input.value = parts.join(" ");
      } else if (entries.length > 1) {
        output.innerHTML += `<span class="prompt">ftrof7@github.io:~$</span> ${escapeHTML(text)}\n`;
        output.innerHTML += entries.join("  ") + "\n";
        terminal.scrollTop = terminal.scrollHeight;
      }
    }
  }
});

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

function getNode(path) {
  const parts = path.split("/").filter(Boolean);
  let node = fileSystem["/"];
  for (const part of parts) {
    if (typeof node !== "object" || !(part in node)) return null;
    node = node[part];
  }
  return node;
}

function listDir(path) {
  const node = getNode(path);
  if (typeof node === "object" && node !== null) {
    return Object.keys(node);
  }
  return [];
}

function resolvePath(path) {
  if (!path) return currentPath;

  let fullPath = path.startsWith("/") ? path : currentPath + "/" + path;

  const parts = fullPath.split("/").filter(Boolean);
  const stack = [];

  for (const part of parts) {
    if (part === "..") {
      if (stack.length > 0) stack.pop();
    } else if (part !== ".") {
      stack.push(part);
    }
  }

  return "/" + stack.join("/");
}

function isDir(node) {
  return typeof node === "object" && node !== null;
}

function isFile(node) {
  return typeof node === "string";
}

function processCommand(command) {
  const prompt = `<span class="prompt">ftrof7@github.io:~$</span>`;
  const userCommand = `<span class="user-input">${escapeHTML(command)}</span>`;
  output.innerHTML += `${prompt} ${userCommand}\n`;

  const [cmd, ...args] = command.trim().split(" ");

  if (commands[cmd]) {
    const result = commands[cmd].run(args);
    if (result !== null) output.innerHTML += `${escapeHTML(result)}\n`;
  } else if (cmd !== "") {
    output.innerHTML += `bash: ${escapeHTML(cmd)}: command not found\n`;
  }

  terminal.scrollTop = terminal.scrollHeight;
}

registerCommand("echo", "Output text", (args) => {
  return args.join(" ");
});

registerCommand("clear", "Clear screen", () => {
  output.innerHTML = "";
  return null;
});

registerCommand("help", "Show list of commands", () => {
  return Object.entries(commands)
    .map(([name, cmd]) => `${name} - ${cmd.description}`)
    .join("\n");
});

registerCommand("date", "Show current date and time", () => {
  return new Date().toString();
});

registerCommand("whoami", "Show username", () => {
  return "ftrof7";
});

registerCommand("ls", "List directory contents", (args) => {
  const path = args[0] ? resolvePath(args[0]) : currentPath;
  const node = getNode(path);
  if (!node) return `ls: no such directory: ${args[0]}`;
  if (!isDir(node)) return `ls: not a directory: ${args[0]}`;
  return Object.keys(node).join("  ");
});

registerCommand("rm", "Remove files or directories", (args) => {
  if (args.length === 0) return "rm: you must specify a file or directory";

  let recursive = false;
  let target = args[0];

  if (args[0] === "-r") {
    if (args.length < 2) return "rm: missing operand after '-r'";
    recursive = true;
    target = args[1];
  }

  const path = resolvePath(target);
  const parts = path.split("/").filter(Boolean);
  const name = parts.pop();
  const parentPath = "/" + parts.join("/");
  const parentNode = getNode(parentPath);

  if (!parentNode || typeof parentNode !== "object") {
    return `rm: no such directory: ${parentPath}`;
  }

  if (!(name in parentNode)) {
    return `rm: no such file or directory: ${target}`;
  }

  const node = parentNode[name];

  if (typeof node === "object") {
    if (!recursive) {
      return `rm: cannot remove '${target}': Is a directory`;
    } else {
      delete parentNode[name];
      return null;
    }
  }

  delete parentNode[name];
  return null;
});

registerCommand("cd", "Change current directory", (args) => {
  if (args.length === 0) {
    currentPath = "/home/";
    return null;
  }
  const path = resolvePath(args[0]);
  const node = getNode(path);

  if (!node) return `cd: no such directory: ${args[0]}`;
  if (typeof node !== "object" || node === null) return `cd: not a directory: ${args[0]}`;

  currentPath = path;
  return null;
});


registerCommand("mkdir", "Create a new directory", (args) => {
  if (args.length === 0) return "mkdir: missing directory name";

  const path = resolvePath(args[0]);
  const parts = path.split("/").filter(Boolean);
  const newDirName = parts.pop();
  const parentPath = "/" + parts.join("/");
  const parentNode = getNode(parentPath);

  if (!parentNode || typeof parentNode !== "object") {
    return `mkdir: cannot create directory '${args[0]}': No such file or directory`;
  }

  if (newDirName in parentNode) {
    return `mkdir: cannot create directory '${args[0]}': File exists`;
  }

  parentNode[newDirName] = {};

  return null;
});

registerCommand("cat", "Display the contents of a file", (args) => {
  if (args.length === 0) return "cat: you must specify a file";

  const path = resolvePath(args[0]);
  const file = getNode(path);

  if (file === undefined) {
    return `cat: no such file or directory: ${args[0]}`;
  }

  if (typeof file === "object") {
    return `cat: ${args[0]}: Is a directory`;
  }

  return file;
});

registerCommand("lua", "Execute Lua code", (args) => {
  const code = args.join(" ");
  const outputBuffer = [];

  try {
    const L = fengari.lauxlib.luaL_newstate();
    fengari.lualib.luaL_openlibs(L);

    const luaPrint = fengari.to_luastring("print");

    fengari.lua.lua_pushjsfunction(L, function (L) {
      let n = fengari.lua.lua_gettop(L);
      let strs = [];
      for (let i = 1; i <= n; i++) {
        strs.push(fengari.lua.lua_tojsstring(L, i));
      }
      outputBuffer.push(strs.join(" "));
      return 0;
    });
    fengari.lua.lua_setglobal(L, luaPrint);

    const status = fengari.lauxlib.luaL_dostring(L, fengari.to_luastring(code));
    if (status !== fengari.lua.LUA_OK) {
      const errMsg = fengari.lua.lua_tojsstring(L, -1);
      outputBuffer.push("lua error: " + errMsg);
    }
  } catch (err) {
    outputBuffer.push("js error: " + err.message);
  }

  return outputBuffer.join("\n");
});

registerCommand("exit", "Exit from terminal", (args) => {
  window.location.href = "index.html";
});