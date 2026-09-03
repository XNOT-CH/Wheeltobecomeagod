"use client";

import { useMemo, useRef, useState } from "react";
import { CATEGORIES, LEVEL_LABEL, LEVEL_VAR, WHEEL_PALETTE, type Level } from "@/data/categories";
import { useProgress } from "@/lib/useProgress";
import { Wheel, type WheelHandle } from "./Wheel";

type Stage = "category" | "topic-ready" | "topic-spinning" | "result";

const STEPS = ["หมวดหมู่", "หัวข้อย่อย", "ลงมือทำ"];

export function WheelApp() {
  const { progress, hydrated, markDone, isDone } = useProgress();
  const wheelRef = useRef<WheelHandle>(null);

  const [stage, setStage] = useState<Stage>("category");
  const [spinning, setSpinning] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<{ name: string; level: Level } | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);

  const categoryNames = useMemo(() => CATEGORIES.map((c) => c.name), []);
  const activeCategory = CATEGORIES.find((c) => c.name === currentCategory) ?? null;

  const stepIndex = stage === "category" ? 0 : stage === "topic-ready" || stage === "topic-spinning" ? 1 : 2;

  const wheelLabels = stage === "topic-spinning" || stage === "result"
    ? activeCategory?.topics.map((t) => t.name) ?? categoryNames
    : categoryNames;

  const overall = useMemo(() => {
    let done = 0;
    let total = 0;
    CATEGORIES.forEach((c) => c.topics.forEach((t) => {
      total++;
      if (progress[c.name]?.[t.name]) done++;
    }));
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [progress]);

  async function handleSpin() {
    if (spinning || !wheelRef.current) return;
    setSpinning(true);

    if (stage === "category") {
      const idx = await wheelRef.current.spin();
      const name = categoryNames[idx];
      setCurrentCategory(name);
      setCurrentTopic(null);
      setStage("topic-ready");
      setSpinning(false);
      return;
    }

    if (stage === "topic-ready" && activeCategory) {
      setStage("topic-spinning");
      // let the wheel repaint with the new label set before spinning
      requestAnimationFrame(async () => {
        const idx = await wheelRef.current!.spin();
        const topic = activeCategory.topics[idx];
        setCurrentTopic(topic);
        setStage("result");
        setSpinning(false);
      });
    }
  }

  function startOver() {
    setStage("category");
    setCurrentCategory(null);
    setCurrentTopic(null);
    setSavedJustNow(false);
  }

  function handleMarkDone() {
    if (!currentCategory || !currentTopic) return;
    markDone(currentCategory, currentTopic.name);
    setSavedJustNow(true);
  }

  const resultLabel =
    stage === "category"
      ? "รอการหมุนครั้งแรก"
      : stage === "topic-ready"
        ? "ได้หมวดหมู่"
        : stage === "topic-spinning"
          ? "กำลังหมุนหาหัวข้อ…"
          : currentTopic
            ? `หัวข้อของคุณคือ (ระดับ ${LEVEL_LABEL[currentTopic.level]})`
            : "";

  const verdictText =
    stage === "category" ? "—" : stage === "result" ? currentTopic?.name ?? "—" : currentCategory ?? "—";

  const verdictColor = stage === "result" && currentTopic ? LEVEL_VAR[currentTopic.level] : "var(--color-gold)";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-7 px-6 py-10 sm:py-14">
      <header className="flex flex-col items-center gap-2 text-center">
        <span className="font-mono text-[11px] tracking-[0.28em] text-gold uppercase">
          A Personal Oracle for Developers
        </span>
        <h1 className="text-balance font-display text-3xl font-semibold tracking-wide sm:text-4xl">
          Wheel to Become a God
        </h1>
        <p className="max-w-prose text-sm text-muted">
          หมุนหาหมวดที่ต้องศึกษา แล้วหมุนอีกครั้งเพื่อสุ่มหัวข้อย่อย — ทำเสร็จแล้วค่อยกดยืนยัน
        </p>
        <div className="mt-1 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
          {STEPS.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 ${
                  i === stepIndex
                    ? "border-gold bg-gold text-bg"
                    : i < stepIndex
                      ? "border-sage text-sage"
                      : "border-line"
                }`}
              >
                {i + 1} · {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-line" />}
            </span>
          ))}
        </div>
      </header>

      <main className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="flex flex-col items-center gap-5 rounded-[20px] border border-line bg-surface p-8"
          style={{ boxShadow: "0 24px 60px -30px var(--color-shadow)" }}
        >
          <div className="relative w-full max-w-[380px] aspect-square">
            <div
              className="absolute left-1/2 top-[-6px] z-10 h-0 w-0 -translate-x-1/2"
              style={{
                borderLeft: "13px solid transparent",
                borderRight: "13px solid transparent",
                borderTop: "22px solid var(--color-crimson)",
                filter: "drop-shadow(0 4px 6px var(--color-shadow))",
              }}
            />
            <Wheel ref={wheelRef} labels={wheelLabels} />
            <div
              className="absolute left-1/2 top-1/2 z-[2] h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
              style={{
                background: "radial-gradient(circle at 35% 30%, var(--color-gold), var(--color-gold-soft))",
                boxShadow: "0 4px 12px var(--color-shadow)",
              }}
            />
          </div>

          {stage !== "result" && (
            <button
              type="button"
              onClick={handleSpin}
              disabled={spinning}
              className="rounded-full bg-linear-to-b from-gold to-gold-soft px-9 py-3.5 font-display text-[13.5px] font-semibold tracking-wider text-bg uppercase shadow-[0_10px_24px_-10px_var(--color-shadow)] disabled:opacity-45"
            >
              {stage === "category" ? "หมุนหาหมวดหมู่" : "หมุนหาหัวข้อย่อย"}
            </button>
          )}

          <div className="flex min-h-10 w-full flex-col items-center gap-2.5 text-center">
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">{resultLabel}</span>
            <span className="font-display text-[19px]" style={{ color: verdictColor }}>
              {verdictText}
            </span>
            {stage === "result" && (
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleMarkDone}
                  disabled={savedJustNow}
                  className="rounded-full bg-linear-to-b from-gold to-gold-soft px-9 py-3.5 font-display text-[13.5px] font-semibold tracking-wider text-bg uppercase shadow-[0_10px_24px_-10px_var(--color-shadow)] disabled:opacity-70"
                >
                  {savedJustNow ? "บันทึกแล้ว ✓" : "ทำเสร็จแล้ว ✓"}
                </button>
                <button
                  type="button"
                  onClick={startOver}
                  className="rounded-full border border-line px-[22px] py-2.5 text-[13px] font-semibold text-muted hover:border-gold hover:text-gold"
                >
                  หมุนใหม่
                </button>
              </div>
            )}
          </div>
        </section>

        <aside
          className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-6"
          style={{ boxShadow: "0 24px 60px -30px var(--color-shadow)" }}
        >
          <div>
            <h2 className="font-display text-[14.5px] font-semibold tracking-wide">Progress</h2>
            <p className="mt-1 text-[12.5px] text-muted">เก็บไว้ในเบราว์เซอร์นี้เท่านั้น ไม่มีการซิงก์ไปที่ไหน</p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="relative flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full"
              style={{ background: `conic-gradient(var(--color-gold) ${overall.pct}%, var(--color-surface-2) 0)` }}
            >
              <div className="absolute h-[38px] w-[38px] rounded-full bg-surface" />
              <span className="relative font-mono text-[11px]">{hydrated ? `${overall.pct}%` : "…"}</span>
            </div>
            <p className="text-[13px] text-muted">
              ทำไปแล้ว <b className="font-mono text-ink">{hydrated ? overall.done : "…"}</b> /{" "}
              <b className="font-mono text-ink">{overall.total}</b> หัวข้อ
            </p>
          </div>

          <div className="wheel-scrollbar flex max-h-[340px] flex-col gap-1.5 overflow-y-auto pr-0.5">
            {CATEGORIES.map((c, i) => {
              const catDone = c.topics.filter((t) => progress[c.name]?.[t.name]).length;
              const pct = (catDone / c.topics.length) * 100;
              return (
                <div
                  key={c.name}
                  className={`grid grid-cols-[10px_1fr_auto] items-center gap-2.5 rounded-[10px] border bg-surface-2 px-2.5 py-2 ${
                    currentCategory === c.name ? "border-gold" : "border-transparent"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: WHEEL_PALETTE[i % WHEEL_PALETTE.length] }}
                  />
                  <span className="text-[13.5px] font-semibold">{c.name}</span>
                  <span className="font-mono text-[11.5px] text-muted">
                    {catDone}/{c.topics.length}
                  </span>
                  <div className="col-span-3 h-1 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {activeCategory && (
            <div>
              <h2 className="mb-2.5 font-display text-[14.5px] font-semibold tracking-wide">
                หัวข้อใน <span className="text-gold">{activeCategory.name}</span>
              </h2>
              <div className="flex flex-col gap-1.5">
                {activeCategory.topics.map((t) => {
                  const done = isDone(activeCategory.name, t.name);
                  const current = currentTopic?.name === t.name;
                  return (
                    <div key={t.name} className="flex items-center gap-2 py-1 text-[13px]">
                      <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: LEVEL_VAR[t.level] }} />
                      <span
                        className={
                          done ? "text-muted line-through" : current ? "font-bold text-gold" : "text-ink"
                        }
                      >
                        {t.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </main>

      <footer className="text-center font-mono text-xs tracking-wide text-muted">
        run locally · progress saved to localStorage · beginner → advanced content
      </footer>
    </div>
  );
}
