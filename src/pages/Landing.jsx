import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall, CalendarCheck, MessageSquare, ShieldCheck, Clock, Users,
  CheckCircle2, ChevronDown, AlertTriangle, Loader2, Stethoscope, Send, Sparkles,
} from 'lucide-react';
import { API_URL } from '../api';

/* ==========================================================================
 * Public marketing landing page (Phase D).
 * No auth required. The demo form posts to the public POST /api/leads endpoint
 * (server-side validation + rate limiting + honeypot). Pricing is clearly
 * marked as PROPOSED.
 * ========================================================================== */

const FEATURES = [
  { icon: PhoneCall, title: '24/7 Hindi receptionist', body: 'Answers every call in natural Hindi/Hinglish, day or night — no call goes to voicemail.' },
  { icon: CalendarCheck, title: 'Books appointments', body: 'Collects name, date, time and reason, checks the doctor\u2019s schedule, then confirms before saving.' },
  { icon: MessageSquare, title: 'Instant clinic alerts', body: 'Every booking is pushed to your WhatsApp so the front desk always knows who is coming.' },
  { icon: ShieldCheck, title: 'Emergency safety net', body: 'Detects emergencies mid-call and immediately advises calling 108 and the nearest hospital.' },
  { icon: Clock, title: 'No missed slots', body: 'Prevents double-bookings and respects each doctor\u2019s working hours and holidays.' },
  { icon: Users, title: 'Built for small clinics', body: 'Dentists, physios, GPs and diagnostic centres — set up in minutes, no hardware needed.' },
];

const STEPS = [
  { n: 1, title: 'A patient calls your number', body: 'MediBot picks up instantly and greets them in Hindi.' },
  { n: 2, title: 'It collects the details', body: 'Name, preferred date, time and the reason for the visit — through a natural conversation.' },
  { n: 3, title: 'It confirms and books', body: 'The bot reads the appointment back, checks the doctor is free, and only then saves it.' },
  { n: 4, title: 'You get notified', body: 'The booking lands on your dashboard and a WhatsApp alert reaches the clinic.' },
];

const FAQS = [
  { q: 'Do patients need to speak in English?', a: 'No. MediBot understands Hindi and Hinglish (Hindi written in English letters), which is how most patients actually speak on the phone.' },
  { q: 'What if the AI cannot understand the caller?', a: 'After a few tries it politely asks the patient to call back later, and saves whatever it captured so your front desk can follow up. It never guesses or books something wrong.' },
  { q: 'Can it handle emergencies?', a: 'Yes. If it detects an emergency it stops the booking, tells the caller to dial 108 or go to the nearest hospital, and flags the call as urgent for you.' },
  { q: 'Do I need to change my phone number?', a: 'You can keep your existing number by forwarding it to MediBot, or use a new number we provide. Either way, no special hardware is required.' },
  { q: 'Is my patient data safe?', a: 'Data is stored securely and access is password-protected. We only collect what is needed to book the appointment and never sell patient information.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const cleanDigits = (s) => String(s || '').replace(/[^\d]/g, '');

function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`px-5 sm:px-8 py-16 sm:py-20 ${className}`}>{children}</section>
  );
}

function Faq({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-medium text-slate-800 dark:text-slate-100">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="pb-4 text-slate-600 dark:text-slate-300 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Landing() {
  const [form, setForm] = useState({ name: '', clinic: '', phone: '', email: '', message: '', consent: false });
  const [honeypot, setHoneypot] = useState('');   // bots fill this; humans never see it
  const [state, setState] = useState('idle');     // idle | sending | success | error
  const [error, setError] = useState('');

  const set = (k) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
  };

  // Client-side check is a convenience only; the server re-validates everything.
  const clientValid =
    form.name.trim().length >= 2 &&
    EMAIL_RE.test(form.email.trim()) &&
    cleanDigits(form.phone).length >= 7 &&
    form.consent;

  async function onSubmit(e) {
    e.preventDefault();
    if (state === 'sending') return;
    if (!clientValid) {
      setState('error');
      setError('Please fill in your name, a valid email and phone, and tick the consent box.');
      return;
    }
    setState('sending');
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          clinic: form.clinic.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          consent: form.consent,
          company_website: honeypot,   // honeypot
          source: 'landing',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setState('success');
      setForm({ name: '', clinic: '', phone: '', email: '', message: '', consent: false });
    } catch (err) {
      setState('error');
      // Network failures surface as "Failed to fetch" - translate for real people.
      setError(
        err.message === 'Failed to fetch'
          ? 'We could not reach the booking system just now. Please try again in a minute.'
          : (err.message || 'Could not send your request. Please try again.')
      );
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      {/* ------------------------------------------------------------ nav */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-2 rounded-xl"><Stethoscope size={20} className="text-white" /></div>
            <span className="text-lg font-bold tracking-wide">MediBot</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <a href="#how" className="hover:text-blue-600 dark:hover:text-blue-400">How it works</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400">Features</a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Sign in</Link>
            <a href="#demo" className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Request a demo</a>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- hero */}
      <Section id="hero" className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full mb-5">
              <Sparkles size={14} /> Made for small clinics in India
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Your clinic&rsquo;s Hindi AI receptionist — that never misses a call.
            </h1>
            <p className="mt-5 text-lg text-slate-300 leading-relaxed">
              MediBot answers patient calls in Hindi &amp; Hinglish, books appointments,
              checks the doctor&rsquo;s availability, and alerts your front desk on WhatsApp —
              24 hours a day, in a natural conversation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#demo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                <Send size={18} /> Request a free demo
              </a>
              <a href="#how" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">No credit card. No hardware. Works with your existing phone number.</p>
          </div>
          <div className="hidden md:block">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4"><span className="w-2 h-2 rounded-full bg-green-400"></span> Live call transcript</div>
              <div className="space-y-3 text-sm">
                <p className="text-slate-300"><span className="text-blue-300 font-medium">Bot:</span> नमस्ते! अपॉइंटमेंट बुक करने के लिए अपना नाम बताइए।</p>
                <p className="text-slate-200 text-right"><span className="text-green-300 font-medium">Patient:</span> mera naam Priya Sharma hai</p>
                <p className="text-slate-300"><span className="text-blue-300 font-medium">Bot:</span> किस दिन आना है?</p>
                <p className="text-slate-200 text-right"><span className="text-green-300 font-medium">Patient:</span> kal subah 10 baje</p>
                <p className="text-slate-300"><span className="text-blue-300 font-medium">Bot:</span> Priya जी, 23 जून सुबह 10 बजे — सही है?</p>
                <p className="text-slate-200 text-right"><span className="text-green-300 font-medium">Patient:</span> haan bilkul</p>
                <p className="text-green-300"><span className="font-medium">✓ Booked</span> &amp; sent to the clinic.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------- how it works */}
      <Section id="how" className="bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center">How it works</h2>
          <p className="mt-3 text-center text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            From the first ring to a confirmed appointment on your dashboard.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{s.n}</div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------- features */}
      <Section id="features" className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center">Everything a busy clinic needs</h2>
          <p className="mt-3 text-center text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Purpose-built for dentists, physiotherapists, GPs and diagnostic centres across India.
          </p>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6">
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* -------------------------------------------------------- pricing */}
      <Section id="pricing" className="bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Simple, honest pricing</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">One plan that covers a small clinic. Cancel anytime.</p>
          <div className="mt-10 rounded-2xl border-2 border-blue-600 p-8 text-left shadow-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold">₹1,500</span>
              <span className="text-slate-500 dark:text-slate-400">/ month</span>
            </div>
            <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Proposed pricing — final price confirmed at launch
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                'Unlimited incoming calls answered in Hindi/Hinglish',
                'Automatic appointment booking with confirmation read-back',
                'Doctor working-hours &amp; holiday awareness',
                'WhatsApp alerts to the clinic for every booking',
                'Dashboard: call log, patients, doctors &amp; analytics',
                'Emergency detection with 108 guidance',
              ].map((li) => (
                <li key={li} className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-200">{li}</span>
                </li>
              ))}
            </ul>
            <a href="#demo" className="mt-8 inline-flex w-full items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
              <Send size={18} /> Request a demo
            </a>
          </div>
        </div>
      </Section>

      {/* ----------------------------------------------------- demo form */}
      <Section id="demo" className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold">See MediBot on your own calls</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
              Book a free, no-obligation demo. We&rsquo;ll call a number of your choice and show
              you exactly how MediBot books an appointment — end to end.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              {['A 15-minute live demo call', 'Setup help for your clinic', 'No commitment, cancel anytime'].map((t) => (
                <li key={t} className="flex items-center gap-2.5"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> {t}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-lg">
            {state === 'success' ? (
              <div className="text-center py-8" role="status">
                <div className="mx-auto w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 flex items-center justify-center">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-white">Thank you!</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Your demo request has been received. Our team will contact you shortly.</p>
                <button type="button" onClick={() => setState('idle')} className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Request a demo</h3>

                {state === 'error' && error && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" /> <span>{error}</span>
                  </div>
                )}

                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="lf-name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Your name *</label>
                    <input id="lf-name" value={form.name} onChange={set('name')} autoComplete="name"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Dr. Asha Verma" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="lf-clinic" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Clinic name</label>
                    <input id="lf-clinic" value={form.clinic} onChange={set('clinic')} autoComplete="organization"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="Verma Dental Clinic" />
                  </div>
                  <div>
                    <label htmlFor="lf-phone" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Phone *</label>
                    <input id="lf-phone" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label htmlFor="lf-email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Email *</label>
                    <input id="lf-email" type="email" value={form.email} onChange={set('email')} autoComplete="email"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="you@clinic.in" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="lf-message" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Anything we should know?</label>
                    <textarea id="lf-message" value={form.message} onChange={set('message')} rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" placeholder="How many calls does your clinic get in a day?" />
                  </div>
                </div>

                {/* honeypot: off-screen, hidden from humans, bots autofill it */}
                <div aria-hidden="true" className="absolute -left-[9999px] top-auto w-px h-px overflow-hidden">
                  <label htmlFor="lf-hp">Website</label>
                  <input id="lf-hp" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                </div>

                <label className="mt-5 flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>I agree to be contacted about the MediBot demo and accept the <a href="#privacy" className="text-blue-600 dark:text-blue-400 underline">privacy notice</a>. *</span>
                </label>

                <button type="submit" disabled={state === 'sending'}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  {state === 'sending' ? (<><Loader2 size={18} className="animate-spin" /> Sending...</>) : (<><Send size={18} /> Request demo</>)}
                </button>
                <p className="mt-3 text-xs text-slate-400 text-center">We never share your details. * required.</p>
              </form>
            )}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------ faq */}
      <Section id="faq" className="bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center">Frequently asked questions</h2>
          <div className="mt-8 divide-y divide-slate-200 dark:divide-slate-700">
            {FAQS.map((f) => <Faq key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------- privacy/contact */}
      <Section id="privacy" className="bg-slate-50 dark:bg-slate-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold">Privacy &amp; contact</h2>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            When you request a demo we collect only your name, clinic, phone, email and optional
            message, and we use them solely to contact you about MediBot. We do not sell your data.
            Patient appointment data captured during calls is stored securely and access is
            password-protected. You can ask us to delete your details at any time by replying to our
            contact email.
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Email</div>
              <a href="mailto:hello@medibot.in" className="text-blue-600 dark:text-blue-400">hello@medibot.in</a>
            </div>
            <div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">Phone</div>
              <span className="text-slate-600 dark:text-slate-300">+91 97608 49372</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- footer */}
      <footer className="px-5 sm:px-8 py-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg"><Stethoscope size={16} className="text-white" /></div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">MediBot</span>
          </div>
          <p>© {new Date().getFullYear()} MediBot. Made for small clinics in India.</p>
          <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400">Clinic sign in</Link>
        </div>
      </footer>
    </div>
  );
}


