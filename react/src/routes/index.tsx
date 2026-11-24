import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  Star,
  Users,
  Sparkles,
  ShieldCheck,
  LineChart,
  Headset,
  Bot,
  CalendarCheck,
  Handshake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LeadForm } from "@/components/cpa/LeadForm";
import heroImg from "@/assets/hero.jpg";
import techImg from "@/assets/tech.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CPA Partner Program | Complete Controller Bookkeeping for CPAs" },
      {
        name: "description",
        content:
          "Complete Controller partners with CPA firms to handle day-to-day bookkeeping, reduce cleanup, and keep client financials organized.",
      },
      { property: "og:title", content: "Bookkeeping Built for CPAs | Complete Controller" },
      {
        property: "og:description",
        content:
          "More capacity. Cleaner books. Less on your plate. Partner with a dedicated U.S.-based bookkeeping team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function scrollToForm() {
  document.getElementById("talk")?.scrollIntoView({ behavior: "smooth" });
}

const benefits = [
  {
    icon: Users,
    title: "Expand Capacity Without Expanding Headcount",
    body: "Support more clients without adding another full-time bookkeeper to your payroll. We provide ongoing bookkeeping support that helps your firm manage growing demand.",
  },
  {
    icon: ShieldCheck,
    title: "Spend Less Time Cleaning Up Books",
    body: "Reduce the scramble of missing transactions, unreconciled accounts, and inconsistent records. Organized bookkeeping helps your team work with more dependable financial information.",
  },
  {
    icon: CalendarCheck,
    title: "Make Tax Season Less Reactive",
    body: "When bookkeeping stays current throughout the year, your team can spend less time reconstructing financial activity and more time preparing returns and developing tax strategies.",
  },
  {
    icon: Handshake,
    title: "Keep Your Client Relationships Strong",
    body: "You're the trusted advisor. We're the bookkeeping partner. We work directly with your clients while keeping your firm informed and involved in the financial picture.",
  },
  {
    icon: Sparkles,
    title: "Take High-Maintenance Bookkeeping Off Your Plate",
    body: "Every firm has clients who need extra attention. We help organize their financial processes, address bookkeeping backlogs, and establish more consistent day-to-day support.",
  },
];

const steps = [
  [
    "You Introduce Us",
    "When a client needs bookkeeping support, you introduce Complete Controller as a trusted resource.",
  ],
  [
    "We Learn What the Client Needs",
    "We evaluate the client's bookkeeping situation, identify outstanding issues, and discuss the support needed moving forward.",
  ],
  [
    "We Handle the Day-to-Day Work",
    "Our team manages the agreed-upon bookkeeping responsibilities, including transaction management, reconciliations, and ongoing financial reporting.",
  ],
  [
    "You Stay the Trusted Advisor",
    "Your firm continues providing tax, advisory, and strategic guidance while staying connected to the client's financial information.",
  ],
  [
    "We Keep Working Together",
    "As your clients' needs evolve, we collaborate to support more organized financial operations and smoother communication.",
  ],
];

const handles = [
  ["Transaction management", "Organizing and recording day-to-day financial activity."],
  [
    "Bank and account reconciliations",
    "Helping identify discrepancies and maintain consistent records.",
  ],
  [
    "Monthly financial reporting",
    "Providing organized financial information for business decisions and CPA review.",
  ],
  [
    "Bookkeeping cleanup and catch-up",
    "Addressing backlogs, inconsistencies, and outstanding bookkeeping issues.",
  ],
  [
    "Ongoing bookkeeping management",
    "Supporting regular financial workflows and record maintenance.",
  ],
  [
    "Collaborative financial access",
    "Helping CPAs stay connected to the financial information they need.",
  ],
];

const testimonials = [
  {
    name: "Bob King, CPA",
    firm: "Hall & Company",
    quote:
      "To start I gave Complete Controller one of my most challenging clients. That client used to call me all the time with one fire-drill after another. My best testimony to Complete Controller's expertise and ability to win over the toughest cases is just this: That client doesn't call me all the time anymore! They are a great resource for my firm.",
  },
  {
    name: "Jason Bennett, CPA",
    firm: "Baroldi & Associates",
    quote:
      "Complete Controller's work is clean and requires only very minimal adjustments. This makes our job easier. I can see why our client changed bookkeeping services.",
  },
  {
    name: "Rob Henderson, CPA, MST",
    firm: "Windes",
    quote:
      "It sounds like we have referred several clients to Complete Controller and they are all happy. Everyone here knows who you are and what you do so we are referring all of our bookkeeping to Complete Controller. Thank you for your help and being a trusted resource to our clients.",
  },
];

const tech = [
  {
    icon: LineChart,
    title: "Financial Visibility",
    body: "Access organized financial records and reporting through our cloud-based platform, helping your team review client financial activity without unnecessary back-and-forth.",
  },
  {
    icon: Headset,
    title: "Real Human Support",
    body: "Our U.S.-based bookkeeping professionals work directly with clients and collaborate with CPA partners when questions or financial issues arise.",
  },
  {
    icon: Bot,
    title: "Meet CAS-i, Your AI Concierge",
    body: "CAS-i brings an additional layer of technology-enabled support to the Complete Controller experience, helping users access assistance and financial information.",
  },
];

const startSteps = [
  [
    "Tell Us What's Happening",
    "We'll learn about your firm, your clients, and the bookkeeping challenges creating extra work.",
  ],
  [
    "Review a Sample Set of Books",
    "We'll review a sample set of client books at no cost to help identify bookkeeping needs and potential next steps.",
  ],
  [
    "Explore the Right Support",
    "We'll discuss how Complete Controller can help and which responsibilities make sense to transition.",
  ],
  ["Move Forward When You're Ready", "You decide which clients to introduce and when to begin."],
];

const faqs = [
  [
    "How does Complete Controller work with CPA firms?",
    "Complete Controller provides outsourced bookkeeping and accounting support for clients referred by CPA firms. We manage the agreed-upon day-to-day bookkeeping responsibilities while the CPA firm continues handling tax, advisory, and strategic services.",
  ],
  [
    "Will we lose control of our client relationships?",
    "No. Your firm remains the client's trusted tax and advisory resource. Complete Controller works alongside your practice as a bookkeeping partner, with clear responsibilities and ongoing collaboration.",
  ],
  [
    "Does Complete Controller offer white-label bookkeeping?",
    "No. Complete Controller does not white-label its services. Clients are introduced to us as a trusted bookkeeping partner, creating transparency about who handles their financial records.",
  ],
  [
    "Can you help with clients whose books are behind?",
    "Yes. We work with clients who need bookkeeping cleanup, catch-up services, and ongoing financial management. We review their current records to determine the work needed to establish a more consistent bookkeeping process.",
  ],
  [
    "Can we refer just one client?",
    "Absolutely. You can start with one client and evaluate the partnership before introducing others.",
  ],
  [
    "How does outsourcing bookkeeping help a CPA firm grow?",
    "A reliable bookkeeping partner can help CPA firms support additional clients without building out the same level of internal bookkeeping capacity. It can also free up time for tax planning, advisory work, and client relationship management.",
  ],
  [
    "Will our firm still have access to client financial information?",
    "Complete Controller's cloud-based platform supports collaborative access to financial information, allowing CPA partners to review client records and work with the bookkeeping team.",
  ],
  [
    "Is there a setup fee for referred clients?",
    "Complete Controller currently describes a waived setup fee for direct CPA referrals. Specific pricing and engagement terms should be confirmed during the partnership conversation.",
  ],
  [
    "What types of CPA firms benefit from this partnership?",
    "CPA firms that want to reduce bookkeeping workload, support clients with ongoing accounting needs, minimize cleanup work, or dedicate more internal resources to tax and advisory services may benefit from working with Complete Controller.",
  ],
  [
    "How do we get started?",
    "Schedule a conversation with our team. We'll learn about your firm's needs, discuss potential client referrals, and explore how the partnership could work.",
  ],
];

function Index() {
  const [wantsGuide, setWantsGuide] = useState(false);
  const talk = () => {
    setWantsGuide(false);
    scrollToForm();
  };
  const guide = () => {
    setWantsGuide(true);
    scrollToForm();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="container-cc flex h-20 items-center">
          <a href="/" className="font-display text-lg text-inverse">
            Complete <span className="italic text-primary">Controller</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[clamp(640px,88vh,920px)] items-center overflow-hidden">
        <img
          src={heroImg}
          alt="CPA and bookkeeper collaborating over client financials"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="container-cc relative z-10 py-32 text-inverse">
          <p className="eyebrow font-normal text-primary">CPA Partner Program</p>
          <h1 className="mt-5 max-w-[14ch]">Bookkeeping Built for CPAs</h1>
          <p className="mt-6 max-w-2xl font-display text-2xl italic text-inverse-muted md:text-[2rem] md:leading-tight">
            More capacity. Cleaner books. Less on your plate.
          </p>
          <p className="mt-6 max-w-xl text-lg text-inverse-muted">
            Your clients need reliable bookkeeping. Your team needs room to focus on higher-value
            work.
          </p>
          <p className="mt-4 max-w-xl text-inverse-muted">
            Complete Controller partners with CPA firms to handle day-to-day bookkeeping, reduce
            cleanup headaches, and keep client financials organized without adding to your team's
            workload.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button variant="cta" size="xl" onClick={talk}>
              Let's Talk About Your Firm
            </Button>
            <Button variant="ghostInverse" size="xl" asChild>
              <a href="#how">Explore the CPA Partner Program</a>
            </Button>
          </div>
          <p className="mt-10 max-w-xl border-l-2 border-primary pl-4 text-sm text-inverse-muted">
            <strong className="text-inverse">
              Real people. Real conversations. Real collaboration.
            </strong>{" "}
            A dedicated U.S.-based team that works alongside your firm, supports your clients, and
            keeps you in the loop.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <div className="border-b bg-secondary">
        <div className="container-cc flex flex-col items-center justify-center gap-3 py-5 text-sm font-medium text-brand sm:flex-row sm:gap-10">
          <span>Supporting CPA Firms Nationwide</span>
          <span className="hidden text-primary sm:inline">•</span>
          <span>Dedicated Bookkeeping Teams</span>
          <span className="hidden text-primary sm:inline">•</span>
          <span>Collaborative Financial Technology</span>
        </div>
      </div>

      {/* Problem */}
      <section className="section-pad bg-brand text-inverse">
        <div className="container-cc grid gap-12 lg:grid-cols-2">
          <h2 className="">
            Your Team Wasn't Hired to{" "}
            <span className="italic text-primary">Chase Missing Receipts.</span>
          </h2>
          <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-inverse-muted">
            <p>
              Yet somehow, bookkeeping cleanup, unreconciled accounts, and last-minute client
              requests keep landing on your desk.
            </p>
            <p className="font-display text-2xl italic text-inverse">Sound familiar?</p>
            <p>
              You want to spend more time advising clients, developing tax strategies, and growing
              your practice. Instead, your team is untangling financial records and managing
              bookkeeping issues that should have been resolved months ago.
            </p>
            <p className="text-inverse">
              That's where Complete Controller comes in. We take care of the ongoing bookkeeping
              work so your firm can spend less time reacting and more time doing what it does best.
            </p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section-pad bg-secondary">
        <div className="container-cc">
          <p className="eyebrow text-brand-soft">Why CPA firms partner with us</p>
          <h2 className="mt-4 max-w-3xl">
            More Capacity. Cleaner Books. Stronger Client Relationships.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A great bookkeeping partnership should make your job easier, not create another
            relationship to manage. Here's what changes when Complete Controller joins your extended
            team.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`${i < 2 ? "md:col-span-3" : "md:col-span-2"} rounded-2xl border bg-card p-8 shadow-card`}
              >
                <b.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-6">{b.title}</h3>
                <p className="mt-3 text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
          <Button variant="outlineBrand" size="xl" className="mt-10" onClick={talk}>
            Talk About Your Bookkeeping Challenges
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section-pad">
        <div className="container-cc">
          <p className="eyebrow text-brand-soft">How the partnership works</p>
          <h2 className="mt-4 max-w-3xl">
            Your Clients. Your Relationships.{" "}
            <span className="italic text-primary">Our Bookkeeping Expertise.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We believe great CPA partnerships are built on collaboration, transparency, and clearly
            defined responsibilities. Here's how we work together.
          </p>
          <ol className="mt-14 divide-y border-y">
            {steps.map(([t, d], i) => (
              <li
                key={t}
                className="grid gap-4 py-8 md:grid-cols-[120px_1fr_1.4fr] md:items-baseline"
              >
                <span className="font-display text-6xl text-brand-soft">{i + 1}</span>
                <h3>{t}</h3>
                <p className="text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-start gap-6 rounded-2xl bg-brand-tint p-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl font-display text-xl">
              <span className="italic">The result?</span> Less bookkeeping friction for your firm
              and a more consistent financial foundation for your clients.
            </p>
            <Button variant="brand" size="xl" onClick={talk}>
              Explore a CPA Partnership
            </Button>
          </div>
        </div>
      </section>

      {/* What we handle */}
      <section className="section-pad bg-secondary">
        <div className="container-cc">
          <p className="eyebrow text-brand-soft">What we handle</p>
          <h2 className="mt-4 max-w-3xl">The Bookkeeping Work Your Team Shouldn't Have to Chase</h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            From catching up overdue accounts to maintaining ongoing financial records, Complete
            Controller helps keep your clients' books moving in the right direction.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {handles.map(([t, d]) => (
              <div key={t} className="flex gap-4 rounded-xl border bg-card p-6">
                <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-inverse">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-sans text-base font-semibold">{t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Services and responsibilities are established according to each client's needs.
          </p>
          <p className="mt-8 font-display text-2xl italic text-brand">
            You focus on tax and advisory. We'll help keep the books ready for the conversation.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad">
        <div className="container-cc">
          <p className="eyebrow text-brand-soft">CPA testimonials</p>
          <h2 className="mt-4 max-w-3xl">
            Don't Just Take Our Word for It.{" "}
            <span className="italic text-primary">Ask the CPAs.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            CPA firms trust Complete Controller to support their clients, maintain organized
            financial records, and make day-to-day collaboration easier.
          </p>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-2xl border bg-secondary p-8">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-foreground">"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-inverse">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="text-sm text-muted-foreground">{t.firm}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <Button variant="outlineBrand" size="xl" className="mt-10" onClick={talk}>
            See What Other CPAs Are Saying
          </Button>
        </div>
      </section>

      {/* Technology */}
      <section className="section-pad bg-brand-dark text-inverse">
        <div className="container-cc grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-primary">Technology + human expertise</p>
            <h2 className="mt-4">
              Smart Technology. Experienced People.{" "}
              <span className="italic text-primary">Better Collaboration.</span>
            </h2>
            <p className="mt-5 text-lg text-inverse-muted">
              Technology should make your work easier, not add another layer of complexity. Complete
              Controller combines cloud-based accounting technology with experienced bookkeeping
              professionals to help CPA firms and their clients stay connected to financial
              information.
            </p>
            <div className="mt-10 space-y-7">
              {tech.map((t) => (
                <div key={t.title} className="flex gap-4">
                  <t.icon className="mt-1 h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-sans text-lg font-semibold">{t.title}</h3>
                    <p className="mt-1 text-inverse-muted">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 font-display text-xl italic">
              Because even the smartest technology works better when experienced people are behind
              it.
            </p>
          </div>
          <img
            src={techImg}
            alt="Bookkeeping professional reviewing a client financial dashboard"
            width={1200}
            height={1200}
            loading="lazy"
            className="w-full rounded-2xl object-cover shadow-floating"
          />
        </div>
      </section>

      {/* Getting started */}
      <section className="section-pad">
        <div className="container-cc">
          <p className="eyebrow text-brand-soft">Getting started</p>
          <h2 className="mt-4">
            Let's Start With <span className="italic text-primary">One Client.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            You don't have to overhaul your practice or transition your entire client base to
            explore a partnership. Start with a conversation about one client who could benefit from
            better bookkeeping support.
          </p>
          <h3 className="mt-12 font-sans text-sm font-bold uppercase tracking-widest text-brand">
            Here's What Happens Next
          </h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {startSteps.map(([t, d], i) => (
              <div key={t} className="rounded-2xl border bg-card p-7 shadow-card">
                <span className="eyebrow text-primary">Step {i + 1}</span>
                <h4 className="mt-3 font-display text-xl">{t}</h4>
                <p className="mt-3 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-muted-foreground">
            No pressure to transition your entire client base. Just a practical conversation about
            making your firm's work easier.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button variant="cta" size="xl" onClick={talk}>
              Let's Talk About Your Firm
            </Button>
            <Button variant="outlineBrand" size="xl" onClick={guide}>
              Request the CPA Partnership Guide
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-secondary">
        <div className="container-cc grid gap-12 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow text-brand-soft">FAQ</p>
            <h2 className="mt-4">Questions CPA Firms Ask Before Partnering With Us</h2>
            <Button variant="brand" size="xl" className="mt-8" onClick={talk}>
              Talk With a Partnership Expert
            </Button>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border bg-card px-6">
            {faqs.map(([q, a], i) => (
              <AccordionItem key={q} value={`q${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final conversion */}
      <section className="section-pad bg-brand text-inverse">
        <div className="container-cc max-w-4xl text-center">
          <h2 className="">
            Your Next Growth Opportunity Shouldn't Come With{" "}
            <span className="italic text-primary">More Bookkeeping Headaches.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-inverse-muted">
            You built your firm to help clients make smarter financial decisions, not spend every
            week tracking down transactions and cleaning up accounts. Let's give your team more room
            to do what it does best.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-inverse-muted">
            Complete Controller handles the bookkeeping. You keep the trusted advisor relationship.
            Together, we help your clients move forward with greater financial clarity.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="cta" size="xl" onClick={talk}>
              Let's Talk About Your Firm
            </Button>
            <Button variant="ghostInverse" size="xl" onClick={guide}>
              Get the CPA Partnership Guide
            </Button>
          </div>
          <p className="mt-10 font-display italic text-inverse">
            Real people. Real conversations. Real collaboration.
          </p>
        </div>
      </section>

      {/* Form */}
      <section id="talk" className="section-pad scroll-mt-4">
        <div className="container-cc grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <p className="eyebrow text-brand-soft">Start the conversation</p>
            <h2 className="mt-4">Talk With a Partnership Expert</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Tell us about your firm and the clients who could use better bookkeeping support.
              We'll take it from there.
            </p>
          </div>
          <LeadForm wantsGuide={wantsGuide} onWantsGuide={setWantsGuide} />
        </div>
      </section>

      <footer className="bg-brand-dark py-10 text-inverse-muted">
        <div className="container-cc flex flex-col items-center justify-between gap-4 text-sm sm:flex-row">
          <span className="font-display text-inverse">
            Complete <span className="italic text-primary">Controller</span>
          </span>
          <span>© {new Date().getFullYear()} Complete Controller. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
