"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabaseServer";

function normalizeItem(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export async function addItem(formData: FormData) {
  const raw = String(formData.get("text") ?? "");
  const text = normalizeItem(raw);
  if (!text) return;

  // Prevent duplicates (case-insensitive)
  const { data: existing } = await supabaseServer
    .from("grocery_items")
    .select("id,text")
    .ilike("text", text);

  if (existing && existing.length > 0) {
    // Just revalidate so UI updates; later we can show an error message
    revalidatePath("/");
    return;
  }

  await supabaseServer.from("grocery_items").insert({ text, done: false });
  revalidatePath("/");
}

export async function toggleDone(id: string, done: boolean) {
  await supabaseServer.from("grocery_items").update({ done }).eq("id", id);
  revalidatePath("/");
}

export async function deleteItem(id: string) {
  await supabaseServer.from("grocery_items").delete().eq("id", id);
  revalidatePath("/");
}

export async function clearAll() {
  // delete all rows (needs a filter)
  await supabaseServer
    .from("grocery_items")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  revalidatePath("/");
}
