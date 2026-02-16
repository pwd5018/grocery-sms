import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import twilio from "twilio";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function reply(message: string) {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

async function getOrderedItems() {
  const { data, error } = await supabase
    .from("grocery_items")
    .select("id,text,done,created_at")
    .order("done", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);

  const from = params.get("From") ?? "";
  const allowed = new Set([
    "whatsapp:+18148606181",
  ]);

  if (!allowed.has(from)) {
    return reply("Not authorized.");
  }
  const body = (params.get("Body") ?? "").trim();
  const lower = body.toLowerCase();

  // IMPORTANT: signature validation only works reliably once deployed,
  // because the URL must exactly match the public URL Twilio calls.
  // We'll enable it after deploy.
  const signature = req.headers.get("x-twilio-signature") ?? "";
  const url = req.url;
  const valid = signature
    ? twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        url,
        Object.fromEntries(params.entries())
      )
    : true;

  if (!valid) return new NextResponse("Forbidden", { status: 403 });

  try {
    if (lower === "help") {
        return reply(
        "Commands: list | done N | delete N | delete <name> | clear | (or send items separated by commas/newlines)"
        );
    }

    if (lower === "list" || lower === "show") {
      const items = await getOrderedItems();
      if (!items.length) return reply("List is empty.");

      const lines = items.map(
        (t, i) => `${i + 1}) ${t.text}${t.done ? " ✅" : ""}`
      );
      return reply(lines.join("\n"));
    }

    if (lower.startsWith("done ")) {
      const n = parseInt(lower.slice(5).trim(), 10);
      if (!Number.isFinite(n)) return reply("Usage: done 2");

      const items = await getOrderedItems();
      const target = items[n - 1];
      if (!target) return reply(`No item #${n}. Text 'list'.`);

      const { error } = await supabase
        .from("grocery_items")
        .update({ done: !target.done })
        .eq("id", target.id);

      return reply(
        error
          ? "Error updating item."
          : `${!target.done ? "Done" : "Undone"}: ${target.text}`
      );
    }

if (
  lower === "clear" ||
  lower === "clear all" ||
  lower === "delete all" ||
  lower === "remove all" ||
  lower === "delete everything" ||
  lower === "remove everything"
) {
  // Supabase requires a filter to delete, so we use a dummy condition that matches all rows.
  const { error } = await supabase
    .from("grocery_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  return reply(error ? "Error clearing list." : "Cleared the entire list ✅");
}


if (lower.startsWith("delete ") || lower.startsWith("remove ")) {
  const value = lower
    .replace(/^delete\s+/, "")
    .replace(/^remove\s+/, "")
    .trim();

  // If user says "delete all" (we'll also handle this in the clear section below)
  if (value === "all" || value === "everything") {
    const { error } = await supabase.from("grocery_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    return reply(error ? "Error clearing list." : "Cleared the entire list ✅");
  }

  // First try numeric delete (index)
  const n = parseInt(value, 10);
  const items = await getOrderedItems();

  if (Number.isFinite(n)) {
    const target = items[n - 1];
    if (!target) return reply(`No item #${n}. Text 'list'.`);

    const { error } = await supabase.from("grocery_items").delete().eq("id", target.id);
    return reply(error ? "Error deleting item." : `Deleted: ${target.text}`);
  }

  // Otherwise delete by name (ALL matches, case-insensitive exact match)
  const matches = items.filter((item) => item.text.toLowerCase() === value);

  if (matches.length === 0) {
    return reply(`No item named "${value}". Text 'list'.`);
  }

  const ids = matches.map((m) => m.id);

  const { error } = await supabase.from("grocery_items").delete().in("id", ids);

  if (error) return reply("Error deleting items.");

  return reply(
    matches.length === 1
      ? `Deleted: ${matches[0].text}`
      : `Deleted ${matches.length} items named "${value}".`
  );
}

    // Add items (default)
    const parts = body
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!parts.length) return reply("Nothing to add. Text 'help'.");

    const rows = parts.map((text) => ({ text, done: false, added_by: from }));
    const { error } = await supabase.from("grocery_items").insert(rows);

    return reply(error ? "Error adding items." : `Added: ${parts.join(", ")}`);
  } catch {
    return reply("Unexpected error.");
  }
}
