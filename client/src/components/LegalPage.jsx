export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-editorial text-2xl text-parchment mb-3">{title}</h2>
      <div className="text-parchment/70 leading-relaxed flex flex-col gap-3">{children}</div>
    </section>
  );
}

export default function LegalPage({ title, updated, children }) {
  return (
    <div>
      <section className="bg-gold text-ink pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <h1 className="font-editorial text-4xl md:text-5xl">{title}</h1>
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-5 md:px-8 py-16 flex flex-col gap-10">
        {updated && <p className="text-parchment/40 text-xs -mb-4">Last updated: {updated}</p>}
        {children}
      </div>
    </div>
  );
}
