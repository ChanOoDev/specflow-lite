import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Analytics } from './analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SpecFlow Lite',
  description: 'Lightweight spec-driven development assistant',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
              }

              @keyframes fade {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              .animate-in {
                animation: fadeIn 0.3s ease-out both;
              }

              .animate-in:nth-child(1) { animation-delay: 0.03s; }
              .animate-in:nth-child(2) { animation-delay: 0.06s; }
              .animate-in:nth-child(3) { animation-delay: 0.09s; }
              .animate-in:nth-child(4) { animation-delay: 0.12s; }
              .animate-in:nth-child(5) { animation-delay: 0.15s; }
              .animate-in:nth-child(6) { animation-delay: 0.18s; }

              /* Smooth transitions for interactive elements */
              .hover-lift {
                transition: transform 0.15s ease, box-shadow 0.15s ease;
              }
              .hover-lift:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              }
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
