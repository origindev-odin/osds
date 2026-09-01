import type { ReactNode } from "react";
import "./public.css";

export const metadata = {
  title: {
    default: "Directory",
    template: "%s",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
