/**
 * src/hooks/useCrudTable.ts
 * Generic CRUD hook for any Supabase table.
 * Handles: fetch, optimistic state, create, update, delete, redeploy trigger.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase, triggerRedeploy } from "../lib/supabase";

export interface CrudState<T> {
  rows:      T[];
  loading:   boolean;
  saving:    boolean;
  deploying: boolean;
  error:     string;
  fetch:     () => Promise<void>;
  save:      (row: Partial<T> & { id?: string }) => Promise<boolean>;
  remove:    (id: string) => Promise<boolean>;
}

export function useCrudTable<T extends { id: string }>(
  table: string,
  orderBy = "sort_order"
): CrudState<T> {
  const [rows,      setRows]      = useState<T[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [error,     setError]     = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    const query = supabase.from(table).select("*");
    if (orderBy) query.order(orderBy, { ascending: true });
    const { data, error: e } = await query;
    if (e) setError(e.message);
    else setRows((data ?? []) as T[]);
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  const deploy = async () => {
    setDeploying(true);
    await triggerRedeploy();
    setDeploying(false);
  };

  const save = async (row: Partial<T> & { id?: string }): Promise<boolean> => {
    setSaving(true);
    setError("");
    let ok = false;

    if (row.id) {
      // Update
      const { error: e } = await supabase.from(table).update(row).eq("id", row.id);
      if (e) { setError(e.message); } else { ok = true; }
    } else {
      // Insert
      const { error: e } = await supabase.from(table).insert(row);
      if (e) { setError(e.message); } else { ok = true; }
    }

    if (ok) { await fetch(); await deploy(); }
    setSaving(false);
    return ok;
  };

  const remove = async (id: string): Promise<boolean> => {
    setSaving(true);
    setError("");
    const { error: e } = await supabase.from(table).delete().eq("id", id);
    const ok = !e;
    if (e) setError(e.message);
    if (ok) { await fetch(); await deploy(); }
    setSaving(false);
    return ok;
  };

  return { rows, loading, saving, deploying, error, fetch, save, remove };
}
