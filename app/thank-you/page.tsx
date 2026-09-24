import { permanentRedirect } from 'next/navigation';

export default function LegacyQualifiedThankYouPage() {
  permanentRedirect('/thank-you-qualified');
}
