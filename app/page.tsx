import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            import Link from "next/link";
            />
            const services = [
              {
                title: "Residential Transformations",
                detail: "Kitchen, bath, and whole-home renovations designed around how families live.",
              },
              {
                title: "Commercial Buildouts",
                detail: "Retail, office, and hospitality spaces delivered with predictable timelines.",
              },
              {
                title: "Portfolio Project Support",
                detail: "Scalable construction programs for multi-unit, apartment, and mixed-use assets.",
              },
            ];
            Deploy Now
            const processSteps = [
              "Plan with clarity",
              "Design with intent",
              "Build with precision",
              "Deliver with confidence",
            ];
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
                <div className="min-h-screen px-5 py-8 md:px-10 md:py-12">
                  <main className="mx-auto max-w-6xl">
                    <header className="flex items-center justify-between">
                      <p className="font-display text-2xl font-bold tracking-tight">Catalyst Creations</p>
                      <div className="flex items-center gap-3">
                        <Link
                          href="mailto:hello@catalystcreations.co"
                          className="rounded-full border border-teal-600/30 bg-white/70 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-white"
                        >
                          Contact
                        </Link>
                      </div>
                    </header>

                    <section className="mt-10 grid gap-6 md:grid-cols-12">
                      <article className="md:col-span-8 rounded-3xl bg-[linear-gradient(125deg,#0f766e,#0ea5e9)] p-7 text-white shadow-[0_24px_60px_-24px_rgba(14,165,233,0.7)] md:p-10">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Design + Build Partner</p>
                        <h1 className="font-display mt-4 text-4xl font-bold leading-tight md:text-6xl">
                          We turn complex project goals into places people love to use.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base text-cyan-50 md:text-lg">
                          Catalyst Creations helps owners, developers, and operators move from concept to completion with one accountable team.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                          <Link
                            href="mailto:hello@catalystcreations.co"
                            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-800 hover:bg-slate-100"
                          >
                            Start a Project
                          </Link>
                          <Link
                            href="/login"
                            className="rounded-full border border-white/50 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
                          >
                            Client Portal
                          </Link>
                        </div>
                      </article>

                      <aside className="md:col-span-4 rounded-3xl border border-black/5 bg-[var(--color-card)] p-6 shadow-[0_20px_45px_-30px_rgba(0,0,0,0.55)]">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Our Process</p>
                        <ol className="mt-4 space-y-3">
                          {processSteps.map((step, index) => (
                            <li key={step} className="flex items-center gap-3 rounded-2xl bg-teal-50/70 px-3 py-3">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                                {index + 1}
                              </span>
                              <span className="text-sm font-semibold text-zinc-800">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </aside>
                    </section>

                    <section className="mt-8 rounded-3xl border border-black/5 bg-white/80 p-6 md:p-8">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">What We Build</p>
                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {services.map((service) => (
                          <article key={service.title} className="rounded-2xl border border-zinc-200 bg-[var(--color-card)] p-5">
                            <h2 className="font-display text-2xl font-bold text-zinc-900">{service.title}</h2>
                            <p className="mt-3 text-sm leading-relaxed text-zinc-600">{service.detail}</p>
                          </article>
                        ))}
                      </div>
                    </section>

                    <section className="mt-8 rounded-3xl border border-black/5 bg-zinc-900 p-6 text-white md:p-8">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-300">Catalyst Creations</p>
                      <p className="font-display mt-2 text-3xl font-bold md:text-4xl">Ready to build smarter, faster, and with less friction?</p>
                      <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
                        Share your project goals and timeline. We will map a practical scope, budget alignment, and execution path that works.
                      </p>
                      <div className="mt-6">
                        <Link
                          href="mailto:hello@catalystcreations.co"
                          className="inline-block rounded-full bg-teal-500 px-6 py-3 text-sm font-bold text-white hover:bg-teal-400"
                        >
                          Book a Discovery Call
                        </Link>
                      </div>
                    </section>

                    <footer className="pb-6 pt-8 text-center text-sm text-zinc-500">
                      Catalyst Creations · Design, Build, and Delivery Excellence
                    </footer>
                  </main>
                </div>
