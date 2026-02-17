import { supabaseServer } from "@/lib/supabaseServer";
import { addItem, clearAll, deleteItem, toggleDone } from "@/app/actions/grocery";

export default async function Home() {
  const { data: items } = await supabaseServer
    .from("grocery_items")
    .select("id,text,done,created_at")
    .order("done", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Grocery List</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Shared list (updated by WhatsApp + web)
      </p>

      <form action={addItem} style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <input
          name="text"
          placeholder="Add an item…"
          style={{
            flex: 1,
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
          Add
        </button>
      </form>

      <div style={{ display: "flex", marginTop: 12 }}>
        <form action={clearAll}>
          <button
            type="submit"
            style={{
              marginLeft: "auto",
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              color: "black",
            }}
          >
            Clear all
          </button>
        </form>
      </div>

      <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
        {(items ?? []).map((item) => (
          <li key={item.id} style={{ marginTop: 8 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "white",
                color: "black",
              }}
            >
              <form
                action={async () => {
                  "use server";
                  await toggleDone(item.id, !item.done);
                }}
              >
                <button
                  type="submit"
                  aria-label="Toggle done"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: item.done ? "#e8f5e9" : "white",
                    cursor: "pointer",
                  }}
                >
                  {item.done ? "✅" : "⬜"}
                </button>
              </form>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    textDecoration: item.done ? "line-through" : "none",
                    opacity: item.done ? 0.6 : 1,
                  }}
                >
                  {item.text}
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await deleteItem(item.id);
                }}
              >
                <button
                  type="submit"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ddd",
                    background: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      {(!items || items.length === 0) && (
        <p style={{ color: "#555", marginTop: 16 }}>
          List is empty. Add items here or message the WhatsApp bot.
        </p>
      )}
    </main>
  );
}
