export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/";

  return (
    <main
      style={{
        fontFamily: "system-ui",
        padding: 24,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      <h1>Login</h1>
      <p style={{ color: "#555" }}>
        Enter the shared password to view the list.
      </p>

      <form
        action="/api/login"
        method="post"
        style={{ display: "grid", gap: 10, marginTop: 16 }}
      >
        <input type="hidden" name="next" value={next} />

        <input
          name="password"
          type="password"
          placeholder="Password"
          autoFocus
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            background: "#111",
            color: "white",
            cursor: "pointer",
          }}
        >
          Enter
        </button>
      </form>
    </main>
  );
}
