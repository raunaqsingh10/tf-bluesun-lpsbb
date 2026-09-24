import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blue Sun | 100 Qualified US Sales Appointments in 90 Days',
  description:
    'Blue Sun helps B2B service businesses build a consistent US pipeline of qualified sales conversations.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
