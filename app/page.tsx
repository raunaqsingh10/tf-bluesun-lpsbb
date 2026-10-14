import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookingEmbed } from './components/BookingEmbed';
import { LazyVideoCard } from './components/LazyVideoCard';
import {
  captureTrackingParams,
  getTrackingParamsFromStore,
  installTrackingLinkDecoration,
} from './lib/attribution';

type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  channel?: 'SMS' | 'LinkedIn';
  layout?: 'wide' | 'conversation';
};

const mediaManifest = {
  response01: {
    src: '/media/campaign-proof/response-01-linkedin.jpg',
    alt: 'LinkedIn conversation with Karan Jain proposing a Google Meet and an invite',
    width: 4096,
    height: 1054,
    channel: 'LinkedIn',
    layout: 'wide',
  },
  response02: {
    src: '/media/campaign-proof/response-02-sms.png',
    alt: 'SMS conversation with Brett showing interest and agreeing to 11am',
    width: 700,
    height: 828,
    channel: 'SMS',
    layout: 'conversation',
  },
  response03: {
    src: '/media/campaign-proof/response-03-linkedin.jpg',
    alt: 'LinkedIn message from Dr. Paramjeet Singh Makani proposing tomorrow at 2:30pm',
    width: 3072,
    height: 1093,
    channel: 'LinkedIn',
    layout: 'wide',
  },
  response04: {
    src: '/media/campaign-proof/response-04-sms.png',
    alt: 'SMS conversation with Marc Segal about starting Green Rhino',
    width: 720,
    height: 550,
    channel: 'SMS',
    layout: 'conversation',
  },
  response05: {
    src: '/media/campaign-proof/response-05-sms.png',
    alt: 'SMS conversation with Robert Byrd about getting R&S Junk started',
    width: 696,
    height: 570,
    channel: 'SMS',
    layout: 'conversation',
  },
  response06: {
    src: '/media/campaign-proof/response-06-linkedin.jpg',
    alt: 'LinkedIn message from Ritesh Suneja asking about availability on Wednesday at 3 PM',
    width: 4096,
    height: 1054,
    channel: 'LinkedIn',
    layout: 'wide',
  },
  mehakPortrait: {
    src: '/media/mehak-portrait.png',
    alt: 'Mehak Dhoundiyal, founder of Blue Sun',
    width: 790,
    height: 790,
  },
} satisfies Record<string, ImageAsset | undefined>;

const authorityLogos = [
  { name: 'KPMG', src: '/media/brand-logos/kpmg.svg?v=20260924', alt: 'KPMG logo', width: 512, height: 204 },
  {
    name: 'Deutsche Bank',
    src: '/media/brand-logos/deutsche-bank.svg?v=20260924-centered-lockup',
    alt: 'Deutsche Bank logo',
    width: 250,
    height: 52,
  },
  { name: 'Citibank', src: '/media/brand-logos/citibank.svg?v=20260924', alt: 'Citibank logo', width: 300, height: 81 },
] as const;

const testimonialMedia = {
  keith: {
    src: '/media/testimonials/keith.mp4',
    poster: '/media/testimonials/keith.jpg',
  },
  dex: {
    src: '/media/testimonials/dex.mp4',
    poster: '/media/testimonials/dex.jpg',
  },
  devStaff: {
    src: '/media/testimonials/dev-staff.mp4',
    poster: '/media/testimonials/dev-staff.jpg',
  },
} satisfies Record<string, { src?: string; poster?: string }>;

const clientResults = [
  {
    company: 'Infinite Consulting',
    logo: { src: '/media/client-logos/infinite-consulting.png', width: 742, height: 386, variant: 'infinite' },
    descriptor: 'California-based consulting firm',
    number: '110',
    result: 'qualified sales calls',
    timeframe: 'In 60 days',
    secondary: '20 clients closed · $40K/month in revenue',
  },
  {
    company: 'Perigon Capital',
    logo: { src: '/media/client-logos/perigon-capital.jpeg', width: 400, height: 400, variant: 'perigon' },
    descriptor: 'Boutique investment bank',
    number: '90',
    result: 'off-market introductions',
    timeframe: 'In 60 days',
    secondary: '9 signed mandates · $300K net revenue',
  },
  {
    company: 'FOMA AI',
    logo: { src: '/media/client-logos/foma-ai.png', width: 200, height: 200, variant: 'foma' },
    descriptor: 'Beverly Hills-based AI agency',
    number: '220',
    result: 'qualified sales calls',
    timeframe: 'In 100 days',
    secondary: '20 clients closed · $40K/month in revenue',
  },
  {
    company: 'Lopes Capital',
    logo: { src: '/media/client-logos/lopes-capital.png', width: 480, height: 266, variant: 'lopes' },
    descriptor: 'Private equity practice',
    number: '410',
    result: 'off-market introductions',
    timeframe: 'In 180 days',
    secondary: '49 LOIs issued · 8 signed',
  },
];

function SwipeGallery({
  id,
  label,
  variant,
  slides,
}: {
  id: string;
  label: string;
  variant: 'results' | 'screenshots';
  slides: { label: string; content: ReactNode }[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState([0]);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pagePositions = [0];
    const updateActivePage = () => {
      const nearestPage = pagePositions.reduce((nearest, position, index) => (
        Math.abs(position - track.scrollLeft) < Math.abs(pagePositions[nearest] - track.scrollLeft)
          ? index
          : nearest
      ), 0);
      setActivePage(nearestPage);
    };
    const measure = () => {
      const firstSlide = track.firstElementChild as HTMLElement | null;
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      pagePositions = Array.from(track.children).reduce<number[]>((pages, child) => {
        const offset = (child as HTMLElement).offsetLeft - (firstSlide?.offsetLeft ?? 0);
        const position = Math.min(offset, maxScroll);
        if (!pages.length || position - pages[pages.length - 1] > 1) pages.push(position);
        return pages;
      }, []);
      setPositions(pagePositions);
      updateActivePage();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(track);
    measure();
    track.addEventListener('scroll', updateActivePage, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', updateActivePage);
    };
  }, [slides.length]);

  const goToPage = (index: number) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    trackRef.current?.scrollTo({ left: positions[index], behavior: reduceMotion ? 'instant' : 'smooth' });
  };

  return (
    <div className={`swipe-gallery swipe-gallery--${variant}`} role="region" aria-roledescription="carousel" aria-label={label}>
      <div
        className="swipe-gallery-track"
        id={id}
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label={`${label} slides`}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const targetPages: Partial<Record<string, number>> = {
            ArrowLeft: Math.max(0, activePage - 1),
            ArrowRight: Math.min(positions.length - 1, activePage + 1),
            Home: 0,
            End: positions.length - 1,
          };
          const targetPage = targetPages[event.key];
          if (targetPage === undefined) return;
          event.preventDefault();
          goToPage(targetPage);
        }}
      >
        {slides.map((slide, index) => (
          <div className="swipe-gallery-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.label}`} key={slide.label}>
            {slide.content}
          </div>
        ))}
      </div>
      <div className="gallery-pagination" role="group" aria-label={`${label} pagination`}>
        {positions.map((position, index) => (
          <button
            className="gallery-page"
            type="button"
            aria-label={`Go to ${label.toLowerCase()} page ${index + 1}`}
            aria-controls={id}
            aria-current={index === activePage ? 'true' : undefined}
            onClick={() => goToPage(index)}
            key={position}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CampaignResponse({ asset, label }: { asset: ImageAsset; label: string }) {
  return (
    <figure className="campaign-response">
      <figcaption className="proof-meta"><span>{label}</span><span>{asset.channel}</span></figcaption>
      <img className="proof-image" src={asset.src} alt={asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" />
    </figure>
  );
}

export default function Home() {
  const [trackingParams] = useState<URLSearchParams>(() => {
    const store = captureTrackingParams();
    return getTrackingParamsFromStore(store);
  });

  useEffect(() => {
    return installTrackingLinkDecoration(document, trackingParams);
  }, [trackingParams]);

  return (
    <div className="site-shell">
      <header className="header">
        <div className="shell header-inner">
          <div className="brand">
            <img
              className="brand-logo"
              src="/blue-sun-logo.png"
              alt="Blue Sun Consulting"
              width={1676}
              height={466}
              fetchPriority="high"
              decoding="async"
            />
          </div>
          <div className="header-note">US Pipeline Systems for B2B Service Businesses</div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="shell hero-copy">
            <p className="overline">For B2B service businesses where one new client is worth ₹2L+</p>
            <h1 className="hero-headline">
              <span className="hero-headline-line">Get <span className="num">100</span> Qualified</span>{' '}
              <span className="hero-headline-line">US Sales Appointments</span>{' '}
              <span className="hero-headline-line">in 90 Days</span>
            </h1>
            <p className="lead">
              We find the right US decision-makers, reach out to them, qualify the interested prospects and book sales calls directly into your calendar.
            </p>
            <p className="strong-line">You focus on selling. We handle the prospecting.</p>

            <div className="hero-actions">
              <a className="cta" href="#apply">
                See If Your Business Qualifies
              </a>
              <p className="guarantee-line">
                100 appointments guaranteed. If we don&apos;t reach the target in 90 days, we keep working at no additional management fee until we do.
              </p>
            </div>
          </div>
        </section>

        <section className="section white no-border">
          <div className="shell">
            <div className="client-results-head">
              <p className="overline blue">REAL CLIENT RESULTS</p>
              <h2>Results from B2B businesses we&apos;ve worked with.</h2>
              <p className="body-copy">Across consulting, AI, investment banking and private equity.</p>
            </div>

            <SwipeGallery
              id="client-results-gallery"
              label="Client results"
              variant="results"
              slides={clientResults.map((client) => ({
                label: client.company,
                content: (
                  <article className="client-result-card">
                    <div className="result-main">
                      <div className="result-identity">
                        <p className="result-descriptor">{client.descriptor}</p>
                        <div className="result-logo-slot">
                          {client.logo ? (
                            <img
                              className={`result-logo result-logo--${client.logo.variant}`}
                              src={client.logo.src}
                              alt={`${client.company} logo`}
                              width={client.logo.width}
                              height={client.logo.height}
                              loading="lazy"
                              decoding="async"
                            />
                          ) : null}
                        </div>
                        <p className="result-company">{client.company}</p>
                      </div>
                      <h3 className="result-primary"><span className="result-number">{client.number}</span>{' '}<span className="result-label">{client.result}</span></h3>
                      <p className="result-timeframe">{client.timeframe}</p>
                    </div>
                    <p className="result-secondary">{client.secondary}</p>
                  </article>
                ),
              }))}
            />

          </div>
        </section>

        <section className="section">
          <div className="shell text-section-inner">
            <h2>
              <span className="headline-part">The hard part isn&apos;t finding US companies.</span>
              <span className="headline-part">It&apos;s getting the right ones into sales conversations, consistently.</span>
            </h2>
            <p className="body-copy">Referrals are unpredictable.</p>
            <p className="body-copy">Doing the prospecting yourself takes time away from selling and running the business.</p>
            <p className="body-copy">Building an outbound team means hiring, training and managing people before you know the system works.</p>
            <p className="body-copy">And most outsourced outbound still leaves you with more names, more messages and more low-intent conversations.</p>
            <p className="strong-line"><strong>You should be taking qualified sales calls, not spending your time running outbound.</strong></p>
          </div>
        </section>

        <section className="section white">
          <div className="shell text-section-inner">
            <h2>Most outreach asks the wrong question.</h2>
            <p className="body-copy">It asks:</p>
            <div className="quote-block quote-muted"><strong>“Who fits our ICP?”</strong></div>
            <p className="body-copy">So teams build large lists of companies that look right on paper, then send emails and LinkedIn messages hoping some of them actually need what they sell.</p>
            <p className="body-copy">But matching your ICP doesn&apos;t mean the problem is active or that the company is trying to solve it.</p>
            <p className="body-copy">The better question is:</p>
            <div className="quote-block quote-featured"><strong>“Who fits our ICP and is already showing signs they are trying to solve the problem we solve?”</strong></div>
            <p className="strong-line"><strong>That is where better sales conversations begin.</strong></p>
          </div>
        </section>

        <section className="section soft-blue">
          <div className="shell mechanism-wrap">
            <div className="mechanism-intro">
              <p className="overline blue">THE BLUE SUN DIFFERENCE</p>
              <h2>
                <span className="headline-part">We don&apos;t just target companies that fit your ICP.</span>
                <span className="headline-part">We target companies already trying to solve the problem your service solves.</span>
              </h2>
              <p className="contrast-line">Then we build and run the system that turns those signals into qualified sales calls.</p>
            </div>

            <div className="steps">
              <div className="step">
                <div className="step-num">01</div>
                <div>
                  <h3>Find companies with an active reason to talk</h3>
                  <p>We track <strong>200+ pain, commercial and buying signals</strong> such as hiring activity, expansion, funding, leadership changes and other market activity that can show the problem you solve is active.</p>
                  <p className="step-follow-up">Then we identify the decision-maker responsible for solving it.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">02</div>
                <div>
                  <h3>Reach them through your business</h3>
                  <p>We build the messaging around the signals we found and reach prospects through the channels that make sense for your market, including SMS, email, LinkedIn and voicemail.</p>
                  <p className="step-follow-up">The outreach comes from your business, using messaging approved by you, so prospects experience it as a direct conversation with your company.</p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">03</div>
                <div>
                  <h3>Qualify the conversation before it reaches you</h3>
                  <p>When someone responds, we work the conversation against the qualification criteria agreed at onboarding.</p>
                  <p className="step-follow-up">We look for the right company, the right decision-maker and a genuine reason to discuss your offer.</p>
                  <p className="step-follow-up"><strong>If the opportunity does not qualify, it does not reach your calendar and does not count towards the 100.</strong></p>
                </div>
              </div>

              <div className="step">
                <div className="step-num">04</div>
                <div>
                  <h3>Keep the opportunity moving</h3>
                  <p>We handle the follow-up, reminders and booking workflow required to move qualified prospects from first response to scheduled conversation.</p>
                  <p className="step-follow-up">So opportunities do not disappear simply because someone failed to follow up at the right time.</p>
                </div>
              </div>
            </div>

            <div className="mechanism-result"><strong>Your team does not have to build, manage or babysit the outbound system. You focus on taking qualified sales calls and closing the right clients.</strong></div>
          </div>
        </section>

        <section className="section white">
          <div className="shell">
            <div className="campaign-proof-head">
              <p className="overline blue">Real Campaign Proof</p>
              <h2>Reach companies showing the right signals, and the conversation changes.</h2>
              <p className="body-copy">These are real responses from prospects reached through client campaigns across SMS and LinkedIn.</p>
            </div>

            <SwipeGallery
              id="campaign-response-gallery"
              label="Campaign responses"
              variant="screenshots"
              slides={[
                {
                  label: 'Brett SMS response',
                  content: <article className="campaign-proof-card"><CampaignResponse label="Response 02" asset={mediaManifest.response02} /></article>,
                },
                {
                  label: 'Three LinkedIn responses',
                  content: (
                    <article className="campaign-proof-card campaign-proof-card--linkedin">
                      <CampaignResponse label="Response 01" asset={mediaManifest.response01} />
                      <CampaignResponse label="Response 03" asset={mediaManifest.response03} />
                      <CampaignResponse label="Response 06" asset={mediaManifest.response06} />
                    </article>
                  ),
                },
                {
                  label: 'Marc Segal SMS response',
                  content: <article className="campaign-proof-card"><CampaignResponse label="Response 04" asset={mediaManifest.response04} /></article>,
                },
                {
                  label: 'Robert Byrd SMS response',
                  content: <article className="campaign-proof-card"><CampaignResponse label="Response 05" asset={mediaManifest.response05} /></article>,
                },
              ]}
            />

            <div className="proof-cta">
              <a className="cta" href="#apply">
                See If Your Business Qualifies
              </a>
            </div>
          </div>
        </section>

        <section className="section soft">
          <div className="shell">
            <p className="overline">From the people we&apos;ve worked with</p>
            <h2>What clients say after Blue Sun starts building their pipeline</h2>
            <p className="body-copy">Real feedback from clients on lead quality, execution and working with the team.</p>

            <div className="video-strip" aria-label="Client video testimonials">
              <LazyVideoCard
                name="Keith Nickel"
                descriptor="FOMA AI · California"
                quote="“The leads are fantastic.”"
                {...testimonialMedia.keith}
              />
              <LazyVideoCard
                name="Dex"
                descriptor="Founder & CEO, Voldy AI"
                quote="“I definitely could not have started this journey without them.”"
                {...testimonialMedia.dex}
              />
              <LazyVideoCard
                name="Lopes Capital"
                descriptor="Family Office · Scottsdale"
                quote="“We spoke to upwards of 30 daycares in a short period of time... the results really speak for themselves.”"
                {...testimonialMedia.devStaff}
              />
            </div>
          </div>
        </section>

        <section className="section white" id="offer">
          <div className="shell">
            <p className="overline blue">The Blue Sun 90-Day US Pipeline Build</p>
            <h2>
              <span className="headline-part">We run the outbound engine.</span>{' '}
              <span className="headline-part">Your team takes the sales calls.</span>
            </h2>
            <div className="offer-copy">
              <p className="body-copy">Blue Sun handles the prospecting, outreach, qualification, follow-up and appointment booking.</p>
              <p className="body-copy">You give us the context about your offer, approve the messaging, take the qualified sales calls and share feedback so we can keep improving results.</p>
            </div>

            <div className="commitment">
              <p className="overline blue">Our Guarantee</p>
              <h3><span className="blue">100 qualified US sales appointments</span> booked within 90 days.</h3>
              <p>We only take on businesses where we believe that target is achievable.</p>
              <p>If we do not book all 100 qualified appointments within the first 90 days, <strong>Blue Sun continues running your campaign at no additional management fee until the remaining appointments are delivered.</strong></p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <p className="overline">Before You Apply</p>
            <h2>We only take on businesses where 100 qualified US appointments can make commercial sense.</h2>
            <p className="body-copy">That means your business should have:</p>

            <ul className="qualification-list">
              <li>
                <strong>A proven B2B service.</strong>
                <p>Something you&apos;re already selling successfully, not an offer you&apos;re still testing.</p>
              </li>
              <li>
                <strong>A client value of at least ₹2L.</strong>
                <p>So the economics can justify investing in a managed acquisition system.</p>
              </li>
              <li>
                <strong>A meaningful US market.</strong>
                <p>Enough relevant companies and decision-makers for consistent outreach.</p>
              </li>
              <li>
                <strong>The ability to turn sales calls into clients.</strong>
                <p>A team ready to take qualified meetings, follow up and close business.</p>
              </li>
            </ul>

            <p className="qualification-note">If you&apos;re still experimenting with your offer, looking for a handful of cheap leads or unable to take new sales calls, this won&apos;t be the right engagement.</p>
            <a className="cta" href="#apply">
              See If Your Business Qualifies
            </a>
          </div>
        </section>

        <section className="section white">
          <div className="shell authority-grid">
            <div className="authority-portrait">
              {mediaManifest.mehakPortrait ? (
                <img
                  className="authority-portrait-image"
                  src={mediaManifest.mehakPortrait.src}
                  alt={mediaManifest.mehakPortrait.alt}
                  width={mediaManifest.mehakPortrait.width}
                  height={mediaManifest.mehakPortrait.height}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="authority-portrait-placeholder" role="img" aria-label="Mehak portrait placeholder" />
              )}
            </div>
            <div className="authority-content">
              <p className="overline blue">Built and led by Mehak Dhoundiyal</p>
              <h2>The operator behind Blue Sun.</h2>
              <p className="lead">Mehak has built and operated outbound and growth systems across high-ticket B2B businesses.</p>
              <div className="authority-stat">$450M+</div>
              <div className="authority-label">in client deal flow</div>
              <p className="body-copy authority-copy">Experience with clients from:</p>
              <div className="logo-row" aria-label="Client-background logos">
                {authorityLogos.map((logo) => (
                  <div className={`logo-tile logo-tile--${logo.name.toLowerCase().replaceAll(' ', '-')}`} key={logo.name}>
                    <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section soft">
          <div className="shell faq">
            <h2>Frequently Asked Questions</h2>

            <details>
              <summary>What counts as a qualified appointment?</summary>
              <div className="faq-answer">
                <p>A qualified appointment is a booked meeting with a US-based decision-maker from a company that matches the customer profile agreed at onboarding, and who has positively agreed to discuss your offer.</p>
                <p>If a prospect does not meet the agreed qualification criteria, the appointment does not count towards the 100.</p>
              </div>
            </details>

            <details>
              <summary>What will my team need to do?</summary>
              <div className="faq-answer">
                <p>We handle the targeting, prospect data, outreach, qualification, booking and ongoing optimisation.</p>
                <p>Your team provides the initial offer and customer information, approves the messaging, keeps enough calendar capacity available, takes the sales calls and gives us regular feedback on meeting quality.</p>
              </div>
            </details>

            <details>
              <summary>How quickly can we get started?</summary>
              <div className="faq-answer">
                <p>Our standard rollout is fast.</p>
                <p><strong>By Day 3</strong>, we complete onboarding, define your ICP and configure the targeting, data and messaging.</p>
                <p><strong>By Day 5</strong>, once you approve the messaging, the first campaigns go live.</p>
                <p><strong>From around Day 7</strong>, qualified conversations can begin booking directly into your calendar.</p>
              </div>
            </details>

            <details>
              <summary>What happens if Blue Sun does not book all 100 appointments within 90 days?</summary>
              <div className="faq-answer">
                <p>If all 100 qualified US appointments have not been booked by the end of the 90-day engagement, Blue Sun continues running the campaign at no additional management fee until the remaining appointments are delivered.</p>
                <p>The guarantee is offered only to businesses that pass the initial Fit Assessment.</p>
              </div>
            </details>
          </div>
        </section>

        <section className="section navy" id="apply">
          <div className="shell application-intro">
            <p className="overline light">Ready to build your US pipeline?</p>
            <h2>See if Blue Sun is the right fit for your business.</h2>
            <p className="lead">If you have a proven B2B service, strong client economics and are serious about building a repeatable US pipeline, complete the short application below.</p>
            <p className="body-copy light-copy">We will first understand your offer, client value and US growth goals.</p>
            <p className="body-copy light-copy">If there is a strong fit, you will be able to choose a time to speak directly with Mehak about how the 90-Day US Pipeline Build could work for your business.</p>

            <BookingEmbed trackingParams={trackingParams} />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">Blue Sun</div>
      </footer>
    </div>
  );
}
