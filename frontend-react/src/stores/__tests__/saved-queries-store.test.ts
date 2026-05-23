import { describe, it, expect, beforeEach } from "vitest";
import { useSavedQueriesStore } from "../saved-queries-store";

describe("saved-queries-store", () => {
  beforeEach(() => {
    useSavedQueriesStore.setState({ queries: [] });
  });

  it("should save a query", () => {
    const { saveQuery } = useSavedQueriesStore.getState();
    const id = saveQuery("Test Query", "SELECT 1");
    const state = useSavedQueriesStore.getState();
    expect(state.queries).toHaveLength(1);
    expect(state.queries[0].name).toBe("Test Query");
    expect(state.queries[0].sql).toBe("SELECT 1");
    expect(state.queries[0].favorite).toBe(false);
    expect(id).toBeTruthy();
  });

  it("should rename a query", () => {
    const { saveQuery, renameQuery } = useSavedQueriesStore.getState();
    const id = saveQuery("Old Name", "SELECT 1");
    renameQuery(id, "New Name");
    expect(useSavedQueriesStore.getState().queries[0].name).toBe("New Name");
  });

  it("should delete a query", () => {
    const { saveQuery, deleteQuery } = useSavedQueriesStore.getState();
    const id = saveQuery("To Delete", "SELECT 1");
    expect(useSavedQueriesStore.getState().queries).toHaveLength(1);
    deleteQuery(id);
    expect(useSavedQueriesStore.getState().queries).toHaveLength(0);
  });

  it("should toggle favorite", () => {
    const { saveQuery, toggleFavorite } = useSavedQueriesStore.getState();
    const id = saveQuery("Fav Test", "SELECT 1");
    expect(useSavedQueriesStore.getState().queries[0].favorite).toBe(false);
    toggleFavorite(id);
    expect(useSavedQueriesStore.getState().queries[0].favorite).toBe(true);
    toggleFavorite(id);
    expect(useSavedQueriesStore.getState().queries[0].favorite).toBe(false);
  });

  it("should get favorites only", () => {
    const { saveQuery, toggleFavorite, getFavorites } = useSavedQueriesStore.getState();
    const id1 = saveQuery("Q1", "SELECT 1");
    saveQuery("Q2", "SELECT 2");
    toggleFavorite(id1);
    const favs = getFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0].name).toBe("Q1");
  });

  it("should update query SQL", () => {
    const { saveQuery, updateQuery } = useSavedQueriesStore.getState();
    const id = saveQuery("Q", "SELECT 1");
    updateQuery(id, "SELECT * FROM users");
    expect(useSavedQueriesStore.getState().queries[0].sql).toBe("SELECT * FROM users");
  });
});
