export function ModuleText() {
  return (
    <section id="product" className="border-t border-ink/10 bg-canvas-subtle py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl">
            Built for evidence, not assumptions
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ink-muted">
            Legal sources, clause extraction, pillar mapping so agents work from primary documents, not summaries.
          </p>
          <div className="mt-8">
            <a
              href="#principles"
              className="inline-flex items-center justify-center bg-accent px-5 py-2.5 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
            >
              Read the principles
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
