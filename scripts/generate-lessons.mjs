#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const curriculum = JSON.parse(
  fs.readFileSync(path.join(root, "content/curriculum.json"), "utf-8")
);

const topicContent = {
  "b1-atoms-charge": (lesson) => `## Overview

Everything in electronics starts with **charge** — a property of atoms that lets them interact electrically.

## Atoms & Charge

- **Protons** carry positive charge (+)
- **Electrons** carry negative charge (−)
- Like charges repel; opposite charges attract

When electrons move from one place to another, we get **electric current**.

## Conventional Current

By convention, current flows from positive to negative — even though electrons actually move the opposite way. Either way, the math works the same.

<Callout type="tip">
Think of electrons as marbles rolling through a tube. The flow of marbles is current, even if we label the direction differently on paper.
</Callout>

## What You'll Learn

${lesson.learningObjectives.map((o) => `- ${o}`).join("\n")}
`,

  "b1-voltage-current": () => `## Overview

**Voltage** and **current** are the two most important measurements in any circuit.

<WaterAnalogy />

## Voltage (V)

Measured in **volts (V)**. The "pressure" that pushes charge through a circuit. A 9V battery pushes harder than a 1.5V AA cell.

## Current (I)

Measured in **amperes (A)** or milliamps (mA). The rate of charge flow — how much charge passes a point per second.

<Callout type="info">
High voltage with low current can be safe (static shock). Low voltage with high current can be dangerous. Both matter!
</Callout>

## Check Your Recall

<Flashcards
  cards={[
    { front: "What is voltage in the water analogy?", back: "Pressure — the push that drives charge around the circuit." },
    { front: "What is current?", back: "The rate of charge flow: how much charge passes a point each second." },
    { front: "Unit of current?", back: "Amperes (A). 1 mA = 0.001 A." },
    { front: "Unit of voltage?", back: "Volts (V)." },
  ]}
/>
`,

  "b2-resistors": () => `## Overview

Resistors are the most common component in electronics. They limit current and divide voltage.

## Symbol & Units

<DiagramBlock title="Common Component Symbols">
  <div className="flex flex-wrap justify-center gap-6">
    <ComponentSymbol name="Resistor (US)" symbol="⏤⏤⏤" />
    <ComponentSymbol name="Resistor (EU)" symbol="▭" />
  </div>
</DiagramBlock>

Resistance is measured in **ohms (Ω)**. Common values use prefixes: kΩ (kilohm), MΩ (megohm).

## Color Code

Most through-hole resistors use colored bands to indicate value. The first two bands are digits, the third is multiplier, the fourth is tolerance.

<Callout type="tip">
Memorize: Black=0, Brown=1, Red=2, Orange=3, Yellow=4, Green=5, Blue=6, Violet=7, Gray=8, White=9
</Callout>
`,

  default: (lesson) => `## Overview

${lesson.description}

## What You'll Learn

${lesson.learningObjectives.map((o) => `- ${o}`).join("\n")}

## Core Concepts

Understanding **${lesson.title}** is essential for building a solid foundation in electronics. Think of each new concept as a tool in your engineer's toolbox — you will use these ideas again and again as circuits get more complex.

<Callout type="tip">
Take your time with this lesson. Use the AI Tutor on the right to ask "why" questions — understanding the reasoning behind each concept matters more than memorizing formulas.
</Callout>

## Key Takeaways

${lesson.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}

## Practice

Apply what you learned by reviewing the concepts above, then complete the quiz below to check your understanding.
`,

  "b3-ohms-law": () => `## Overview

Ohm's Law is the most important equation in electronics: **V = I × R** (Voltage = Current × Resistance).

<WaterAnalogy />

## The Formula

- **V** (Volts) — electrical "pressure" pushing charge through a circuit
- **I** (Amperes) — rate of charge flow
- **R** (Ohms) — opposition to current flow

If you know any two values, you can find the third:
- I = V / R
- R = V / I

## See It Move

Drag the sliders and watch the charge flow. The dots speed up when current rises and slow down when resistance increases.

<CurrentFlow initialVoltage={9} initialResistance={450} />

## Example

A 9V battery connected to a 900Ω resistor:
- Current I = 9V / 900Ω = **0.01 A = 10 mA**

<StepThrough
  problem="A 12 V supply drives a 600 Ω resistor. What current flows, and how much power does the resistor dissipate?"
  steps={[
    "Write down what you know: V = 12 V, R = 600 Ω. You want I and P.",
    "Rearrange Ohm's law for current: I = V / R.",
    "Substitute: I = 12 V / 600 Ω = 0.02 A.",
    "Convert to milliamps: 0.02 A × 1000 = 20 mA.",
    "Power: P = V × I = 12 V × 0.02 A = 0.24 W — a standard ¼ W (0.25 W) resistor is cutting it close, so pick ½ W.",
  ]}
  answer="I = 20 mA, P = 0.24 W"
/>

<Callout type="warning">
Always calculate expected current before powering a circuit. Excessive current destroys components!
</Callout>

<Flashcards
  cards={[
    { front: "Ohm's law (solve for V)", back: "V = I × R" },
    { front: "Ohm's law (solve for I)", back: "I = V / R" },
    { front: "Resistance doubles, voltage stays the same. What happens to current?", back: "It halves." },
    { front: "9 V across 900 Ω gives what current?", back: "10 mA (0.01 A)" },
  ]}
/>

<CircuitSimulator
  circuitFile="ohms-law.txt"
  lessonId="b3-ohms-law"
  labInstructions={[
    "Run the simulation and observe voltage and current readings",
    "Change the resistor value and note how current changes",
    "Verify that doubling resistance halves the current"
  ]}
/>
`,

  "b3-series-parallel": (lesson) => `## Overview

Real circuits rarely contain a single resistor. Knowing how resistors **combine** lets you replace a whole network with one equivalent resistance and then use Ohm's law.

## Series

Resistors in series sit end to end on a single path. The **same current** flows through each one, and the supply voltage is **shared** between them.

**R_eq = R1 + R2 + …**

## Parallel

Resistors in parallel each connect across the same two nodes. Every resistor sees the **same voltage**, and the total current is **shared** between the branches.

**1 / R_eq = 1 / R1 + 1 / R2 + …** — for two resistors: **R_eq = (R1 × R2) / (R1 + R2)**

<SeriesParallelExplorer initialR1={330} initialR2={660} />

<Callout type="tip">
Quick sanity check: series always makes the total **bigger** than the largest resistor; parallel always makes it **smaller** than the smallest.
</Callout>

<StepThrough
  problem="A 1 kΩ resistor is in parallel with a 1 kΩ resistor, and that pair is in series with a 500 Ω resistor. What is the total resistance?"
  steps={[
    "Simplify the innermost group first — the parallel pair.",
    "Two equal resistors in parallel give half of one: 1 kΩ ∥ 1 kΩ = 500 Ω.",
    "The network is now 500 Ω in series with 500 Ω.",
    "Series resistances add: 500 Ω + 500 Ω = 1000 Ω.",
  ]}
  answer="R_total = 1 kΩ"
/>

## Key Takeaways

${lesson.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
`,

  "b5-rc-timing": (lesson) => `## Overview

When a capacitor charges through a resistor, its voltage doesn't jump instantly. It rises quickly at first and then slows down, following an exponential curve set by the **time constant τ (tau)**.

## The Time Constant

**τ = R × C** — with R in ohms and C in farads, τ comes out in seconds.

- After **1τ** the capacitor reaches about **63%** of the supply voltage
- After **5τ** it is considered fully charged (**over 99%**)

Charging: **Vc = Vs × (1 − e^(−t/τ))** · Discharging: **Vc = Vs × e^(−t/τ)**

<RCChargeCurve initialResistanceK={10} initialCapacitanceU={100} />

<Callout type="info">
10 kΩ × 100 µF = 10,000 × 0.0001 = **1 second**. This combination is handy to remember when designing simple delays.
</Callout>

<Flashcards
  cards={[
    { front: "Formula for the RC time constant", back: "τ = R × C" },
    { front: "Charge level after 1τ", back: "About 63% of the supply voltage" },
    { front: "How long until fully charged?", back: "About 5τ (over 99%)" },
    { front: "Doubling C does what to τ?", back: "Doubles it — the curve rises twice as slowly." },
  ]}
/>

## Key Takeaways

${lesson.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
`,

  "i3-logic-gates": (lesson) => `## Overview

Logic gates are the building blocks of every digital system. Each gate takes one or more **binary inputs** (0 = LOW, 1 = HIGH) and produces an output according to a simple rule.

## The Basic Gates

- **AND** — output is 1 only if **all** inputs are 1
- **OR** — output is 1 if **any** input is 1
- **NOT** — inverts the input
- **NAND / NOR** — AND / OR followed by NOT (the bubble on the symbol means "invert")
- **XOR** — output is 1 when the inputs are **different**

<LogicGateExplorer initialGate="AND" />

<Callout type="tip">
NAND is called a **universal gate**: you can build every other gate using only NAND gates.
</Callout>

<Flashcards
  cards={[
    { front: "AND gate with inputs 1 and 0", back: "0 — AND needs every input HIGH" },
    { front: "What does the bubble on a gate symbol mean?", back: "Inversion (NOT) of that signal" },
    { front: "XOR truth rule", back: "Output is 1 when the inputs differ" },
    { front: "Which gate is 'universal'?", back: "NAND (and NOR) — any logic can be built from it" },
  ]}
/>

## Key Takeaways

${lesson.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
`,

  "i5-pwm": (lesson) => `## Overview

A microcontroller pin can only be fully **ON** or fully **OFF**. **Pulse-Width Modulation (PWM)** switches it rapidly so the load sees an **average** voltage somewhere in between.

## Duty Cycle & Frequency

- **Duty cycle** — the percentage of each period the signal is HIGH
- **Frequency** — how many periods per second
- **Average voltage** — V_avg = duty × V_high

<PWMVisualizer initialDuty={50} />

## Where PWM Is Used

- Dimming LEDs (your eye averages the fast flicker)
- Controlling DC motor speed through an H-bridge
- Positioning hobby servos (pulse width encodes the angle)

<Callout type="warning">
The frequency must be fast enough for the load: LEDs need a few hundred Hz to avoid visible flicker, while servos expect a 50 Hz signal.
</Callout>

## Key Takeaways

${lesson.learningObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n")}
`,

  "b3-voltage-divider": () => `## Overview

A **voltage divider** uses two resistors in series to create an output voltage that is a fraction of the input.

## The Formula

For resistors R1 (top) and R2 (bottom) with input voltage Vin:

**Vout = Vin × R2 / (R1 + R2)**

## Why It Matters

Voltage dividers appear everywhere:
- Setting reference voltages for sensors
- Biasing transistor circuits
- Creating logic-level signals from higher voltages

<Callout type="tip">
If you need 2.5V from a 5V supply, choose R1 = R2 for a equal split!
</Callout>

<CircuitSimulator
  circuitFile="voltage-divider.txt"
  lessonId="b3-voltage-divider"
  labInstructions={[
    "Run the simulation and measure Vout at the junction between resistors",
    "Change resistor values and predict the new Vout",
    "Verify Vout matches the divider formula"
  ]}
/>
`,

  "b5-led-circuit": () => `## Overview

An LED (Light Emitting Diode) is a diode that emits light when current flows through it in the forward direction. Without a current-limiting resistor, the LED will burn out instantly.

## Calculating the Resistor

**R = (Vsupply - Vled) / Iled**

Typical values:
- Red LED forward voltage: ~1.8V
- Desired current: ~10-20 mA

For 5V supply and red LED at 15mA:
**R = (5 - 1.8) / 0.015 = 213Ω → use 220Ω**

<Callout type="warning">
LED polarity matters! The longer leg (anode) connects to positive through the resistor.
</Callout>

<CircuitSimulator
  circuitFile="led-circuit.txt"
  lessonId="b5-led-circuit"
  labInstructions={[
    "Run the simulation and confirm the LED lights up",
    "Measure current through the LED — should be under 20mA",
    "Try removing the resistor and observe what happens (simulation only!)"
  ]}
/>
`,
};

function getQuiz(lesson) {
  const q1 = {
    question: `Which statement best describes the main topic of "${lesson.title}"?`,
    options: [
      lesson.learningObjectives[0],
      "This topic is unrelated to electronics",
      "Only advanced engineers need this knowledge",
      "This concept has no practical applications",
    ],
    correctIndex: 0,
    explanation: lesson.learningObjectives[0],
  };

  const q2 = {
    question: `What is a key learning objective of this lesson?`,
    options: [
      "Memorizing formulas without understanding",
      lesson.learningObjectives[1] ?? lesson.learningObjectives[0],
      "Skipping safety practices",
      "Avoiding hands-on practice",
    ],
    correctIndex: 1,
    explanation: "Understanding concepts deeply helps you apply them in real projects.",
  };

  const q3 = {
    question: `When working with circuits related to ${lesson.title}, you should:`,
    options: [
      "Ignore component ratings",
      "Work safely and verify calculations before powering on",
      "Always use maximum voltage available",
      "Never use a multimeter",
    ],
    correctIndex: 1,
    explanation: "Safe lab practices protect you and your components.",
  };

  if (lesson.id === "b3-ohms-law") {
    return [
      {
        question: "What is Ohm's Law?",
        options: ["V = I × R", "P = V × I", "I = C × V", "R = L / I"],
        correctIndex: 0,
        explanation: "Ohm's Law states V = I × R.",
      },
      {
        question: "A 12V source drives 100Ω. What is the current?",
        options: ["120 mA", "12 mA", "1.2 A", "0.12 mA"],
        correctIndex: 0,
        explanation: "I = V/R = 12/100 = 0.12 A = 120 mA.",
      },
      {
        question: "If resistance doubles and voltage stays the same, current:",
        options: ["Doubles", "Halves", "Stays the same", "Quadruples"],
        correctIndex: 1,
        explanation: "I = V/R, so doubling R halves I.",
      },
    ];
  }

  if (lesson.id === "b3-voltage-divider") {
    return [
      {
        question: "Two equal resistors divide 10V. Vout is:",
        options: ["10V", "5V", "2.5V", "0V"],
        correctIndex: 1,
        explanation: "Equal resistors split voltage equally: 10V / 2 = 5V.",
      },
      {
        question: "Voltage divider formula Vout = Vin × R2/(R1+R2) applies when:",
        options: [
          "Resistors are in series",
          "Resistors are in parallel",
          "Using capacitors only",
          "Using inductors only",
        ],
        correctIndex: 0,
        explanation: "The divider formula applies to series-connected resistors.",
      },
      {
        question: "Voltage dividers are commonly used to:",
        options: [
          "Create reference voltages for sensors",
          "Increase supply voltage",
          "Store energy",
          "Generate AC power",
        ],
        correctIndex: 0,
        explanation: "Dividers scale down voltage for sensor references and logic levels.",
      },
    ];
  }

  if (lesson.id === "b5-led-circuit") {
    return [
      {
        question: "Why does an LED need a series resistor?",
        options: [
          "To limit current and prevent burnout",
          "To increase brightness indefinitely",
          "To reverse polarity protection only",
          "LEDs don't need resistors",
        ],
        correctIndex: 0,
        explanation: "Without a resistor, excessive current destroys the LED.",
      },
      {
        question: "Typical LED forward current is:",
        options: ["10-20 mA", "1-2 A", "100 mA minimum", "0 A"],
        correctIndex: 0,
        explanation: "Most indicator LEDs run well at 10-20 mA.",
      },
      {
        question: "For 5V and a 2V LED at 15mA, resistor ≈",
        options: ["200Ω", "5Ω", "10kΩ", "1MΩ"],
        correctIndex: 0,
        explanation: "R = (5-2)/0.015 ≈ 200Ω.",
      },
    ];
  }

  return [q1, q2, q3];
}

const lessonsDir = path.join(root, "content/lessons");
fs.mkdirSync(lessonsDir, { recursive: true });

const allQuizzes = {};

for (const lesson of curriculum.lessons) {
  const bodyFn = topicContent[lesson.id] ?? topicContent.default;
  const body = typeof bodyFn === "function" ? bodyFn(lesson) : bodyFn;
  const quiz = getQuiz(lesson);
  allQuizzes[lesson.id] = quiz;

  const specialSim =
    lesson.circuitFile && !["b3-ohms-law", "b3-voltage-divider", "b5-led-circuit"].includes(lesson.id)
      ? `\n<CircuitSimulator circuitFile="${lesson.circuitFile}" lessonId="${lesson.id}" />\n`
      : "";

  const frontmatter = `---
title: "${lesson.title}"
lessonId: "${lesson.id}"
description: "${lesson.description}"
---

`;

  const quizBlock = "";

  const mdx = frontmatter + body + specialSim;
  const filePath = path.join(lessonsDir, `${lesson.slug}.mdx`);
  fs.writeFileSync(filePath, mdx);
  console.log("Generated:", lesson.slug);
}

console.log(`Done — ${curriculum.lessons.length} lessons.`);

fs.writeFileSync(
  path.join(root, "content/quizzes.json"),
  JSON.stringify(allQuizzes, null, 2)
);
console.log("Generated: quizzes.json");
