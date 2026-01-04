import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <header className="section-card">
        <h1>Cars &amp; Magic</h1>
        <p>
          A Miyazaki-inspired racing experiment. This placeholder page keeps deployments green while
          we build the client.
        </p>
      </header>

      <section className="section-card">
        <h2>API &amp; Server</h2>
        <p>
          The Colyseus server lives in <code>apps/server</code>. Deploy it to your preferred hosting
          provider.
        </p>
        <p>Once the real client is ready, point it at your server URL and ship.</p>
        <p>
          Need a quick health check? Hit <code>/healthz</code> on your server deployment.
        </p>
      </section>

      <section className="section-card">
        <h2>Repository Links</h2>
        <ul>
          <li>
            <Link href="https://github.com/MagicbornStudios/miyazaki-inspired-mapmaker">
              GitHub Repository
            </Link>
          </li>
          <li>
            <Link href="https://render.com" target="_blank" rel="noreferrer">
              Render Deployment Guide
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
