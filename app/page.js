import Chat from "../components/Chat";

export default function Page() {
  return (
    <div className="container">
      <header>
        <div className="header-inner">
          <div className="logo" />
          <div className="brand">Agentic Chat</div>
        </div>
      </header>
      <main>
        <Chat />
      </main>
      <footer>
        <div className="footer-inner">
          Built for Vercel deployment. Add OPENAI_API_KEY for real responses.
        </div>
      </footer>
    </div>
  );
}
