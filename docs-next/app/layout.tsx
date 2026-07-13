import type { Metadata } from 'next';
import '../styles/docs.css';
import '../styles/next-docs.css';

export const metadata: Metadata = {
  title: 'VibeJS Docs',
  description: 'Declarative visual belief elicitation — documentation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
