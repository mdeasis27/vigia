import type { Heading } from "@/design-system/demo/project-story";

type NodeCopy = { name: string; sub: string; analogy: string };

export interface VigiaStory {
  name: string;
  oneLiner: string;
  chips: string[];
  analogy: { heading: Heading; paragraphs: string[]; dictionaryLabel: string; dictionary: { term: string; means: string }[] };
  why: { title: string; text: string };
  tryIt: { heading: Heading; lead: string; question: (renames: number) => string; yes: string; no: string; renamesLabel: string; note: string; simulate: string; cancel: string; reset: string; error: string; idle: string };
  compare: { heading: Heading; lead: string; watcher: string; none: string; unknown: string; sentence: (watcher: number, none: number, byHand: number) => string; verdict: (byHand: number) => string };
  fit: { heading: Heading; worthLabel: string; worth: string; notLabel: string; not: string };
  proves: { heading: Heading; text: string };
  engineers: { summary: string; points: string[]; repoLabel: string };
  scene: { title: string; caption: string; statusLabels: { active: string; danger: string; success: string }; tapeLabel: string; nodes: { docs: NodeCopy; watcher: NodeCopy; renamed: NodeCopy; person: NodeCopy }; tape: { served: string; rerouted: string; lost: string }; byHandOf: (n: number) => string };
}

export const STORY: Record<"en" | "es", VigiaStory> = {
  en: {
    name: "Documentation drift",
    oneLiner: "When a street changes its name, old maps send you to an address that no longer exists.",
    chips: ["Living documentation", "2 min", "Live demo"],
    analogy: {
      heading: { before: "The", accent: "analogy" },
      paragraphs: [
        "The city renames a street and publishes a notice. Maps that read the notice update themselves; maps that don't keep sending people to a dead end. When a street is torn down there is no new name to give, so someone has to redraw that part by hand.",
        "Here the streets are functions in the code and the maps are the team's documentation. The watcher finds every reference to a function that no longer exists. The slider decides how many renames the notice has on record.",
      ],
      dictionaryLabel: "In the diagram below",
      dictionary: [
        { term: "the map", means: "12 documentation pages" },
        { term: "a street", means: "a function in the code" },
        { term: "the renaming notice", means: "the list of old and new names" },
        { term: "a demolished street", means: "a function removed with no replacement" },
      ],
    },
    why: { title: "Why I built it", text: "" },
    tryIt: {
      heading: { before: "Try", accent: "it" },
      lead: "Twelve pages mention 19 functions. Seven of those mentions are broken: five functions were renamed and two were removed.",
      question: (n) => `Before you run it, place a bet: with ${n} ${n === 1 ? "rename" : "renames"} on record, does the team fix 3 or fewer broken references by hand?`,
      yes: "Yes, 3 or fewer",
      no: "No, more than 3",
      renamesLabel: "Renames on the notice (of 5)",
      note: "Each square is one mention in the docs, page by page. Green still works, blue was renamed automatically, red is broken until a person fixes it.",
      simulate: "Run it",
      cancel: "Cancel",
      reset: "Start over",
      error: "The pages could not be checked. Try another number of renames.",
      idle: "Place your bet and press Run it.",
    },
    compare: {
      heading: { before: "With the watcher", accent: "or without it" },
      lead: "Same pages, same code. Without a watcher, nobody checks the docs against the code until a reader complains.",
      watcher: "With the watcher",
      none: "Without it",
      unknown: "broken references nobody knows about",
      sentence: (watcher, none, byHand) => {
        if (watcher === none) return `Both sides leave ${none} broken ${none === 1 ? "reference" : "references"} unnoticed.`;
        const hand = byHand === 0 ? "and none is left for a person" : byHand === 1 ? "and 1 is left for a person to fix" : `and ${byHand} are left for a person to fix`;
        return `The watcher finds all ${none} broken references, ${hand}. Without it, all ${none} stay in the docs until a reader hits one.`;
      },
      verdict: (n) => n === 0 ? "No reference left to fix by hand" : n === 1 ? "1 reference left to fix by hand" : `${n} references left to fix by hand`,
    },
    fit: {
      heading: { before: "Where it", accent: "fits" },
      worthLabel: "Worth it",
      worth: "When other teams build on your documentation and a renamed function costs them an afternoon. I picture an internal platform whose guides fall behind every release.",
      notLabel: "Not needed",
      not: "For a small project where the person who changes the code also rewrites the only page that describes it.",
    },
    proves: {
      heading: { before: "What it", accent: "proves" },
      text: "I separated what a machine can fix safely from what needs a person. A rename with a known new name is fixed automatically; a removal is flagged, because guessing the replacement would be worse than asking.",
    },
    engineers: {
      summary: "For engineers",
      points: [
        "Exported functions are read from the source, and backtick references from the docs. A reference to a missing function is broken; it is renamed automatically when the notice has its new name and flagged otherwise.",
        "The 12-page snapshot is a fixed synthetic set built for this page. The detection logic is the same one used on the original three-page example.",
        "Outcomes per reference for 0 to 5 recorded renames are pinned in a fixture read by the TypeScript and Python suites.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Source code",
    },
    scene: {
      title: "What happened to each mention in the docs",
      caption: "Watch each mention stay valid, get its new name, or wait for a person.",
      statusLabels: { active: "checking", success: "renamed", danger: "needs a person" },
      tapeLabel: "Nineteen mentions across twelve pages",
      nodes: {
        docs: { name: "Docs", sub: "12 pages, 19 mentions", analogy: "the map" },
        watcher: { name: "Watcher", sub: "checks against code", analogy: "the inspector" },
        renamed: { name: "Renamed", sub: "new name applied", analogy: "updated map" },
        person: { name: "For a person", sub: "no new name known", analogy: "demolished street" },
      },
      tape: { served: "still valid", rerouted: "renamed automatically", lost: "needs a person" },
      byHandOf: (n) => `Left to fix by hand: ${n} of 7`,
    },
  },
  es: {
    name: "Vigía",
    oneLiner: "Cuando una calle cambia de nombre, los mapas viejos te mandan a una dirección que ya no existe.",
    chips: ["Documentación viva", "2 min", "Demo en vivo"],
    analogy: {
      heading: { accent: "La analogía" },
      paragraphs: [
        "La ciudad le cambia el nombre a una calle y publica un aviso. Los mapas que leen el aviso se actualizan solos; los que no, siguen mandando gente a un callejón sin salida. Cuando una calle se demuele no hay nombre nuevo que poner, así que alguien tiene que redibujar esa parte a mano.",
        "Aquí las calles son funciones del código y los mapas son la documentación del equipo. El vigía encuentra cada mención a una función que ya no existe. El slider decide cuántos cambios de nombre trae el aviso.",
      ],
      dictionaryLabel: "En el diagrama de abajo",
      dictionary: [
        { term: "el mapa", means: "12 páginas de documentación" },
        { term: "una calle", means: "una función del código" },
        { term: "el aviso de cambio de nombre", means: "la lista de nombres viejos y nuevos" },
        { term: "una calle demolida", means: "una función que se quitó sin reemplazo" },
      ],
    },
    why: { title: "Por qué lo hice", text: "" },
    tryIt: {
      heading: { accent: "Pruébalo" },
      lead: "Doce páginas mencionan 19 funciones. Siete de esas menciones están rotas: cinco funciones cambiaron de nombre y dos se quitaron.",
      question: (n) => `Antes de correrlo, apuesta: con ${n} ${n === 1 ? "cambio de nombre registrado" : "cambios de nombre registrados"}, ¿el equipo arregla a mano 3 o menos referencias rotas?`,
      yes: "Sí, 3 o menos",
      no: "No, más de 3",
      renamesLabel: "Cambios de nombre en el aviso (de 5)",
      note: "Cada cuadrito es una mención en la documentación, página por página. Verde sigue funcionando, azul se renombró solo, rojo queda rota hasta que una persona la arregle.",
      simulate: "Correr",
      cancel: "Cancelar",
      reset: "Empezar de nuevo",
      error: "No se pudieron revisar las páginas. Prueba con otro número de cambios.",
      idle: "Haz tu apuesta y presiona Correr.",
    },
    compare: {
      heading: { before: "Con vigía", accent: "o sin él" },
      lead: "Mismas páginas, mismo código. Sin vigía, nadie revisa la documentación contra el código hasta que un lector se queja.",
      watcher: "Con vigía",
      none: "Sin vigía",
      unknown: "referencias rotas que nadie conoce",
      sentence: (watcher, none, byHand) => {
        if (watcher === none) return `Los dos lados dejan ${none} ${none === 1 ? "referencia rota" : "referencias rotas"} sin detectar.`;
        const hand = byHand === 0 ? "y ninguna queda para una persona" : byHand === 1 ? "y 1 queda para que una persona la arregle" : `y ${byHand} quedan para que una persona las arregle`;
        return `El vigía encuentra las ${none} referencias rotas, ${hand}. Sin él, las ${none} se quedan en la documentación hasta que un lector tropieza con una.`;
      },
      verdict: (n) => n === 0 ? "Ninguna referencia queda para arreglar a mano" : n === 1 ? "1 referencia queda para arreglar a mano" : `${n} referencias quedan para arreglar a mano`,
    },
    fit: {
      heading: { before: "¿Dónde", accent: "sirve", after: "?" },
      worthLabel: "Vale la pena",
      worth: "Cuando otros equipos construyen con tu documentación y una función renombrada les cuesta una tarde. Pienso en una plataforma interna cuyas guías se atrasan con cada versión.",
      notLabel: "No hace falta",
      not: "En un proyecto pequeño donde quien cambia el código también reescribe la única página que lo describe.",
    },
    proves: {
      heading: { before: "Lo que", accent: "demuestra" },
      text: "Separé lo que una máquina puede arreglar con seguridad de lo que necesita a una persona. Un cambio de nombre conocido se arregla solo; una función que se quitó se marca, porque adivinar el reemplazo sería peor que preguntar.",
    },
    engineers: {
      summary: "Para ingenieros",
      points: [
        "Las funciones exportadas se leen del código y las menciones entre comillas invertidas, de la documentación. Una mención a una función que no existe está rota; se renombra sola si el aviso trae su nombre nuevo y se marca si no.",
        "El snapshot de 12 páginas es un conjunto sintético fijo hecho para esta página. La lógica de detección es la misma que se usaba con el ejemplo original de tres páginas.",
        "Los resultados por mención para 0 a 5 cambios registrados están fijados en un fixture que leen las pruebas de TypeScript y de Python.",
        "Stack: Next.js 16, TypeScript, Python, Vitest, pytest.",
      ],
      repoLabel: "Código fuente",
    },
    scene: {
      title: "Lo que pasó con cada mención en la documentación",
      caption: "Mira cómo cada mención sigue válida, recibe su nombre nuevo o espera a una persona.",
      statusLabels: { active: "revisando", success: "renombrada", danger: "necesita a alguien" },
      tapeLabel: "Diecinueve menciones en doce páginas",
      nodes: {
        docs: { name: "Documentación", sub: "12 páginas, 19 menciones", analogy: "el mapa" },
        watcher: { name: "Vigía", sub: "compara con el código", analogy: "el inspector" },
        renamed: { name: "Renombrada", sub: "nombre nuevo aplicado", analogy: "mapa actualizado" },
        person: { name: "Para una persona", sub: "sin nombre nuevo", analogy: "calle demolida" },
      },
      tape: { served: "sigue válida", rerouted: "renombrada sola", lost: "necesita a una persona" },
      byHandOf: (n) => `Para arreglar a mano: ${n} de 7`,
    },
  },
};
