export default function ContactPage() {
  const email =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@throwdownpottery.com";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24">
      <div className="mb-12">
        <p className="text-sage text-xs uppercase tracking-widest mb-2">Say hello</p>
        <h1 className="font-serif text-4xl md:text-5xl text-stone">Contact</h1>
      </div>
      <div className="space-y-6 text-stone/70">
        <p className="text-lg leading-relaxed">
          Interested in a piece, want to discuss a commission, or just want to get in touch? We'd love to hear from you.
        </p>
        <p>
          Email us at{" "}
          <a
            href={`mailto:${email}`}
            className="text-clay hover:text-amber transition-colors underline underline-offset-2"
          >
            {email}
          </a>
        </p>
        <p className="text-sm text-stone/40">We typically respond within 2–3 business days.</p>
      </div>
    </div>
  );
}
