/** Three states that must never look like each other. */

export function ConfigError({ missing }: { missing: string[] }) {
  return (
    <main className="shell">
      <div className="state state--config">
        <span className="state-badge">Setup incomplete</span>
        <h1>A setting is missing</h1>
        <p>
          The board cannot start because it does not know where Supabase is, or
          which browser key to use. Both settings live in{" "}
          <code>.env.local</code>.
        </p>
        <ul>
          {missing.map((name) => (
            <li key={name}>
              Missing setting: <code>{name}</code>
            </li>
          ))}
        </ul>
        <div className="hint">
          Set the missing value in <code>.env.local</code> and restart the dev
          server. Only the browser (publishable) key belongs there — never the
          secret key.
        </div>
      </div>
    </main>
  );
}

export function LoadError({
  message,
  code,
}: {
  message: string;
  code?: string;
}) {
  const looksMissing =
    /does not exist|find the table|schema cache|relation|42p01|pgrst205/i.test(
      `${code ?? ""} ${message}`
    );

  return (
    <main className="shell">
      <div className="state state--error">
        <span className="state-badge">Connection problem</span>
        <h1>Could not reach the board</h1>
        <p>The call to Supabase failed. This is not an empty board.</p>
        <div className="hint">
          {looksMissing
            ? "The candidate_cards table is not on this project yet. The database setup for this app has not been applied."
            : "The project URL or the browser key in .env.local may be wrong. The app did not receive a usable answer from Supabase."}
        </div>
        <p style={{ marginTop: 14 }}>
          <code>
            {code ? `${code}: ` : ""}
            {message}
          </code>
        </p>
      </div>
    </main>
  );
}

export function EmptyState() {
  return (
    <main className="shell">
      <div className="state state--empty">
        <span className="state-badge">Board is clear</span>
        <h1>No candidates on the board</h1>
        <p>
          The board connected and the table is there, but it has no live
          candidates. Every card is archived, or the desk has not loaded its
          list yet.
        </p>
        <div className="hint">
          This is the empty state, not a connection problem. New candidates
          will appear here as soon as they are added.
        </div>
      </div>
    </main>
  );
}
