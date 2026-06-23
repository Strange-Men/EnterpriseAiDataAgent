/**
 * Investigation Store — table selection boundary tests (M4-7.2).
 *
 * Covers:
 * - setActiveTable: direct table selection
 * - ensureValidSelectedTable: auto-select / reset on invalid table
 * - localStorage persistence: stale table validation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useInvestigationStore } from "@/stores/investigation-store";

// Reset store between tests
beforeEach(() => {
  useInvestigationStore.getState().clear();
  useInvestigationStore.setState({ activeTable: null });
});

describe("Investigation Store — Table Selection", () => {
  describe("setActiveTable", () => {
    it("should set activeTable to a valid table name", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });

    it("should set activeTable to null", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().setActiveTable(null);
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });

    it("should overwrite existing activeTable", () => {
      useInvestigationStore.getState().setActiveTable("table_a");
      useInvestigationStore.getState().setActiveTable("table_b");
      expect(useInvestigationStore.getState().activeTable).toBe("table_b");
    });
  });

  describe("ensureValidSelectedTable", () => {
    it("should keep activeTable if it exists in available tables", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().ensureValidSelectedTable(["sales_data", "orders"]);
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });

    it("should auto-select first available table if activeTable is invalid", () => {
      useInvestigationStore.getState().setActiveTable("deleted_table");
      useInvestigationStore.getState().ensureValidSelectedTable(["sales_data", "orders"]);
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });

    it("should set activeTable to null if no tables available", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().ensureValidSelectedTable([]);
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });

    it("should auto-select first table if activeTable is null", () => {
      useInvestigationStore.getState().ensureValidSelectedTable(["sales_data", "orders"]);
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });

    it("should handle empty available tables when activeTable is null", () => {
      useInvestigationStore.getState().ensureValidSelectedTable([]);
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });
  });

  describe("advance with table", () => {
    it("should set activeTable via advance", () => {
      useInvestigationStore.getState().advance("analyzing", { table: "sales_data" });
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });

    it("should keep existing activeTable if advance has no table", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().advance("analyzing");
      expect(useInvestigationStore.getState().activeTable).toBe("sales_data");
    });
  });

  describe("setContext with table", () => {
    it("should update activeTable via setContext", () => {
      useInvestigationStore.getState().setContext({ table: "orders" });
      expect(useInvestigationStore.getState().activeTable).toBe("orders");
    });

    it("should set activeTable to null via setContext", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().setContext({ table: null });
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });
  });

  describe("reset and clear", () => {
    it("should reset activeTable on reset()", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().reset();
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });

    it("should clear activeTable on clear()", () => {
      useInvestigationStore.getState().setActiveTable("sales_data");
      useInvestigationStore.getState().clear();
      expect(useInvestigationStore.getState().activeTable).toBeNull();
    });
  });
});
