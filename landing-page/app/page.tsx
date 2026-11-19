"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

interface WaitlistFormData {
  name: string;
  email: string;
  university: string;
  excited_about: string;
  consent: boolean;
  website?: string;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroCount, setHeroCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toast, setToast] = useState("");
  const [heroSubmitted, setHeroSubmitted] = useState(false);
  const [mainSubmitted, setMainSubmitted] = useState(false);
  const [heroEmail, setHeroEmail] = useState("");
  const [mainFormData, setMainFormData] = useState<WaitlistFormData>({
    name: "",
    email: "",
    university: "",
    excited_about: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [mainError, setMainError] = useState("");
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    loadCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      if (phoneRef.current && window.scrollY < 600) {
        const tiltY = -18 + window.scrollY * 0.012;
        const tiltX = 5 - window.scrollY * 0.005;
        phoneRef.current.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadCount = async () => {
    try {
      const { data, error } = await supabase.rpc("get_waitlist_count");
      if (error) throw error;
      if (typeof data === "number") {
        setHeroCount(data);
      }
    } catch (error) {
      console.error("Failed to load count:", error);
      setHeroCount(0);
    }
  };

const showToast = (msg: string) => {
  setToast(msg);
  setTimeout(() => setToast(""), 3000);
};

const handleHeroWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroEmail) return;

    setIsSubmitting(true);
    setHeroError("");

    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          name: heroEmail.split("@")[0],
          email: heroEmail.toLowerCase().trim(),
          university: null,
          excited_about: null,
          consent: true,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          setHeroError("This email is already on the list!");
          setHeroEmail("");
        } else {
          setHeroError("Something went wrong. Try again.");
        }
        return;
      }

      setHeroSubmitted(true);
      setHeroCount((c) => (c ?? 0) + 1);
      showToast("Welcome aboard! Check your email for confirmation.");
    } catch (error) {
      setHeroError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMainWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mainFormData.consent) {
      setMainError("Please agree to the Privacy Policy to continue.");
      return;
    }

    setIsSubmitting(true);
setMainError("");

    try {
      const { error } = await supabase.from("waitlist").insert([
        {
          name: mainFormData.name.trim(),
          email: mainFormData.email.toLowerCase().trim(),
          university: mainFormData.university || null,
          excited_about: mainFormData.excited_about.trim() || null,
          consent: mainFormData.consent,
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          setMainError("This email is already on the list!");
          setMainFormData({
            name: "",
            email: "",
            university: "",
            excited_about: "",
            consent: false,
          });
        } else {
          setMainError("Something went wrong. Try again.");
        }
        return;
      }

      setMainSubmitted(true);
      setHeroCount((c) => (c ?? 0) + 1);
      showToast("Welcome aboard! Check your email for confirmation.");
    } catch (error) {
      setMainError("Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "Is RideShare free?", a: "Yes, completely. RideShare is a matching platform — we connect you with ride buddies. You pay the boda rider directly and split the cost between yourselves. We never handle any money." },
    { q: "Is my data safe?", a: "We deliberately do not collect phone numbers — all communication happens through in-app chat that expires after your ride. Your email is only used for account verification and launch notifications. We comply with Uganda's Data Protection Act 2019." },
    { q: "What if I don't go to a listed university?", a: 'Select "Other" on the waitlist form and tell us your university. We\'re expanding based on demand — if enough students from your campus sign up, you\'ll be our next launch target.' },
    { q: "How does the Safety PIN work?", a: "When your join request is accepted, you each get a unique 4-digit PIN. At the meetup point, you share your PIN verbally and enter theirs. If they match, you're with the right person. If not — walk away. It's simple, offline-friendly, and doesn't require storing sensitive data." },
    { q: "How do I install the app?", a: "Android users can download the APK directly from this website when we launch. iPhone users will receive a TestFlight invitation via email. No app store needed — we keep it simple." },
    { q: "Can I use a non-university email?", a: 'Yes, but you\'ll be flagged as "Ride with Caution" — meaning other students will see you haven\'t been verified through a university email. This affects whether people accept your requests. We strongly recommend using your university email.' },
  ];

  const features = [
    { icon: "fa-graduation-cap", bg: "bg-accent/10", color: "text-accent", title: "Campus-Only Network", desc: "Sign up with your university email. You only see rides from students at your campus — no noise from other cities." },
    { icon: "fa-star", bg: "bg-amber/10", color: "text-amber", title: "Trust Scores", desc: "Every completed ride builds your reliability rating. See a buddy's trust score before you ride together." },
    { icon: "fa-shield-halved", bg: "bg-cyan/10", color: "text-cyan", title: "Safety PIN Verification", desc: "A 4-digit PIN exchange at the meetup point confirms you're meeting the right person. No impersonation." },
    { icon: "fa-calendar-days", bg: "bg-purple/10", color: "text-purple", title: "Plan Ahead", desc: "Post rides up to 7 days in advance. Perfect for market days, weekend plans, and semester travels." },
    { icon: "fa-venus-mars", bg: "bg-orange/10", color: "text-orange", title: "Same-Gender Rides", desc: "Choose same-gender preference when posting or searching. Your comfort, your choice." },
  ];

  const testimonials = [
    {text: '"I have a really good feeling about this and think it\'s going to be great. Looking down the road, I can tell that using this app is going to save me a whole lot of time, hassle, and money."', name: "Mumanye Timothy", meta: "MUST, 3rd Year", avatar: { bg: "bg-pink-500/15", color: "text-pink-500", initials: "MT" } },
    {text: '"If I\'m being completely honest, I do still have some lingering skepticism regarding the security concerns. Despite that, I genuinely can\'t wait to see how everything plays out."', name: "Naturinda Brighton", meta: "MUST, 3rd Year", avatar: { bg: "bg-blue-500/15", color: "text-blue-500", initials: "NB" } },
    {text: '"It’s kind of a bummer that this is just coming out right as I\'m finishing up my studies. It would have seriously saved me so much time and been a huge help along the way."', name: "Balinda Mubarak", meta: "MUST, Finalist", avatar: { bg: "bg-green-500/15", color: "text-green-500", initials: "GM" } },
  ];

  return (
    <div className="bg-bg min-h-screen text-text overflow-x-hidden font-body">
      {/* Page Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,230,118,0.06),transparent_60%),radial-gradient(ellipse_40%_40%_at_80%_80%,rgba(255,179,0,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-{[48px_48px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-100 h-16 px-4 md:px-8 flex items-center justify-between transition-colors duration-300 border-b ${scrolled ? "bg-bg/95" : "bg-bg/70"} backdrop-blur-xl border-white/5`}>
        <div className="flex items-center gap-2.5 font-display font-bold text-xl tracking-tight">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
            <i className="fas fa-motorcycle text-black text-sm -rotate-12" />
          </div>
          Ride<span className="text-accent">Share</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <a href="#problem" className="text-sm font-medium text-text3 px-4 py-2 rounded-lg hover:text-text2 hover:bg-white/5 transition-colors">Why</a>
          <a href="#features" className="text-sm font-medium text-text3 px-4 py-2 rounded-lg hover:text-text2 hover:bg-white/5 transition-colors">Features</a>
          <a href="#how" className="text-sm font-medium text-text3 px-4 py-2 rounded-lg hover:text-text2 hover:bg-white/5 transition-colors">How It Works</a>
          <a href="#faq" className="text-sm font-medium text-text3 px-4 py-2 rounded-lg hover:text-text2 hover:bg-white/5 transition-colors">FAQ</a>
          <a href="#waitlist" className="text-sm font-semibold bg-accent text-black px-5 py-2 rounded-lg hover:bg-accent2 hover:-translate-y-0.5 transition-all">Get Notified</a>
        </div>
        <button className="flex md:hidden w-10 h-10 rounded-lg border border-border items-center justify-center text-text hover:bg-white/5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <i className="fas fa-bars" />
        </button>
      </nav>

{/* Mobile Menu */}
{mobileMenuOpen && (
<div className="fixed inset-0 z-[101] bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center gap-3 md:hidden">
<a href="#problem" className="text-xl font-medium text-text3 px-8 py-3 hover:text-text hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Why</a>
<a href="#features" className="text-xl font-medium text-text3 px-8 py-3 hover:text-text hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>Features</a>
<a href="#how" className="text-xl font-medium text-text3 px-8 py-3 hover:text-text hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
<a href="#faq" className="text-xl font-medium text-text3 px-8 py-3 hover:text-text hover:bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
<a href="#waitlist" className="text-base font-semibold bg-accent text-black px-6 py-3 rounded-lg mt-4" onClick={() => setMobileMenuOpen(false)}>Get Notified</a>
<button className="absolute top-5 right-4 w-12 h-12 rounded-lg border border-border flex items-center justify-center text-text hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
<i className="fas fa-xmark text-lg" />
</button>
</div>
)}

      <main className="relative z-10">
{/* Hero Section */}
<section className="pt-28 md:pt-36 pb-16 md:pb-20 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
<div className="flex-1 text-center md:text-left order-2 md:order-none">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-aglow border border-accent/20 text-accent text-sm font-semibold mb-6">
              <i className="fas fa-circle text-[10px]" /> Coming to Ugandan universities
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.05] mb-5">
              Split the ride,<br />not the <em className="text-accent not-italic">wallet</em>
            </h1>
            <p className="text-lg md:text-xl text-text2 leading-relaxed max-w-lg mx-auto md:mx-0 mb-8">
              Find ride buddies heading your way, share a boda-boda, and cut your transport costs in half. Built for students, by students.
            </p>
{!heroSubmitted ? (
  <form className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto md:mx-0 mb-6" onSubmit={handleHeroWaitlist}>
    <input
      type="email"
      placeholder="your@email.com"
      required
      value={heroEmail}
      onChange={(e) => setHeroEmail(e.target.value)}
      className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-bg2 text-text outline-none focus:border-accent transition-colors placeholder:text-text3"
    />
    <button
      type="submit"
      disabled={isSubmitting}
      className="px-6 py-3.5 rounded-xl bg-accent text-black font-semibold hover:bg-accent2 hover:-translate-y-0.5 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {isSubmitting ? "Joining..." : "Get Notified"}
    </button>
  </form>
) : (
  <div className="max-w-md mx-auto md:mx-0 p-5 text-center text-accent font-semibold">
    <i className="fas fa-check-circle text-2xl mb-2" />
    <div>You&apos;re on the list!</div>
  </div>
)}
{heroError && !heroSubmitted && (
        <p className="text-red text-sm mt-2 max-w-md mx-auto md:mx-0 text-center">{heroError}</p>
      )}
<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-text3">
  <span><i className="fas fa-check-circle text-accent text-[11px]" /> No spam, ever</span>
  <span><i className="fas fa-check-circle text-accent text-[11px]" /> Free to use</span>
  <span><i className="fas fa-users text-accent text-[11px]" /> <strong className="text-text">{mounted && heroCount !== null ? heroCount.toLocaleString() : "..."}</strong> students waiting</span>
</div>
          </div>

{/* Phone Mockup */}
<div className="w-70 h-[500px] md:w-[380px] md:h-[440px] relative flex-shrink-0 order-1 md:order-none overflow-visible" style={{ perspective: "1200px" }}>
            <div className="absolute inset-[-40px] bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:32px_32px] rounded-2xl -z-10" />
            <div ref={phoneRef} className="w-full h-full transition-transform duration-500 ease-out" style={{ transformStyle: "preserve-3d", transform: "rotateY(-18deg) rotateX(5deg)" }}>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[460px] md:w-[280px] md:h-[580px] rounded-[30px] md:rounded-[36px] border-[3px] border-[#2A2A2A] bg-black overflow-hidden shadow-[0_60px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03),0_0_120px_rgba(0,230,118,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[84px] md:w-[100px] h-[22px] md:h-[26px] bg-black rounded-b-2xl z-10">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#111] rounded-full border border-[#222]" />
                </div>
                <div className="absolute inset-0 flex flex-col pt-12 p-4 md:p-5 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
                  <div className="text-[11px] text-gray-500 mb-0.5">Good evening</div>
                  <div className="font-display text-lg font-bold text-gray-900 mb-3">Alex</div>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 mb-3 text-xs text-gray-400">
                    <i className="fas fa-search" />Search destinations...
                  </div>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    <div className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold border border-accent bg-accent/10 text-green-600">Same Gender</div>
                    <div className="px-2.5 py-1.5 rounded-full text-[10px] font-semibold border border-gray-200 bg-white text-gray-400">&lt; 5 min</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 mb-2 shadow-sm">
                    <div className="text-xs font-semibold text-gray-800">Main Campus Gate</div>
                    <div className="text-xs font-semibold text-green-600 mb-1.5">Mbarara Town Centre</div>
                    <div className="flex gap-2 text-[10px] text-gray-400 items-center flex-wrap">
                      <i className="fas fa-bolt text-green-600" />
                      <span>Leaving now</span>
                      <span className="text-gray-300">·</span>
                      <span><i className="fas fa-venus mr-1" />Same gender</span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5.5 h-5.5 rounded-full bg-pink-500/15 text-pink-500 flex items-center justify-center text-[8px] font-bold">FH</div>
                        <span className="text-[11px] font-semibold text-gray-700">Fatima H.</span>
                      </div>
                      <span className="text-[10px] text-gray-400">2 min</span>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                    <div className="text-xs font-semibold text-gray-800">Hostel A Parking</div>
                    <div className="text-xs font-semibold text-green-600 mb-1.5">Mbarara Market</div>
                    <div className="flex gap-2 text-[10px] items-center">
                      <i className="far fa-clock text-amber-500" />
                      <span className="text-amber-500">Wed 10:00</span>
                    </div>
                  </div>
                  <div className="absolute bottom-16 right-5 w-11 h-11 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                    <i className="fas fa-plus text-black text-lg" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100/95 to-transparent flex items-center justify-around px-4 pb-3">
                  <div className="flex flex-col items-center gap-0.5"><i className="fas fa-house text-green-600" /><span className="text-[8px] text-green-600">Home</span></div>
                  <div className="flex flex-col items-center gap-0.5"><i className="fas fa-list-check text-gray-400" /><span className="text-[8px] text-gray-400">Rides</span></div>
                  <div className="flex flex-col items-center gap-0.5"><i className="fas fa-user text-gray-400" /><span className="text-[8px] text-gray-400">Profile</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto" id="problem">
          <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">The Problem</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4 leading-tight">You&apos;re overpaying for<br />empty boda seats</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-8 rounded-2xl bg-red/5 border border-red/10">
              <div className="w-12 h-12 rounded-xl bg-red/10 flex items-center justify-center text-red mb-5"><i className="fas fa-wallet" /></div>
              <h3 className="font-display text-xl font-bold mb-3 tracking-tight">Every ride, full fare</h3>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-xmark text-red mt-1 text-xs" />Students spend 20-30% of their allowance on transport alone</li>
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-xmark text-red mt-1 text-xs" />You&apos;re paying for the whole boda even when sharing the route</li>
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-xmark text-red mt-1 text-xs" />No organized way to find someone going the same way</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-aglow border border-accent/10">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-5"><i className="fas fa-scissors" /></div>
              <h3 className="font-display text-xl font-bold mb-3 tracking-tight">Half the cost, same route</h3>
              <ul className="flex flex-col gap-2.5">
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-check text-accent mt-1 text-xs" />Find a ride buddy going your direction in seconds</li>
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-check text-accent mt-1 text-xs" />Split the fare equally — always fair, always transparent</li>
                <li className="flex items-start gap-2.5 text-sm text-text2"><i className="fas fa-check text-accent mt-1 text-xs" />Built by students who understand the struggle</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto" id="features">
          <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">What to Expect</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Built different</h2>
          <p className="text-base text-text2 max-w-lg leading-relaxed mb-12">Not another ride-hailing app. RideShare is a student-only matching platform designed around trust, safety, and the reality of campus life.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-border2 hover:bg-card2 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent opacity-0 blur-3xl transition-opacity group-hover:opacity-[0.04]" />
                <div className={`w-13 h-13 rounded-2xl ${f.bg} flex items-center justify-center mb-4 text-xl ${f.color}`}><i className={`fas ${f.icon}`} /></div>
                <h3 className="font-display text-lg font-bold mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-text2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto" id="how">
          <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">The Experience</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Three steps to a cheaper ride</h2>
          <p className="text-base text-text2 max-w-lg leading-relaxed mx-auto mb-12">From opening the app to arriving at your destination.</p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-0 relative">
            {[
              { num: 1, title: "Post or Find", desc: "Post your ride with origin, destination, and departure time — or scroll the feed to find a ride going your way." },
              { num: 2, title: "Request & Chat", desc: "Tap \"Request to Join.\" Once accepted, use in-app chat to coordinate your meetup point and share identity cues." },
              { num: 3, title: "Verify & Ride", desc: "Exchange Safety PINs at the meetup, hop on the boda, split the fare, and rate each other after." },
            ].map((step, i) => (
              <div key={i} className="text-center px-4 md:px-8 relative">
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border flex items-center justify-center mx-auto mb-5 font-display text-2xl font-bold text-accent relative z-10">
                  {step.num}
                  {i < 2 && <div className="hidden md:block absolute top-1/2 left-full w-[calc(100%-5rem)] h-0.5 bg-linear-to-r from-border2 to-border" />}
                </div>
                <h3 className="font-display text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-sm text-text2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">From Beta Testers</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">What students are saying</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <p className="text-sm text-text2 leading-relaxed mb-4 italic">{t.text}</p>
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full ${t.avatar.bg} ${t.avatar.color} flex items-center justify-center text-sm font-bold`}>{t.avatar.initials}</div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-[11px] text-text3">{t.meta}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Badges */}
        <section className="py-12 md:py-20 px-4 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">Availability</div>
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">Get the app</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-bg2 text-sm text-text2 font-medium cursor-pointer hover:border-accent hover:text-accent hover:bg-aglow transition-colors">
              <i className="fab fa-android text-lg" /> Download APK for Android
            </div>
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-bg2 text-sm text-text2 font-medium cursor-pointer hover:border-accent hover:text-accent hover:bg-aglow transition-colors">
              <i className="fab fa-apple text-lg" /> Join via TestFlight for iOS
            </div>
          </div>
          <p className="text-center text-sm text-text3 mt-4">Available on this website when we launch</p>
        </section>

        {/* Waitlist Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto" id="waitlist">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-accent blur-[150px] opacity-[0.08]" />
            <div className="relative">
              <div className="text-center text-accent font-semibold text-sm mb-2"><i className="fas fa-bell mr-1.5" /> GET NOTIFIED</div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-center tracking-tight mb-2">Get notified when we launch</h2>
              <p className="text-center text-text2 text-base mb-8">Be the first to ride when we launch at your university. We&apos;ll send you one email — that&apos;s it.</p>
{!mainSubmitted ? (
  <form className="flex flex-col gap-3" onSubmit={handleMainWaitlist}>
    <input
      type="text"
      name="name"
      placeholder="Full name"
      required
      value={mainFormData.name}
      onChange={(e) => setMainFormData({ ...mainFormData, name: e.target.value })}
      className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg2 text-text outline-none focus:border-accent transition-colors placeholder:text-text3"
    />
    <input
      type="email"
      name="email"
      placeholder="Email"
      required
      value={mainFormData.email}
      onChange={(e) => setMainFormData({ ...mainFormData, email: e.target.value })}
      className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg2 text-text outline-none focus:border-accent transition-colors placeholder:text-text3"
    />
    <select
      required
      value={mainFormData.university}
      onChange={(e) => setMainFormData({ ...mainFormData, university: e.target.value })}
      className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg2 text-text outline-none focus:border-accent transition-colors cursor-pointer"
    >
      <option value="" disabled>Select your university</option>
      <option value="MUST">Mbarara University (MUST)</option>
      <option value="MAK">Makerere University (MAK)</option>
      <option value="KAB">Kabale University (KAB)</option>
      <option value="KYU">Kyambogo University (KYU)</option>
      <option value="MUNI">Muni University (MUNI)</option>
      <option value="GULU">Gulu University (GULU)</option>
      <option value="Other">Other</option>
    </select>
    <textarea
      placeholder="What are you most excited about? (optional)"
      value={mainFormData.excited_about}
      onChange={(e) => setMainFormData({ ...mainFormData, excited_about: e.target.value })}
      className="w-full px-4 py-3.5 rounded-xl border border-border bg-bg2 text-text outline-none focus:border-accent transition-colors resize-none h-18 placeholder:text-text3"
    />
    <label className="flex items-start gap-2 text-xs text-text3 cursor-pointer">
      <input
        type="checkbox"
        checked={mainFormData.consent}
        onChange={(e) => setMainFormData({ ...mainFormData, consent: e.target.checked })}
        className="mt-0.5 accent-accent shrink-0 w-4 h-4"
      />
      <span>I agree to the <Link href="/legal" className="text-accent underline underline-offset-2 hover:text-accent2">Privacy Policy</Link> and understand my email will only be used to notify me about RideShare&apos;s launch.</span>
    </label>
{mainError && (
        <p className="text-red text-sm text-center">{mainError}</p>
      )}
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full py-4 rounded-xl bg-accent text-black text-base font-bold hover:bg-accent2 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
    >
      {isSubmitting ? "Joining..." : "Get Notified"}
    </button>
  </form>
) : (
  <div className="text-center py-6">
    <div className="w-14 h-14 rounded-full bg-aglow flex items-center justify-center mx-auto mb-4">
      <i className="fas fa-check text-2xl text-accent" />
    </div>
    <div className="font-display text-xl font-bold mb-2">You&apos;re on the list!</div>
    <div className="text-sm text-text2">We&apos;ll notify you when RideShare launches at your university.</div>
  </div>
)}
              <div className="text-center text-sm text-text3 mt-5">
  <strong className="text-accent font-bold">{mounted && heroCount !== null ? heroCount.toLocaleString() : "..."}</strong> students from <strong className="text-accent font-bold">6</strong> universities are already waiting
</div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto" id="faq">
          <div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">Questions</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">Frequently asked</h2>
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
{faqs.map((faq, i) => (
<div key={i} className={`bg-card border rounded-xl overflow-hidden transition-colors ${openFaq === i ? "border-border2" : "border-border"}`}>
<button type="button" className="w-full flex items-center justify-between p-5 select-none cursor-pointer text-left" onClick={() => setOpenFaq(openFaq === i ? null : i)} >
<h3 className="text-base font-semibold">{faq.q}</h3>
<i className={`fas fa-chevron-down text-text3 text-xs ml-3 transition-transform duration-300 flex-shrink-0 ${openFaq === i ? "rotate-180" : ""}`} />
</button>
<div className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-96" : "max-h-0"}`}>
<p className="px-5 pb-5 text-sm text-text2 leading-relaxed">{faq.a}</p>
</div>
</div>
))}
          </div>
        </section>

        {/* Legal */}
        <div className="text-center text-sm text-text3 py-10 px-4 md:px-8">
          <p>RideShare is a matching platform, not a transport provider. We do not operate vehicles, employ drivers, or handle payments. Users are responsible for their own safety and conduct. By using this service, you acknowledge these terms.</p>
          <p className="mt-3">
<a href="/legal" className="text-text2 underline underline-offset-2 hover:text-accent">Privacy Policy</a> &nbsp;·&nbsp;
<a href="/legal?tab=terms" className="text-text2 underline underline-offset-2 hover:text-accent">Terms of Service</a> &nbsp;·&nbsp;
<a href="mailto:rideshare2026.io@gmail.com" className="text-text2 underline underline-offset-2 hover:text-accent">rideshare2026.io@gmail.com</a>
          </p>
</div>

{/* Report an Issue Section */}
<section id="report" className="py-12 md:py-16 px-4 md:px-8 max-w-6xl mx-auto border-t border-border">
<div className="text-center">
<div className="text-[11px] uppercase tracking-[2.5px] text-text3 font-bold mb-2">Support</div>
<h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">Report an Issue</h2>
    <p className="text-text2 text-base max-w-lg mx-auto mb-6">
      Found a bug, have a suggestion, or experienced a problem? Let us know and we&apos;ll look into it.
    </p>
    <a
      href="mailto:rideshare2026.io@gmail.com?subject=Issue%20Report%20-%20RideShare"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-bg2 text-text2 font-medium hover:border-accent hover:text-accent transition-colors"
    >
      <i className="fas fa-envelope" />
      rideshare2026.io@gmail.com
    </a>
  </div>
</section>

{/* Footer */}
        <footer className="border-t border-border py-12 px-4 md:px-8 mt-16">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="text-center md:text-left">
              <div className="font-display text-lg font-bold mb-2">Ride<span className="text-accent">Share</span></div>
              <p className="text-sm text-text3 max-w-xs leading-relaxed mb-4">Campus ride-sharing for Ugandan university students. Split the ride, not the wallet.</p>
              <div className="flex gap-2.5 justify-center md:justify-start">
                <a href="https://x.com/ride___share" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text3 hover:border-accent hover:text-accent hover:bg-aglow transition-colors"><i className="fab fa-x-twitter" /></a>
                <a href="https://www.instagram.com/ride__share/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text3 hover:border-accent hover:text-accent hover:bg-aglow transition-colors"><i className="fab fa-instagram" /></a>
                <a href="https://www.tiktok.com/@ride__share?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text3 hover:border-accent hover:text-accent hover:bg-aglow transition-colors"><i className="fab fa-tiktok" /></a>
              </div>
            </div>
            <div className="flex gap-10 md:gap-16 text-center md:text-left">
              <div>
                <h4 className="text-[11px] uppercase tracking-[1.5px] text-text3 font-bold mb-3">Product</h4>
                <a href="#features" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Features</a>
                <a href="#how" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">How It Works</a>
                <a href="#faq" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">FAQ</a>
                <a href="#waitlist" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Get Notified</a>
              </div>
<div>
<h4 className="text-[11px] uppercase tracking-[1.5px] text-text3 font-bold mb-3">Legal</h4>
<Link href="/legal" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Privacy Policy</Link>
<Link href="/legal?tab=terms" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Terms of Service</Link>
<Link href="/legal?tab=disclaimer" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Liability Disclaimer</Link>
</div>
<div>
<h4 className="text-[11px] uppercase tracking-[1.5px] text-text3 font-bold mb-3">Contact</h4>
<a href="mailto:rideshare2026.io@gmail.com" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">rideshare2026.io@gmail.com</a>
<a href="#report" className="block text-sm text-text2 py-1 hover:text-accent transition-colors">Report an Issue</a>
</div>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-text4 text-center md:text-left">
            <span>© 2025 RideShare. All rights reserved.</span>
            <span>Made with <i className="fas fa-heart text-red text-[11px] mx-0.5" /> for Ugandan students</span>
          </div>
        </footer>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent text-black px-7 py-3.5 rounded-xl text-sm font-semibold z-[200] shadow-[0_8px_30px_rgba(0,230,118,0.3)]">
          {toast}
        </div>
      )}
    </div>
  );
}
