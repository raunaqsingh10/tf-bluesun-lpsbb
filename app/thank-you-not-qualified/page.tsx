import type { Metadata } from 'next';
import { ThankYouPage } from '../components/ThankYouPage';

export const metadata: Metadata = {
  title: 'Blue Sun | Fit update',
  description: 'We may not be the right fit for your business right now.',
};

export default function NotQualifiedThankYouPage() {
  return <ThankYouPage variant="not-qualified" />;
}
