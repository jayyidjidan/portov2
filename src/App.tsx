import { useEffect, useRef, useState } from 'react'
import { useScrollReveal } from './hooks/useScrollReveal'

const A = '/assets'

type Tool = { name: string; icon: string }

const tools: Record<string, Tool[]> = {
  'Web Dev': [
    ['Laravel', '66241.svg'],
    ['HTML', 'd1048.svg'],
    ['CSS', 'b6a53.svg'],
    ['Tailwind', 'tailwind.svg'],
    ['React', '50aab.svg'],
    ['Express JS', '66021.svg'],
  ].map(([name, icon]) => ({ name, icon })),
  'QA Tools': [
    ['Katalon', 'cfc76.svg'],
    ['Selenium', 'cf2c1.svg'],
    ['Postman', 'ba507.svg'],
    ['JMeter', '9dc2a.svg'],
    ['Jira', 'f1daf.svg'],
    ['Test Rail', '846d1.svg'],
    ['DevTools', 'e75fd.svg'],
  ].map(([name, icon]) => ({ name, icon })),
  'Devops Tools': [
    ['Git', 'eaae0.svg'],
    ['Docker', 'aed17.svg'],
    ['Kubernetes', '71e3c.svg'],
    ['Grafana', '62596.svg'],
    ['Prometheus', 'a04fd.svg'],
    ['Linux CMD', 'd6fbe.svg'],
    ['Loki', '8fcd5.svg'],
    ['OpenTelemetry', '5d3c5.svg'],
  ].map(([name, icon]) => ({ name, icon })),
  Database: [
    ['MySQL', '6fd7e.svg'],
    ['PostgreSQL', 'eb539.svg'],
    ['MongoDB', 'b7225.svg'],
  ].map(([name, icon]) => ({ name, icon })),
}

// ── Projects ──────────────────────────────────────────────────────────────────
// To change a project image:
//   1. Put the file in  public/assets/projects/  (create the folder if needed)
//   2. Point `image` to it, e.g. `${A}/projects/stockify-dashboard.png`
// `href` is where the "See Project" button goes (GitHub repo, live demo, report...).
type Project = {
  title: string
  description: string
  image: string
  href: string
}

const projects: Project[] = [
  {
    title: 'Stockify Devops',
    description: 'End to end devops project including Unit Testing and performance testing',
    image: `${A}/projects/Sotckify.png`,
    href: 'https://github.com/jayyidjidan/Stockify',
  },
  {
    title: 'Taskio Testing',
    description: 'End to End Testing Project from test plan to test reporting',
    image: `${A}/5ce5f.png`, // TODO: replace with your own screenshot
    href: 'https://github.com/jayyidjidan/TaskioKatalon', // TODO: replace with the real project link
  },
  {
    title: 'Autobridge IOT',
    description: 'API Testing and performance testing for IOT project',
    image: `${A}/5ce5f.png`, // TODO: replace with your own screenshot
    href: '#', // TODO: replace with the real project link
  },
]

// ── Certificates ──────────────────────────────────────────────────────────────
// `image`         = the certificate picture that appears on hover (public/assets/certificates/...)
// `credentialUrl` = where the "See Credential" button goes (Credly, BNSP, Coding Studio page, PDF...)
type Certificate = {
  title: string
  issuer: string
  image: string
  credentialUrl: string
}

const certificates: Certificate[] = [
  {
    title: 'Katalon Practitioner Level',
    issuer: 'Katalon Academy',
    image: `${A}/Certificate/Katalon.png`,
    credentialUrl: 'https://academy.katalon.com/mcertificate/6ab11ee2d4b48https://academy.katalon.com/mcertificate/6ab11ee2d4b48', // TODO: replace with the credential link
  },
  {
    title: 'Junior Web Developer',
    issuer: 'BNSP',
    image: `${A}/Certificate/BNSP.jpg`,
    credentialUrl: 'https://drive.google.com/file/d/1uaSToknpS0BarOteRVll9pIQe7YSM4Im/view?usp=sharing', 
  },
  {
    title: 'Front End Web Development',
    issuer: 'Coding Studio',
    image: `${A}/Certificate/studio.png`,
    credentialUrl: 'https://member.codingstudio.id/certificate/Ms4LS6qZo5', // TODO: replace with the credential link
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cast a stagger index to a CSS custom property object. */
function stagger(i: number): React.CSSProperties {
  return { '--i': i } as React.CSSProperties
}

// ── Components ────────────────────────────────────────────────────────────────

function PlusMarker({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`plus-marker ${className}`}
      width="15"
      height="15"
      viewBox="0 0 15 15"
      aria-hidden="true"
    >
      <path d="M7.5 0V15M0 7.5H15" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

/** Corners kept only for ToolTile (brief: do not change Skill section visuals). */
function Corners() {
  return (
    <>
      <i className="corner corner-tl" />
      <i className="corner corner-tr" />
      <i className="corner corner-bl" />
      <i className="corner corner-br" />
    </>
  )
}

function IconTile({
  size = 72,
  glyph = 40,
  children,
}: {
  size?: number
  glyph?: number
  children: React.ReactNode
}) {
  return (
    <div
      className="icon-tile bracketed"
      style={{ '--tile': `${size}px`, '--glyph': `${glyph}px` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

/**
 * `external` opens the link in a new tab (use it for GitHub, credentials, live demos).
 * `rel="noopener noreferrer"` is added automatically for security.
 */
function Button({
  children,
  variant = 'secondary',
  href = '#',
  download,
  external = false,
}: {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  href?: string
  download?: boolean
  external?: boolean
}) {
  return (
    <a
      className={`button${variant === 'primary' ? ' button--primary' : ''}`}
      href={href}
      download={download}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

function SectionHeading({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <header className="section-heading">
      <p>{eyebrow}</p>
      <h2>{children}</h2>
    </header>
  )
}

/**
 * ToolTile accepts an optional `style` prop so the toolkit grid can pass
 * `--i` for the stagger animation. Visuals are unchanged.
 */
function ToolTile({ tool, style }: { tool: Tool; style?: React.CSSProperties }) {
  return (
    <div className="tool" style={style}>
      <div className="tool-icon">
        <Corners />
        <img src={`${A}/${tool.icon}`} alt="" />
      </div>
      <span>{tool.name}</span>
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card hover-card bracketed bracketed--hover">
      <div className="project-copy">
        <h3>{project.title}</h3>
        <hr />
        <p>{project.description}</p>
      </div>
      <Button href={project.href} external={project.href.startsWith('http')}>
        See Project
      </Button>
      <div className="project-card__media">
        <img src={project.image} alt={`${project.title} dashboard`} />
      </div>
    </article>
  )
}

function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <article className="cert-row hover-card bracketed bracketed--hover">
      <div className="cert-row__text">
        <h3>{cert.title}</h3>
        <p>{cert.issuer}</p>
      </div>
      <Button href={cert.credentialUrl} external={cert.credentialUrl.startsWith('http')}>
        See Credential
      </Button>
      <div className="cert-row__preview" aria-hidden="true">
        <img src={cert.image} alt="" />
      </div>
    </article>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('Web Dev')

  // Wire up scroll-reveal (IntersectionObserver on [data-reveal])
  useScrollReveal()

  // §7: Navbar scrolled state
  const headerRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const header = headerRef.current
    if (!header) return

    const onScroll = () => {
      header.dataset.scrolled = window.scrollY > 8 ? '' : undefined as unknown as string
      if (window.scrollY <= 8) delete header.dataset.scrolled
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ── Navbar ── */}
      <header
        className="site-header"
        ref={headerRef}
        data-reveal="fade"
        // nav fades in on load; CSS overrides the keyframe to fade-down via --reveal-name
        style={{ '--reveal-name': 'reveal-down' } as React.CSSProperties}
      >
        <nav className="nav" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#projects">Project</a>
          <a href="#skill">Skill</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        {/* ── Glow Zone: Hero + Intro share one glow spanning both sections ── */}
        <div className="glow-zone">
          {/* Glow fades in slowly on load */}
          <div
            className="glow-zone__bg"
            aria-hidden="true"
            data-reveal="fade"
            style={{ '--reveal-dur': '1400ms' } as React.CSSProperties}
          >
            <div className="glow-canvas">
              <div className="glow-group">
                <span className="glow-circle glow-circle--3" />
                <span className="glow-circle glow-circle--2" />
                <span className="glow-circle glow-circle--1" />
              </div>
            </div>
          </div>

          {/* ── Section 1: Hero ── */}
          <section className="hero" id="home">
            <div className="hero-frame bracketed bracketed--bottom">
              {/* PlusMarkers — wrapped in <span> so data-reveal doesn't touch the SVG component */}
              <span className="plus-marker-wrap mk-tl" data-reveal="fade" style={stagger(3)}>
                <PlusMarker />
              </span>
              <span className="plus-marker-wrap mk-tr" data-reveal="fade" style={stagger(3)}>
                <PlusMarker />
              </span>
              <span className="plus-marker-wrap mk-tc" data-reveal="fade" style={stagger(3)}>
                <PlusMarker />
              </span>
              <span className="plus-marker-wrap mk-bc" data-reveal="fade" style={stagger(4)}>
                <PlusMarker />
              </span>

              <div className="hero-copy">
                <h1 data-reveal="up" style={stagger(0)}>
                  Turning software quality into a better user experience
                </h1>
                <p data-reveal="up" style={stagger(1)}>
                  Ensuring every digital product delivers seamless functionality, reliable
                  performance, and meaningful user experiences through quality-driven testing.
                </p>
                <div className="button-row" data-reveal="up" style={stagger(2)}>
                  <Button variant="primary" href="#projects">
                    See Project
                  </Button>
                  <Button href="/cv.pdf" download>
                    Download CV
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Section 2: Intro / About ── */}
          <section className="intro">
            <div className="portrait framed bracketed" data-reveal="scale" style={stagger(0)}>
              <img src={`${A}/09593.png`} alt="Jayyid Jidan" />
            </div>

            <div className="features">
              {(
                [
                  ['glyph-zoom-in.svg', 'Detail-oriented'],
                  ['f6950.svg', 'Clear Documentation'],
                  ['glyph-recycle.svg', 'Continuous Learning'],
                ] as const
              ).map(([icon, title], i) => (
                <div
                  className="feature"
                  key={title}
                  data-reveal="up"
                  style={stagger(i)}
                >
                  <IconTile size={72} glyph={32}>
                    <img src={`${A}/${icon}`} alt="" />
                  </IconTile>
                  <h3>{title}</h3>
                </div>
              ))}
            </div>

            <p className="about" data-reveal="up" style={stagger(0)}>
              Hey, I'm Jayyid Jidan, an IT graduate from Brawijaya University interested in Software
              QA and full-stack development. Strong in communication, teamwork, and problem-solving,
              focusing on software testing and automation.
            </p>
          </section>
        </div>
        {/* end .glow-zone */}

        {/* ── Section 3: Projects ── */}
        <section
          className="projects"
          id="projects"
          style={{ position: 'relative', isolation: 'isolate', overflow: 'clip' }}
        >
          {/* Projects glow — separate from hero glow, clipped inside this section */}
          <div
            className="section__bg"
            aria-hidden="true"
            style={
              {
                '--glow-x': '100%',
                '--glow-y': '85%',
                '--glow-w': '640px',
                '--glow-h': '540px',
                '--glow-alpha': 0.8,
                '--glow-blur': '90px',
              } as React.CSSProperties
            }
          >
            <span className="section__glow" />
          </div>

          {/* Heading reveals as one block */}
          <div data-reveal="up" style={stagger(0)}>
            <SectionHeading eyebrow="Selected Project">
              I analyze requirements, validate functionality, and enhance experience.
            </SectionHeading>
          </div>

          <div className="project-grid">
            {projects.map((project, index) => (
              /*
               * Wrapper div carries data-reveal so the card's own hover-card / bracketed
               * classes (with their ::after / ::before pseudo-elements and transition) are
               * completely untouched by the reveal animation.
               */
              <div
                key={`${project.title}-${index}`}
                className="reveal-wrapper"
                data-reveal="up"
                style={stagger(index)}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 4: Toolkit ── */}
        <section className="toolkit" id="skill">
          <div data-reveal="up" style={stagger(0)}>
            <SectionHeading eyebrow="My Toolkit">
              A set of methods and tools I use to improve software quality.
            </SectionHeading>
          </div>

          <div className="tabs" role="tablist" aria-label="Toolkit categories" data-reveal="up" style={stagger(1)}>
            {Object.keys(tools).map((tab) => (
              <button
                className={activeTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>

          {/*
           * key={activeTab} remounts the grid on tab switch, triggering the CSS
           * animation on every .tool item (via --i stagger, no observer needed).
           */}
          <div className="tool-grid" key={activeTab}>
            {tools[activeTab].map((tool, i) => (
              <ToolTile key={tool.name} tool={tool} style={stagger(i)} />
            ))}
          </div>
        </section>

        {/* ── Section 5: Certifications ── */}
        <section className="certifications">
          <div className="cert-header">
            <p data-reveal="up" style={stagger(0)}>
              Learning &amp; Certifications
            </p>
            <h2 data-reveal="up" style={stagger(1)}>
              A record of courses and certifications supporting my growth in software quality
              assurance.
            </h2>
          </div>

          <div className="cert-body">
            <div className="cert-list">
              {certificates.map((cert, index) => (
                /*
                 * Wrapper div carries data-reveal; CertificateCard keeps its own
                 * hover-card / bracketed / cert-row__preview styles fully intact.
                 */
                <div
                  key={`${cert.title}-${index}`}
                  className="reveal-wrapper"
                  data-reveal="up"
                  style={stagger(index)}
                >
                  <CertificateCard cert={cert} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 6: Contact ── */}
        <section className="contact" id="contact">
          <div className="contact-inner">
            <div className="contact-copy">
              <h2 data-reveal="up" style={stagger(0)}>
                Let's make quality part of every release.
              </h2>
              <p data-reveal="up" style={stagger(1)}>
                Have a project, opportunity, or idea to discuss? I'd be happy to connect and talk
                about how thoughtful testing can help deliver a more reliable product.
              </p>
              <div data-reveal="up" style={stagger(2)}>
                <Button variant="primary" href="mailto:jayyidjidan14@gmail.com">
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer>
          <div className="footer-top">
            <p data-reveal="up" style={stagger(0)}>
              ©2026 Copyright Tufaiv Studio, All Right Reserved
            </p>
            <div className="socials">
              {/* TODO: replace # with real URLs */}
              {[
                { href: 'https://github.com/jayyidjidan',                      label: 'GitHub',   icon: 'f305f.svg' },
                { href: 'mailto:jayyidjidan14@gmail.com', label: 'Gmail',    icon: 'glyph-gmail.svg' },
                { href: 'https://wa.me/6285725736546',                      label: 'WhatsApp', icon: '1281d.svg' },
              ].map(({ href, label, icon }, i) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="icon-tile bracketed"
                  data-reveal="up"
                  style={stagger(i + 1)}
                >
                  <img src={`${A}/${icon}`} alt="" style={{ width: 40, height: 40 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer bars: grow from bottom, center bar first ([2,1,0,1,2]) */}
          <div className="footer-bars" aria-hidden="true">
            {[68, 84, 100, 84, 68].map((height, index) => (
              <div
                key={index}
                style={{ height: `${height}%`, '--i': [2, 1, 0, 1, 2][index] } as React.CSSProperties}
                data-reveal="grow"
              />
            ))}
          </div>
        </footer>
      </main>
    </>
  )
}