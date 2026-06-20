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

## Example

A 9V battery connected to a 900Ω resistor:
- Current I = 9V / 900Ω = **0.01 A = 10 mA**

<Callout type="warning">
Always calculate expected current before powering a circuit. Excessive current destroys components!
</Callout>

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
