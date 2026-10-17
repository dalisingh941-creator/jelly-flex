import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JellyFlex 2.0 — Local-First Conversational AI Agent Suite',
  description:
    'Anthropic-styled conversational AI agent suite and social automation platform with clean-room zero-knowledge BYOK architecture',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#FAF9F5] text-[#141413] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
