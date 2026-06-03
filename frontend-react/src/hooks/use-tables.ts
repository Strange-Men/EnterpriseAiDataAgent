/** Shared hook for cached database table metadata. */

import { useCallback, useEffect } from "react";
import { useDataStore } from "@/stores/data-store";
import { useTablesQuery } from "@/hooks/use-server-state";

export function useTables() {
  const { tables, setTables, setDbStatus } = useDataStore();
  const query = useTablesQuery();
  const { refetch } = query;
  const reload = useCallback(() => refetch(), [refetch]);

  useEffect(() => {
    if (!query.data) return;
    setTables(query.data);
    setDbStatus("connected");
  }, [query.data, setTables, setDbStatus]);

  useEffect(() => {
    if (query.isError) setDbStatus("error");
  }, [query.isError, setDbStatus]);

  return { tables: query.data ?? tables, reload };
}
