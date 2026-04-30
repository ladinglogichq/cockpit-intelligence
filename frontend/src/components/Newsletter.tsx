import { FormEvent, useState } from "react";
import { supabase } from "../utils/supabase";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "sent" | "duplicate" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = new FormData(e.currentTarget).get("email");
    const email = typeof raw === "string" ? raw.trim() : "";
    if (!email) return;

    const { error } = await supabase
      .from("newsletter_signups")
      .insert({ email });

    if (!error) { setStatus("sent"); return; }
    // Postgres unique violation code
    if (error.code === "23505") { setStatus("duplicate"); return; }
    setStatus("error");
  }

  return (
    <section
      id="newsletter"
      className="scroll-mt-24 relative overflow-hidden border-t border-ink/10 bg-ink"
    >
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <div>
            <h2 className="font-serif text-3xl font-normal tracking-tight text-canvas sm:text-4xl">
              Stay updated
            </h2>
            <p className="mt-4 text-lg text-canvas/80">
              Product notes, methodology posts, and release highlights. No spam; unsubscribe anytime.
            </p>
          </div>
          <div>
            {status === "sent" ? (
              <p className="border border-canvas/25 bg-canvas/10 px-6 py-8 text-canvas">
                Thanks. We&apos;ll be in touch when there&apos;s something worth your inbox.
              </p>
            ) : status === "duplicate" ? (
              <p className="border border-canvas/25 bg-canvas/10 px-6 py-8 text-canvas">
                You&apos;re already subscribed.
              </p>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                  <label className="sr-only" htmlFor="newsletter-email">
                    Email address
                  </label>
                  <div className="min-w-0 flex-1 border-b border-canvas/45 pb-2 focus-within:border-canvas">
                    <input
                      id="newsletter-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      placeholder="Enter email address…"
                      className="w-full bg-transparent text-base text-canvas placeholder:text-canvas/50 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center text-2xl font-light text-canvas transition-opacity hover:opacity-80"
                    aria-label="Subscribe to newsletter"
                  >
                    →
                  </button>
                </div>
                {status === "error" ? (
                  <p className="mt-3 text-sm text-canvas/70" role="alert">
                    Something went wrong. Please try again.
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
