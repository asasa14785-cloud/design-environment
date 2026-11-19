export default function App() {
  const facts = [
    ['Duration', '45.0 s'],
    ['Format', '1920×1080 · 30 fps · H.264 + AAC'],
    ['Tempo', '128 BPM · 24 bars'],
    ['Stack', 'Remotion · Three.js · GSAP · SVG · Canvas'],
    ['Voice', 'Piper neural TTS (open source)'],
    ['SFX / Music', 'Mixkit free SFX · code-synthesised music'],
  ];
  return (
    <main className="min-h-screen bg-[#04060f] text-slate-100 flex flex-col items-center px-6 py-10 gap-8">
      <header className="text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-cyan-300/80">Concept film · fan-made</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white to-indigo-300 bg-clip-text text-transparent">
          DeepSeek V4 — Think deeper.
        </h1>
      </header>
      <div className="w-full max-w-5xl rounded-3xl border border-white/20 bg-white/5 p-2 backdrop-blur-xl shadow-2xl shadow-indigo-900/40">
        <video className="w-full rounded-2xl" src="/deepseek-v4-ad.mp4" controls playsInline preload="metadata" />
      </div>
      <dl className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-white/15 bg-white/5 px-5 py-4 backdrop-blur">
            <dt className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{k}</dt>
            <dd className="mt-1 text-sm text-slate-100">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="max-w-3xl text-center text-xs text-slate-500">
        Source: <code>motion-lab/</code> (Remotion project). Names and copy are placeholders for a concept ad; no real product claims are made.
      </p>
    </main>
  );
}
