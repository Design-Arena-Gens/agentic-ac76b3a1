import "./globals.css";
export const metadata = {
  title: "Agentic Chat",
  description: "A lightweight ChatGPT-like UI powered by OpenAI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
