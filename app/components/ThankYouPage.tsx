import type { ReactNode } from 'react';

type ThankYouVariant = 'qualified' | 'not-qualified';

type ThankYouSection = {
  heading: string;
  paragraphs?: ReactNode[];
  items?: ReactNode[];
  listTone?: 'positive' | 'neutral';
};

type ThankYouCopy = {
  pageClass: string;
  eyebrow: string;
  title: string;
  intro: ReactNode[];
  sections?: ThankYouSection[];
  tail?: ReactNode[];
};

function QualifiedStatusIcon() {
  return (
    <div className="thank-you-status-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="presentation">
        <circle cx="32" cy="32" r="27" />
        <path d="m20 32.5 8 8 16-17" />
      </svg>
    </div>
  );
}

const thankYouCopy: Record<ThankYouVariant, ThankYouCopy> = {
  qualified: {
    pageClass: 'is-qualified',
    eyebrow: "You're booked.",
    title: 'Your US Pipeline Fit Call with Blue Sun is confirmed.',
    intro: [
      <>Your application met our initial criteria, and your call has been scheduled.</>,
      <>
        On the call, we will look at your offer, client economics and US market to determine whether the{' '}
        <strong>Blue Sun 90-Day US Pipeline Build</strong> is the right fit for your business.
      </>,
    ],
    sections: [
      {
        heading: 'We will cover:',
        listTone: 'positive',
        items: [
          <>Who we would target for you in the US</>,
          <>Whether the economics make sense for your business</>,
          <>How Blue Sun would build and run your outbound pipeline</>,
          <>Whether there is a strong enough fit to work together</>,
        ],
      },
      {
        heading: 'Before the call',
        paragraphs: [
          <>Please join from somewhere you can have a proper business conversation.</>,
          <>
            If anyone else is involved in the decision to build your US pipeline, we recommend having them join the call as well.
          </>,
          <>A calendar invite and reminders are on the way.</>,
          <strong key="qualified-closing">We look forward to speaking with you.</strong>,
        ],
      },
    ],
  },
  'not-qualified': {
    pageClass: 'is-not-qualified',
    eyebrow: 'Thanks for your interest in Blue Sun.',
    title: 'We may not be the right fit for your business right now.',
    intro: [
      <>
        Based on the information you shared, we do not believe the <strong>Blue Sun 90-Day US Pipeline Build</strong> would be the right engagement for your business at this stage.
      </>,
      <>We only take on campaigns where we believe the offer, market, economics and sales capacity give the system a strong opportunity to work.</>,
    ],
    sections: [
      {
        heading: 'Blue Sun is generally best suited to businesses that:',
        listTone: 'neutral',
        items: [
          <>Have a proven B2B service</>,
          <>Generate at least <strong>₹2L from a typical new client</strong></>,
          <>Have a meaningful US market</>,
          <>Have capacity to take qualified sales calls</>,
          <>Are ready to build a repeatable outbound pipeline</>,
        ],
      },
    ],
    tail: [
      <>If your business reaches this stage in the future, you are welcome to apply again.</>,
      <strong key="not-qualified-closing">Thank you for considering Blue Sun.</strong>,
    ],
  },
};

export function ThankYouPage({ variant }: { variant: ThankYouVariant }) {
  const copy = thankYouCopy[variant];

  return (
    <div className={`site-shell thank-you-page ${copy.pageClass}`}>
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
        <section className="thank-you-main">
          <div className="shell thank-you-layout">
            <div className="thank-you-title">
              {variant === 'qualified' ? <QualifiedStatusIcon /> : null}
              <p className="thank-you-eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
            </div>

            <div className="thank-you-copy">
              <div className="thank-you-intro">
                {copy.intro.map((paragraph, index) => (
                  <p key={`intro-${index}`}>{paragraph}</p>
                ))}
              </div>

              {copy.sections?.map((section) => (
                <section className="thank-you-section" key={section.heading}>
                  <h2>{section.heading}</h2>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={`${section.heading}-paragraph-${index}`}>{paragraph}</p>
                  ))}
                  {section.items ? (
                    <ul className={`thank-you-list ${section.listTone === 'neutral' ? 'is-neutral' : 'is-positive'}`}>
                      {section.items.map((item, index) => (
                        <li key={`${section.heading}-item-${index}`}>
                          <span className="thank-you-list-marker" aria-hidden="true" />
                          <span className="thank-you-list-copy">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}

              {copy.tail ? (
                <div className="thank-you-tail">
                  {copy.tail.map((paragraph, index) => (
                    <p className={index === copy.tail!.length - 1 ? 'thank-you-final' : undefined} key={`tail-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="shell">Blue Sun</div>
      </footer>
    </div>
  );
}
