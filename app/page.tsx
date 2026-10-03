import { useEffect, useState } from 'react';
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
  proofBridgeSms: {
    src: '/media/proof-bridge/response-pete-guajardo-sms.png',
    alt: 'SMS conversation with Pete Guajardo asking what time works today',
    width: 703,
    height: 538,
    channel: 'SMS',
    layout: 'conversation',
  },
  proofBridgeSmsTwo: {
    src: '/media/proof-bridge/response-david-burpo-sms.png',
    alt: 'SMS conversation with David Burpo saying he is ready to talk and can be contacted anytime',
    width: 703,
    height: 516,
    channel: 'SMS',
    layout: 'conversation',
  },
  proofBridgeSmsThree: {
    src: '/media/proof-bridge/response-rodrigo-diaz-sms.png',
    alt: 'SMS conversation with Rodrigo Diaz showing interest and sharing an email address',
    width: 693,
    height: 537,
    channel: 'SMS',
    layout: 'conversation',
  },
  calendar: {
    src: '/media/proof-bridge/populated-appointment-calendar.jpg',
    alt: 'Populated appointment calendar showing booked growth meetings, discovery calls, and onboarding events',
    width: 1725,
    height: 549,
  },
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

function ProofPlaceholder({ compact = false, pattern }: { compact?: boolean; pattern: string[] }) {
  return (
    <div
      className={`proof-placeholder${compact ? ' compact' : ''}`}
      role="img"
      aria-label="Proof screenshot placeholder"
    >
      <div className="placeholder-lines">
        {pattern.map((line, index) => (
          <span className={line} key={`${line}-${index}`} />
        ))}
      </div>
      <div className="reply-bubble" aria-hidden="true" />
    </div>
  );
}

function ProofCard({
  channel,
  label,
  compact = false,
  showMeta = true,
  asset,
  pattern,
  placement,
}: {
  channel: string;
  label?: string;
  compact?: boolean;
  showMeta?: boolean;
  asset?: ImageAsset;
  pattern: string[];
  placement?: string;
}) {
  const className = compact
    ? `mini-proof-card${asset?.layout ? ` proof-card--${asset.layout}` : ''}`
    : 'proof-card';

  return (
    <article className={className} data-proof={placement}>
      {showMeta ? (
        <div className="proof-meta">
          <span>{label ?? (compact ? 'Response' : 'Prospect response')}</span>
          <span>{asset?.channel ?? channel}</span>
        </div>
      ) : null}
      {asset ? (
        <img
          className="proof-image"
          src={asset.src}
          alt={asset.alt}
          width={asset.width}
          height={asset.height}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <ProofPlaceholder compact={compact} pattern={pattern} />
      )}
    </article>
  );
}

function CalendarPlaceholder() {
  return (
    <div className="calendar" role="img" aria-label="Populated appointment calendar placeholder">
      <div className="calendar-head">
        <span>Populated appointment calendar</span>
      </div>
      <div className="calendar-grid">
        <div className="day">
          <div className="event e1">Booked call</div>
          <div className="event e3">Booked call</div>
        </div>
        <div className="day">
          <div className="event e2">Booked call</div>
          <div className="event e4">Booked call</div>
        </div>
        <div className="day">
          <div className="event e1">Booked call</div>
          <div className="event e5">Booked call</div>
          <div className="event e4">Booked call</div>
        </div>
        <div className="day">
          <div className="event e6">Booked call</div>
          <div className="event e3">Booked call</div>
        </div>
        <div className="day">
          <div className="event e2">Booked call</div>
          <div className="event e7">Booked call</div>
        </div>
      </div>
    </div>
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
            <div className="proof-intro">
              <h2>Real conversations. Booked directly onto the calendar.</h2>
              <p>A few examples from outreach campaigns run for clients.</p>
            </div>

            <div className="proof-scroll" aria-label="Three prospect-response screenshots">
              <ProofCard showMeta={false} channel="SMS" pattern={['short', 'mid', '']} asset={mediaManifest.proofBridgeSms} />
              <ProofCard showMeta={false} channel="SMS" pattern={['mid', '', 'short']} asset={mediaManifest.proofBridgeSmsTwo} />
              <ProofCard showMeta={false} channel="SMS" pattern={['', 'short', 'bluebar']} asset={mediaManifest.proofBridgeSmsThree} />
            </div>

            {mediaManifest.calendar ? (
              <img
                className="calendar-image"
                src={mediaManifest.calendar.src}
                alt={mediaManifest.calendar.alt}
                width={mediaManifest.calendar.width}
                height={mediaManifest.calendar.height}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <CalendarPlaceholder />
            )}

            <div className="proof-intro">
              <p>Appointments booked directly into a client&apos;s calendar.</p>
            </div>

            <div className="quote-block quote-muted">
              “I&apos;ve bought leads before from companies, and I&apos;ve had other people do lead generation for me with Facebook ads, and they were terrible leads. <strong>I definitely think we&apos;ve got a goldmine.</strong>”
            </div>

            <div className="proof-intro">
              <p>
                Keith Nickel
                <br />
                FOMA AI · California
              </p>
            </div>
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

            <div className="campaign-proof-gallery" aria-label="Six campaign response screenshots">
              <ProofCard compact label="Response 01" channel="LinkedIn" placement="01" pattern={['', 'mid', 'short']} asset={mediaManifest.response01} />
              <ProofCard compact label="Response 02" channel="SMS" placement="02" pattern={['mid', '', 'short']} asset={mediaManifest.response02} />
              <ProofCard compact label="Response 03" channel="LinkedIn" placement="03" pattern={['', 'bluebar', 'mid']} asset={mediaManifest.response03} />
              <ProofCard compact label="Response 04" channel="SMS" placement="04" pattern={['short', '', 'mid']} asset={mediaManifest.response04} />
              <ProofCard compact label="Response 05" channel="SMS" placement="05" pattern={['mid', 'short', '']} asset={mediaManifest.response05} />
              <ProofCard compact label="Response 06" channel="LinkedIn" placement="06" pattern={['', 'mid', 'bluebar']} asset={mediaManifest.response06} />
            </div>

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
              <span className="headline-part">We run the outbound engine.</span>
              <span className="headline-part">Your team takes the sales calls.</span>
            </h2>
            <p className="lead">Blue Sun owns the work required to turn your US market into a consistent flow of qualified sales conversations.</p>

            <div className="offer-grid">
              <div className="offer-box">
                <h3>Blue Sun handles</h3>
                <ul>
                  <li>ICP, targeting and decision-maker research</li>
                  <li>Prospect data and signal identification</li>
                  <li>Messaging and campaign setup</li>
                  <li>SMS, email, voicemail and LinkedIn outreach</li>
                  <li>Reply handling and qualification</li>
                  <li>Calendar booking</li>
                  <li>Reporting and ongoing optimisation</li>
                </ul>
              </div>

              <div className="offer-box secondary">
                <h3>Your team stays focused on selling</h3>
                <p className="body-copy small-copy">Your involvement is simple.</p>
                <p className="body-copy small-copy">You give us the context we need about your offer and ideal customer, approve the messaging, keep enough calendar capacity available and take the qualified sales calls we book.</p>
                <p className="body-copy small-copy last-copy">Then you give us regular feedback on meeting quality so we can keep improving the system.</p>
              </div>
            </div>

            <div className="commitment">
              <p className="overline blue">Our Guarantee</p>
              <h3><span className="blue">100 qualified US sales appointments</span> booked within 90 days.</h3>
              <p>We only take on businesses where we believe that target is achievable.</p>
              <p>If we do not book all 100 qualified appointments within the first 90 days, <strong>Blue Sun continues running your campaign at no additional management fee until the remaining appointments are delivered.</strong></p>
              <p className="final">You take the sales calls. We own the pipeline-building work.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <p className="overline">Before You Apply</p>
            <h2>Blue Sun is built for businesses that are ready to take US growth seriously.</h2>

            <div className="fit-grid">
              <div className="fit-box">
                <h3>You are likely a strong fit if:</h3>
                <ul className="fit-list good">
                  <li>Your service is already proven and selling successfully</li>
                  <li>One new client is worth at least ₹2L</li>
                  <li>There is a meaningful US market for what you sell</li>
                  <li>Your team can take and follow up on qualified sales calls</li>
                  <li>You want to build a repeatable US pipeline, not just test a few leads</li>
                </ul>
              </div>

              <div className="fit-box muted">
                <h3>This is probably not the right fit if:</h3>
                <ul className="fit-list bad">
                  <li>You are still figuring out your offer or ideal customer</li>
                  <li>Your client value is too low for a managed outbound system to make commercial sense</li>
                  <li>Your US market is very small or difficult to define</li>
                  <li>You do not currently have the capacity to handle new opportunities</li>
                  <li>You are only exploring, looking for a free trial, or want a handful of test leads</li>
                </ul>
              </div>
            </div>

            <p className="body-copy">If this sounds like your business, the next step is to see whether there is a strong enough fit for Blue Sun to take on your campaign.</p>
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
