// src/app/layout.jsx
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/app/components/Header'; // We'll create this next

const inter = Inter({ subsets: ['latin'] });

// export const metadata = { // Metadata can still be defined like this
//   title: 'Batman Fitness Tracker',
//   description: 'Track your workouts, the Gotham way.',
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* You can add metadata directly here or use the metadata object (Next.js 13+ App Router) */}
        <title>Batman Fitness Tracker</title>
        <meta name="description" content="Track your workouts, the Gotham way." />
      </head>
      <body className={`${inter.className} bg-neutral-900 text-neutral-100`}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}