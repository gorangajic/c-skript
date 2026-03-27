import * as monaco from "monaco-editor";
import { transpile, translateError } from "@c-script/core";
import "./style.css";

// ---------------------------------------------------------------------------
// Examples
// ---------------------------------------------------------------------------
const EXAMPLES: Record<string, string> = {
  "здраво-свете": `// Здраво свете — први програм у ћ-скрипту!

заклето поздрав = "Здраво свете!"
кажи(поздрав)

нека године = 25

ако (године > 18) {
    кажи("Можеш у кафану 🍺")
} иначе {
    кажи("Седи кући")
}

функција поздравиНеког(име) {
    врати "Ћао " + име + ", шта радиш?"
}

кажи(поздравиНеког("Марко"))

// Петља
нека број = 0
док (број < 3) {
    кажи("Број је " + број)
    број++
}
`,

  "класе": `// Класе у ћ-скрипту

класа Човек {
    constructor(име, године) {
        ово.име = име
        ово.године = године
    }

    представиСе() {
        кажи("Зовем се " + ово.име + ", имам " + ово.године + " година")
    }
}

класа Програмер наслеђује Човек {
    constructor(име, године, језик) {
        супер(име, године)
        ово.језик = језик
    }

    кодирај() {
        кажи(ово.име + " кодира у " + ово.језик)
    }
}

заклето горан = прави Програмер("Горан", 30, "ћ-скрипт")
горан.представиСе()
горан.кодирај()

// Низ објеката
заклето екипа = [
    прави Човек("Марко", 25),
    прави Човек("Јована", 28),
    прави Човек("Никола", 32)
]

заСваког (нека члан у екипа) {
    члан.представиСе()
}
`,

  "асинхроно": `// Асинхроно програмирање у ћ-скрипту

функција сачекај(мс) {
    врати прави Promise(функција(resolve) {
        setTimeout(resolve, мс)
    })
}

асинхроно функција направиКафу() {
    кажи("☕ Правим кафу...")
    чекај сачекај(100)
    кажи("☕ Кафа је готова!")
    врати "турска кафа"
}

асинхроно функција направиДоручак() {
    покушај {
        кажи("🍳 Почињем доручак...")

        заклето кафа = чекај направиКафу()
        кажи("Направио сам: " + кафа)

        кажи("🥐 Доручак је спреман!")
    } ухвати (грешка) {
        кукај("Нешто је пошло по злу: " + грешка)
    } наКрају {
        кажи("🧹 Спремам кухињу...")
    }
}

направиДоручак()
`,

  "низови": `// Рад са низовима у ћ-скрипту

заклето воће = ["јабука", "крушка", "шљива", "малина"]
кажи("Воће: " + воће)

// Додај на крај
воће.push("грожђе")
кажи("После додавања: " + воће)

// Филтрирај
заклето дугачка = воће.filter(функција(в) {
    врати в.length > 5
})
кажи("Дугачка имена: " + дугачка)

// Map
заклето великим = воће.map(функција(в) {
    врати в.toUpperCase()
})
кажи("Великим словима: " + великим)

// Reduce
заклето бројеви = [1, 2, 3, 4, 5]
заклето збир = бројеви.reduce(функција(акумулатор, тренутни) {
    врати акумулатор + тренутни
}, 0)
кажи("Збир бројева [1,2,3,4,5] = " + збир)

// Деструктурирање
заклето [прво, друго, ...остало] = воће
кажи("Прво: " + прво)
кажи("Друго: " + друго)
кажи("Остало: " + остало)
`,

  "грешке": `// Руковање грешкама у ћ-скрипту

// Покушај да прочиташ непостојећу променљиву
покушај {
    кажи(непостојећаПроменљива)
} ухвати (грешка) {
    кукај("Ухватили смо грешку: " + грешка.message)
}

// Заклето не може да се мења
заклето име = "Марко"
кажи("Име: " + име)
покушај {
    име = "Јована"
} ухвати (грешка) {
    кукај("Не може! " + грешка.message)
}

// Бацање сопствене грешке
функција подели(а, б) {
    ако (б === 0) {
        баци прави Error("Не можеш делити нулом, брате!")
    }
    врати а / б
}

покушај {
    кажи("10 / 2 = " + подели(10, 2))
    кажи("10 / 0 = " + подели(10, 0))
} ухвати (грешка) {
    кукај(грешка.message)
} наКрају {
    кажи("Крај рачунања.")
}
`,
};

// ---------------------------------------------------------------------------
// Register custom Monaco language: c-script
// ---------------------------------------------------------------------------

const serbianKeywords = [
  "нека", "заклето", "ако", "иначе", "док", "за", "заСваког",
  "прекини", "настави", "случај", "кад", "подразумевано",
  "функција", "врати", "класа", "наслеђује", "ово", "супер", "прави",
  "покушај", "ухвати", "наКрају", "баци",
  "увези", "извези", "из", "као",
  "чекај", "асинхроно",
];

const serbianConstants = [
  "тачно", "нетачно", "ништа", "нијеНишта",
];

const serbianTypes = [
  "број", "реч", "истина", "низ", "објекат",
  "празно", "никад", "билоШта", "непознато",
];

const serbianBuiltins = [
  "кажи", "дериСе", "кукај",
];

monaco.languages.register({ id: "c-script" });

monaco.languages.setMonarchTokensProvider("c-script", {
  keywords: serbianKeywords,
  constants: serbianConstants,
  typeKeywords: serbianTypes,
  builtins: serbianBuiltins,

  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, "comment"],
      [/\/\*/, "comment", "@comment"],

      // Strings
      [/"([^"\\]|\\.)*$/, "string.invalid"],
      [/"/, "string", "@string_double"],
      [/'([^'\\]|\\.)*$/, "string.invalid"],
      [/'/, "string", "@string_single"],
      [/`/, "string", "@string_backtick"],

      // Numbers
      [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
      [/0[xX][0-9a-fA-F]+/, "number.hex"],
      [/\d+/, "number"],

      // Identifiers & keywords
      [/[a-zA-Zа-яА-ЯёЁђјљњћцџЂЈЉЊЋЦЏ_][a-zA-Zа-яА-ЯёЁђјљњћцџЂЈЉЊЋЦЏ0-9_]*/, {
        cases: {
          "@keywords": "keyword",
          "@constants": "keyword.constant",
          "@typeKeywords": "type",
          "@builtins": "keyword.builtin",
          "@default": "identifier",
        },
      }],

      // Brackets & operators
      [/[{}()\[\]]/, "@brackets"],
      [/[=!<>]=?|[+\-*/%]|&&|\|\||!/, "operator"],

      // Delimiters
      [/[;,.]/, "delimiter"],
    ],

    comment: [
      [/[^/*]+/, "comment"],
      [/\*\//, "comment", "@pop"],
      [/[/*]/, "comment"],
    ],

    string_double: [
      [/[^\\"]+/, "string"],
      [/\\./, "string.escape"],
      [/"/, "string", "@pop"],
    ],

    string_single: [
      [/[^\\']+/, "string"],
      [/\\./, "string.escape"],
      [/'/, "string", "@pop"],
    ],

    string_backtick: [
      [/\$\{/, { token: "delimiter.bracket", next: "@bracketCounting" }],
      [/[^\\`$]+/, "string"],
      [/\\./, "string.escape"],
      [/`/, "string", "@pop"],
    ],

    bracketCounting: [
      [/\{/, "delimiter.bracket", "@bracketCounting"],
      [/\}/, "delimiter.bracket", "@pop"],
      { include: "root" },
    ],
  },
});

// Define a dark theme for the language
monaco.editor.defineTheme("c-script-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "c792ea", fontStyle: "bold" },
    { token: "keyword.constant", foreground: "ff6188" },
    { token: "keyword.builtin", foreground: "82aaff", fontStyle: "bold" },
    { token: "type", foreground: "ffcb6b" },
    { token: "comment", foreground: "546e7a", fontStyle: "italic" },
    { token: "string", foreground: "c3e88d" },
    { token: "number", foreground: "f78c6c" },
    { token: "operator", foreground: "89ddff" },
    { token: "identifier", foreground: "eeffff" },
  ],
  colors: {
    "editor.background": "#1a1a2e",
    "editor.foreground": "#eeffff",
    "editorCursor.foreground": "#e94560",
    "editor.lineHighlightBackground": "#1f1f3a",
    "editor.selectionBackground": "#2a2a5055",
  },
});

// ---------------------------------------------------------------------------
// Create editors
// ---------------------------------------------------------------------------

const sourceContainer = document.getElementById("monaco-source")!;
const outputContainer = document.getElementById("monaco-output")!;

const sourceEditor = monaco.editor.create(sourceContainer, {
  value: EXAMPLES["здраво-свете"],
  language: "c-script",
  theme: "c-script-dark",
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
  padding: { top: 10 },
  scrollBeyondLastLine: false,
});

const outputEditor = monaco.editor.create(outputContainer, {
  value: "",
  language: "javascript",
  theme: "c-script-dark",
  fontSize: 14,
  minimap: { enabled: false },
  automaticLayout: true,
  readOnly: true,
  padding: { top: 10 },
  scrollBeyondLastLine: false,
});

// ---------------------------------------------------------------------------
// Transpilation (debounced)
// ---------------------------------------------------------------------------

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function doTranspile() {
  const source = sourceEditor.getValue();
  try {
    const js = transpile(source);
    outputEditor.setValue(js);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    outputEditor.setValue(`// Грешка при транспилацији:\n// ${message}`);
  }
}

sourceEditor.onDidChangeModelContent(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(doTranspile, 300);
});

// Initial transpile
doTranspile();

// ---------------------------------------------------------------------------
// Console output panel
// ---------------------------------------------------------------------------

const consoleOutput = document.getElementById("console-output")!;

function appendConsole(text: string, level: "log" | "warn" | "error") {
  const line = document.createElement("div");
  line.className = `log-line ${level}`;
  line.textContent = text;
  consoleOutput.appendChild(line);
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
  consoleOutput.innerHTML = "";
}

// ---------------------------------------------------------------------------
// Run in sandboxed iframe
// ---------------------------------------------------------------------------

function runCode() {
  clearConsole();

  const jsCode = outputEditor.getValue();
  if (!jsCode || jsCode.startsWith("// Грешка")) {
    appendConsole("Не могу да покренем — код садржи грешке.", "error");
    return;
  }

  const iframeHTML = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body>
<script>
  const __send = (level, args) => {
    parent.postMessage({
      type: "__c_script_console__",
      level: level,
      text: args.map(a => {
        if (typeof a === "object") {
          try { return JSON.stringify(a); } catch { return String(a); }
        }
        return String(a);
      }).join(" ")
    }, "*");
  };

  console.log = (...args) => __send("log", args);
  console.warn = (...args) => __send("warn", args);
  console.error = (...args) => __send("error", args);

  try {
    ${jsCode}
  } catch (e) {
    parent.postMessage({
      type: "__c_script_console__",
      level: "error",
      text: "__RAW_ERROR__" + e.message
    }, "*");
  }
<\/script>
</body>
</html>`;

  const blob = new Blob([iframeHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  // Remove any existing sandbox iframe
  const existing = document.getElementById("sandbox-iframe");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "sandbox-iframe";
  iframe.style.display = "none";
  iframe.sandbox.add("allow-scripts");
  iframe.src = url;
  document.body.appendChild(iframe);

  // Clean up blob URL after load
  iframe.addEventListener("load", () => {
    URL.revokeObjectURL(url);
    // Give code a moment to execute, then clean up iframe
    setTimeout(() => {
      iframe.remove();
    }, 1000);
  });
}

// Listen for console messages from the sandbox
window.addEventListener("message", (event) => {
  const data = event.data;
  if (data && data.type === "__c_script_console__") {
    let text: string = data.text;
    const level: "log" | "warn" | "error" = data.level;

    // Translate runtime errors to Serbian
    if (level === "error" && text.startsWith("__RAW_ERROR__")) {
      text = translateError(text.replace("__RAW_ERROR__", ""));
    }

    appendConsole(text, level);
  }
});

// Bind run button
document.getElementById("run-btn")!.addEventListener("click", runCode);

// Keyboard shortcut: Ctrl/Cmd + Enter to run
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    runCode();
  }
});

// ---------------------------------------------------------------------------
// Example selector
// ---------------------------------------------------------------------------

const exampleSelect = document.getElementById("example-select") as HTMLSelectElement;

exampleSelect.addEventListener("change", () => {
  const key = exampleSelect.value;
  if (EXAMPLES[key]) {
    sourceEditor.setValue(EXAMPLES[key]);
  }
});
