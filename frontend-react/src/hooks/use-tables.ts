/** Shared hook for loading database tables. Eliminates duplicated loadTables across panels. */

import { useCallback, useEffect } from "react";
import { useDataStore } from "@/stores/data-store";
import { fetchTables } from "@/services/api";

export function useTables() {
  const { tables, setTables, setDbStatus } = useDataStore();

  const loadTables = useCallback(async () => {
    try {
      const tbls = await fetchTables();
      setTables(tbls);
      setDbStatus("connected");
    } catch {
      setDbStatus("error");
    }
  }, [setTables, setDbStatus]);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  return { tables, reload: loadTables };
}
