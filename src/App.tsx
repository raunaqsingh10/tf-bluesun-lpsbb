import { useEffect } from 'react';
import Home from '../app/page';
import { ThankYouPage } from '../app/components/ThankYouPage';

const routeMetadata = {
  home: {
    title: 'Blue Sun | 100 Qualified US Sales Appointments in 90 Days',
    description:
      'Blue Sun helps B2B service businesses build a consistent US pipeline of qualified sales conversations.',
  },
  qualified: {
    title: "You're booked | Blue Sun",
    description: 'Your US Pipeline Fit Call with Blue Sun is confirmed.',
  },
  notQualified: {
    title: 'Blue Sun | Fit update',
    description: 'We may not be the right fit for your business right now.',
  },
} as const;

function normalizePathname(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function setMetaDescription(description: string) {
  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');

  if (!descriptionTag) {
    descriptionTag = document.createElement('meta');
    descriptionTag.name = 'description';
    document.head.appendChild(descriptionTag);
  }

  descriptionTag.content = description;
}

function App() {
  const pathname = normalizePathname(window.location.pathname);
  const isLegacyThankYouRoute = pathname === '/thank-you';
  const metadata =
    pathname === '/thank-you-qualified' || isLegacyThankYouRoute
      ? routeMetadata.qualified
      : pathname === '/thank-you-not-qualified'
        ? routeMetadata.notQualified
        : routeMetadata.home;

  useEffect(() => {
    document.title = metadata.title;
    setMetaDescription(metadata.description);

    if (isLegacyThankYouRoute) {
      window.history.replaceState(null, '', '/thank-you-qualified');
    }
  }, [isLegacyThankYouRoute, metadata]);

  if (pathname === '/thank-you-qualified' || isLegacyThankYouRoute) {
    return <ThankYouPage variant="qualified" />;
  }

  if (pathname === '/thank-you-not-qualified') {
    return <ThankYouPage variant="not-qualified" />;
  }

  return <Home />;
}

export default App;
