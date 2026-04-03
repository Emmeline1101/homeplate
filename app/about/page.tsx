import Link from 'next/link';
import Navbar from '../components/Navbar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — HomeBites',
  description: 'HomeBites is a side project by Emmeline — built to explore full-stack development and help local communities find less-sweet, home-cooked food.',
};

const STACK = [
  { label: 'Next.js 15', emoji: '⚡' },
  { label: 'TypeScript', emoji: '🔷' },
  { label: 'Supabase', emoji: '🗄️' },
  { label: 'Mapbox GL JS', emoji: '🗺️' },
  { label: 'Tailwind CSS', emoji: '🎨' },
  { label: 'Stripe', emoji: '💳' },
  { label: 'Claude API', emoji: '🤖' },
  { label: 'Resend', emoji: '📧' },
  { label: 'Vercel', emoji: '🚀' },
  { label: 'PostHog', emoji: '📊' },
];

const LOOKING_FOR = [
  {
    icon: '🤝',
    title: 'Someone to build with',
    description: 'A co-founder or collaborator — design, ops, community building, or engineering. The hard part right now is less technical than it is human.',
  },
  {
    icon: '🍳',
    title: 'Early cooks',
    description: 'Home cooks in any city who want to try listing what they make. You don\'t need a commercial kitchen — just food you\'re proud of.',
  },
  {
    icon: '🏘️',
    title: 'Community connectors',
    description: 'People already embedded in local communities — neighborhood groups, cultural orgs, local events — who see the value in this.',
  },
  {
    icon: '💬',
    title: 'Anyone with thoughts',
    description: 'If you have feedback, ideas, or just want to poke holes in the concept — that\'s genuinely useful too.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      <Navbar />

      <main className="max-w-3xl mx-auto px-5 py-14 md:py-20">

        {/* ── Hero ── */}
        <header className="mb-16">
          {/* Decorative top line */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1" style={{ backgroundColor: '#e8e0d4' }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">The person behind the plate</span>
            <div className="h-px flex-1" style={{ backgroundColor: '#e8e0d4' }} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-2 tracking-wide">Hi, I'm</p>
              <h1
                className="text-5xl md:text-6xl font-black tracking-tight leading-none"
                style={{ color: '#1a3a2a' }}
              >
                Emmeline
              </h1>
              <p className="mt-3 text-gray-500 text-base leading-relaxed max-w-sm">
                Software developer. Built HomeBites as a side project to practice full-stack engineering and scratch a real itch: finding good home-cooked food that isn't overwhelmingly sweet.
              </p>
            </div>

            {/* Avatar placeholder */}
            <div className="shrink-0">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center text-5xl shadow-md border-4 border-white"
                style={{ backgroundColor: '#1a3a2a' }}
              >
                👩‍💻
              </div>
            </div>
          </div>
        </header>

        {/* ── Story ── */}
        <section className="mb-16 space-y-6 text-gray-700 leading-relaxed text-[15px] md:text-base">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1a3a2a' }}>
            Why I built this
          </h2>

          <p>
            Honestly? Two reasons. First, I wanted a real project to build with — something with enough surface area to touch full-stack engineering end-to-end: auth, database design, maps, payments, real-time messaging, file uploads, moderation. The kind of thing you can't get from tutorials.
          </p>

          <p>
            Second, a genuine frustration: so much food in the US is way too sweet. Store-bought everything — bread, sauces, pastries — is loaded with sugar in a way that makes it hard to find food that actually tastes like food. Home cooks don't do that. People cooking for themselves and their neighbors tend to make things they actually want to eat.
          </p>

          {/* Pull quote */}
          <blockquote className="my-8 pl-5 border-l-4 border-amber-400 py-1">
            <p className="text-lg md:text-xl font-semibold italic leading-snug" style={{ color: '#1a3a2a' }}>
              "There are incredible home cooks in every neighborhood. They just have no way to reach their neighbors."
            </p>
          </blockquote>

          <p>
            Beyond the food itself — local communities in the US are pretty fragmented. People live near each other for years without ever really connecting. Food is one of the most natural ways to change that. A marketplace where neighbors cook for each other is also just a reason to talk.
          </p>

          {/* Callout card */}
          <div
            className="rounded-2xl p-6 border border-amber-200 my-8"
            style={{ backgroundColor: '#fffbf0' }}
          >
            <p className="text-sm font-bold text-amber-700 uppercase tracking-widest mb-2">What HomeBites is</p>
            <p className="text-gray-700 leading-relaxed">
              A peer-to-peer platform for home-cooked food. Cooks list what they're making; neighbors browse, request, and pick up. No commercial kitchen required — just good food, fairly priced, with real people behind it.
            </p>
          </div>

          <p>
            I'm building this solo right now — design, engineering, product. It's a learning project that I think could become something real. The technical side is nearly there. What's harder is community: getting the first cooks on, building trust, making the network actually useful.
          </p>

          <p className="font-medium" style={{ color: '#1a3a2a' }}>
            If that sounds interesting to you in any way, reach out.
          </p>
        </section>

        {/* ── Tech Stack ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6" style={{ color: '#1a3a2a' }}>
            Built with
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {STACK.map(({ label, emoji }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 shadow-sm"
              >
                <span>{emoji}</span>
                {label}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Plus TypeScript strict mode, Row Level Security everywhere, and a lot of PostHog funnels I anxiously check on weekends.
          </p>
        </section>

        {/* ── Looking for ── */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1a3a2a' }}>
            What I'm looking for
          </h2>
          <p className="text-sm text-gray-500 mb-7 leading-relaxed">
            This is early-stage. If any of it sounds interesting, I'm easy to reach.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {LOOKING_FOR.map(({ icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section>
          <div
            className="rounded-3xl p-8 md:p-10 text-center border border-amber-200"
            style={{ backgroundColor: '#fffbf0' }}
          >
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#1a3a2a' }}>
              Let's talk
            </h2>
            <p className="text-gray-500 text-sm mb-7 max-w-xs mx-auto leading-relaxed">
              Whether you're a potential collaborator, a home cook with an idea, or just someone who wants to say hi — my inbox is open.
            </p>

            <a
              href="mailto:emmelinexu23@gmail.com?subject=HomeBites — Let's Connect"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1a3a2a' }}
            >
              Send me a message
            </a>

            <p className="mt-5 text-xs text-gray-400 font-mono tracking-wide">
              emmelinexu23@gmail.com
            </p>
          </div>
        </section>

        {/* ── Footer nav ── */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
            ← Back to HomeBites
          </Link>
          <Link
            href="/discover"
            className="text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#1a3a2a' }}
          >
            Explore listings →
          </Link>
        </div>
      </main>
    </div>
  );
}
