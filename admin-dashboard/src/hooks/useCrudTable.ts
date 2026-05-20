/**
 * src/hooks/useCrudTable.ts — v3
 *
 * Generic CRUD hook for any Supabase table.
 *
 * CHANGE v3: Passes rich MarkDirtyOptions to DeployContext:
 *   - changeKey:     stable "table::id" so editing the same row twice = 1 pending change
 *   - previousValue: captured before save for net-zero detection
 *   - currentValue:  the new row data
 *   - undoFn:        async closure that reverts to the original value in Supabase
 *
 * This means:
 *   - Editing a row twice → 1 entry in DeployBanner (last edit wins)
 *   - Editing a row then reverting → 0 entries, timer cancelled
 *   - Delete can be undone by re-inserting the original row
 *   - Insert can be undone by deleting the new row (using the returned id)
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useDeploy } from "../context/DeployContext";

export interface CrudState<T> {
  rows:    T[];
  loading: boolean;
  saving:  boolean;
  error:   string;
  success: string;
  fetch:   () => Promise<void>;
  save:    (row: Partial<T> & { id?: string }, label?: string) => Promise<boolean>;
  remove:  (id: string, label?: string) => Promise<boolean>;
}

export function useCrudTable<T extends { id: string }>(
  table:   string,
  orderBy = "sort_order"
): CrudState<T> {
  const [rows,    setRows]    = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const { markDirty } = useDeploy();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: e } = orderBy
      ? await supabase.from(table).select("*").order(orderBy, { ascending: true })
      : await supabase.from(table).select("*");
    if (e) { console.error(`[useCrudTable] fetch "${table}":`, e); setError(e.message); }
    else    { setRows((data ?? []) as T[]); }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  // ── save (create or update) ─────────────────────────────────────────────────
  const save = async (
    row:    Partial<T> & { id?: string },
    label = `Updated ${table}`
  ): Promise<boolean> => {
    setSaving(true);
    setError("");
    setSuccess("");
    let ok = false;

    if (row.id) {
      // UPDATE — capture original value for net-zero / undo
      const originalRow = rows.find(r => r.id === row.id) ?? null;
      const capturedId  = row.id;

      const { error: e } = await supabase.from(table).update(row).eq("id", row.id);
      if (e) {
        console.error(`[useCrudTable] update "${table}":`, e);
        setError(e.message);
      } else {
        ok = true;
        await fetch();
        setSuccess("Saved ✓");
        markDirty({
          changeKey:     `${table}::${capturedId}`,
          label,
          previousValue: originalRow,
          currentValue:  row,
          undoFn: async () => {
            if (originalRow) {
              await supabase.from(table).update(originalRow).eq("id", capturedId);
              await fetch();
            }
          },
        });
      }
    } else {
      // INSERT — we don't know the id until after insert
      const { data: inserted, error: e } = await supabase
        .from(table)
        .insert(row)
        .select()
        .single();
      if (e) {
        console.error(`[useCrudTable] insert "${table}":`, e);
        setError(e.message);
      } else {
        ok = true;
        const newId = (inserted as { id: string }).id;
        await fetch();
        setSuccess("Added ✓");
        markDirty({
          changeKey:     `${table}::${newId}::insert`,
          label:         `Added ${table.replace(/_/g, " ")} record`,
          previousValue: null,
          currentValue:  inserted,
          undoFn: async () => {
            await supabase.from(table).delete().eq("id", newId);
            await fetch();
          },
        });
      }
    }

    setSaving(false);
    return ok;
  };

  // ── remove (delete) ─────────────────────────────────────────────────────────
  const remove = async (
    id:    string,
    label = `Deleted ${table.replace(/_/g, " ")} record`
  ): Promise<boolean> => {
    setSaving(true);
    setError("");
    setSuccess("");

    const originalRow = rows.find(r => r.id === id) ?? null;

    const { error: e } = await supabase.from(table).delete().eq("id", id);
    if (e) {
      console.error(`[useCrudTable] delete "${table}":`, e);
      setError(e.message);
      setSaving(false);
      return false;
    }

    await fetch();
    setSuccess("Deleted ✓");
    markDirty({
      changeKey:     `${table}::${id}::delete`,
      label,
      previousValue: originalRow,
      currentValue:  null,
      undoFn: async () => {
        if (originalRow) {
          await supabase.from(table).insert(originalRow);
          await fetch();
        }
      },
    });

    setSaving(false);
    return true;
  };

  return { rows, loading, saving, error, success, fetch, save, remove };
}
