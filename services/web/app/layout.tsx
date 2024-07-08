import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CoTasker',
  icons: '/favicon.png',
  authors: {
    url: 'https://wujinjing.com',
    name: 'Jinjing Wu',
  },
  description: 'A to-do app support real-time user collaboration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
