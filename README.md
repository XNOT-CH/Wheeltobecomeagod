# Wheel to Become a God

A personal oracle for developers. Spin for a category, spin again for a subtopic, then mark it done once you've studied it. Progress is tracked locally in your browser — nothing leaves the machine.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- `localStorage` for progress — no backend, no database

## Content

16 categories × 12 subtopics (192 total), each tier tagged beginner → intermediate → advanced:
Git & Version Control, SQL & Databases, Data Structures & Algo, System Design, Testing & QA, Networking, OOP & Design Patterns, DevOps & CI/CD, Security Basics, Frontend Development, Backend Development, Cloud & Infrastructure, AI/ML Fundamentals, Software Architecture, CS Fundamentals, Engineering Practice.

Edit `src/data/categories.ts` to add, remove, or reword topics.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/data/categories.ts` — the wheel's content (categories, subtopics, difficulty levels)
- `src/lib/useProgress.ts` — localStorage-backed progress hook
- `src/components/Wheel.tsx` — canvas wheel + spin animation
- `src/components/WheelApp.tsx` — the two-stage spin flow, progress panel, and state machine
