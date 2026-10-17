import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JellyFlex 2.0 — Autonomous Omni-Channel Social & AI Agent Suite',
  description:
    'Clean-room local-first social automation suite powered by Agno OS, Google Antigravity SDK & OpenClaw 7-Subsystems',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas-dark text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
