import type { Metadata } from 'next';
import { ThankYouPage } from '../components/ThankYouPage';

export const metadata: Metadata = {
  title: "You're booked | Blue Sun",
  description: 'Your US Pipeline Fit Call with Blue Sun is confirmed.',
};

export default function QualifiedThankYouPage() {
  return <ThankYouPage variant="qualified" />;
}
