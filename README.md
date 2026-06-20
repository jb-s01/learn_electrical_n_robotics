# ElectroLearn

A browser-based electronics and electrical engineering learning platform. Learn visually with interactive circuit simulation, progress through a structured beginner → intermediate → advanced curriculum, and chat with a local AI tutor powered by Ollama.

## Features

- **Visual learning** — Interactive diagrams and CircuitJS1 circuit simulator embedded in lessons
- **Structured curriculum** — 36 core lessons across beginner, intermediate, and advanced levels
- **Optional tracks** — Robotics and Embedded AI opt-in paths at intermediate/advanced
- **AI tutor** — Local Ollama integration with a senior engineer persona for beginners
- **Progress tracking** — SQLite-backed lesson completion, quizzes, and lab checkpoints

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.com/) (for AI tutor)

## Quick Start

```bash
# Install and pull a small open-source model
ollama pull llama3.2:3b
ollama serve

# In another terminal — run the app
npm install
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.local` (already included for local dev):

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.2:3b
DATABASE_URL=file:./data/progress.db
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Initialize SQLite database directory |
| `npm run generate:lessons` | Regenerate MDX lessons from curriculum.json |

## Curriculum Structure

### Beginner (B1–B5)
Foundations, components, Ohm's law, tools & safety, first circuits

### Intermediate (I1–I5)
AC & signals, semiconductors, digital logic, microcontrollers, sensors & actuators

### Advanced (A1–A5)
Power electronics, communication buses, PID control, PCB design, system integration

### Optional Tracks
- **Robotics** — Kinematics, motors, ROS 2 concepts, SLAM, path planning
- **Embedded AI** — TinyML, TFLite Micro, quantization, NPU deployment

## AI Tutor

The tutor runs entirely locally via Ollama. Recommended models:

- `llama3.2:3b` — Fast, runs on modest hardware (default)
- `phi3:mini` — Good instruction following
- `qwen2.5:7b` — Higher quality if you have GPU RAM

Lessons work without Ollama — only the chat feature requires it.

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- CircuitJS1 (self-hosted)
- Ollama + Vercel AI SDK
- SQLite + Drizzle ORM
- MDX lesson content

## License

MIT
