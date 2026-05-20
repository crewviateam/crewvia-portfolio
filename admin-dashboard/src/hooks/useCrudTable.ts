/**
 * src/hooks/useCrudTable.ts
 * Generic CRUD hook for any Supabase table.
 * Handles: fetch, optimistic state, create, update, delete, redeploy trigger.
 *
 * FIX: Chain .order() inline (not on a stored reference) to avoid Supabase JS
 * silent no-op on deferred builder assignment.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase, triggerRedeploy } from "../lib/supabase";

export interface CrudState<T> {
  rows:      T[];
  loading:   boolean;
  saving:    boolean;
  deploying: boolean;
  error:     string;
  success:   string;
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
  const [success,   setSuccess]   = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");

    // ✅ FIX: Chain .order() inline — never split the builder across statements.
    // Storing the builder in a variable then calling .order() is a no-op in
    // @supabase/supabase-js v2+ because the builder is a thenable and calling
    // methods after assignment doesn't mutate the original query.
    const { data, error: e } = orderBy
      ? await supabase.from(table).select("*").order(orderBy, { ascending: true })
      : await supabase.from(table).select("*");

    if (e) {
      console.error(`[useCrudTable] fetch error on table "${table}":`, e);
      setError(e.message);
    } else {
      setRows((data ?? []) as T[]);
    }
    setLoading(false);
  }, [table, orderBy]);

  useEffect(() => { fetch(); }, [fetch]);

  const deploy = async (): Promise<void> => {
    setDeploying(true);
    setSuccess("");
    const ok = await triggerRedeploy();
    if (ok) {
      setSuccess("Saved ✓  Redeploy triggered — live site will update in ~60s");
    } else {
      // Deploy hook not configured or CORS-blocked — not a data error, just inform
      setSuccess("Saved ✓  (Set VITE_DEPLOY_HOOK_URL to auto-deploy)");
    }
    setDeploying(false);
  };

  const save = async (row: Partial<T> & { id?: string }): Promise<boolean> => {
    setSaving(true);
    setError("");
    setSuccess("");
    let ok = false;

    if (row.id) {
      // Update existing row
      const { error: e } = await supabase.from(table).update(row).eq("id", row.id);
      if (e) {
        console.error(`[useCrudTable] update error on table "${table}":`, e);
        setError(e.message);
      } else {
        ok = true;
      }
    } else {
      // Insert new row
      const { error: e } = await supabase.from(table).insert(row);
      if (e) {
        console.error(`[useCrudTable] insert error on table "${table}":`, e);
        setError(e.message);
      } else {
        ok = true;
      }
    }

    if (ok) {
      await fetch();   // refresh local state from Supabase
      await deploy();  // trigger Vercel rebuild
    }
    setSaving(false);
    return ok;
  };

  const remove = async (id: string): Promise<boolean> => {
    setSaving(true);
    setError("");
    setSuccess("");
    const { error: e } = await supabase.from(table).delete().eq("id", id);
    const ok = !e;
    if (e) {
      console.error(`[useCrudTable] delete error on table "${table}":`, e);
      setError(e.message);
    }
    if (ok) {
      await fetch();
      await deploy();
    }
    setSaving(false);
    return ok;
  };

  return { rows, loading, saving, deploying, error, success, fetch, save, remove };
}
