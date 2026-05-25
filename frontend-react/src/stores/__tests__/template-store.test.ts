import { describe, it, expect, beforeEach } from "vitest";
import { useTemplateStore } from "../template-store";

describe("template-store", () => {
  beforeEach(() => {
    useTemplateStore.setState({ templates: [] });
  });

  it("should have empty initial state", () => {
    expect(useTemplateStore.getState().templates).toEqual([]);
  });

  it("should add a template", () => {
    const { addTemplate } = useTemplateStore.getState();
    const id = addTemplate(
      "Revenue Analysis",
      "Analyze revenue trends",
      [{ question: "What is total revenue?", mode: "explain", order: 1 }],
      "run-123",
      "sales"
    );
    const state = useTemplateStore.getState();
    expect(state.templates).toHaveLength(1);
    expect(state.templates[0].id).toBe(id);
    expect(state.templates[0].name).toBe("Revenue Analysis");
    expect(state.templates[0].steps).toHaveLength(1);
    expect(state.templates[0].sourceRunId).toBe("run-123");
    expect(state.templates[0].sourceTable).toBe("sales");
  });

  it("should add template with multiple steps", () => {
    const { addTemplate } = useTemplateStore.getState();
    addTemplate("Multi-step", "desc", [
      { question: "Q1", mode: "explain", order: 1 },
      { question: "Q2", mode: "insights", order: 2 },
      { question: "Q3", mode: "autonomous", order: 3 },
    ], "run-1", "table");
    const tpl = useTemplateStore.getState().templates[0];
    expect(tpl.steps).toHaveLength(3);
    expect(tpl.steps[1].mode).toBe("insights");
  });

  it("should delete a template", () => {
    const { addTemplate, deleteTemplate } = useTemplateStore.getState();
    const id = addTemplate("Test", "", [], "r1", "t");
    expect(useTemplateStore.getState().templates).toHaveLength(1);
    deleteTemplate(id);
    expect(useTemplateStore.getState().templates).toHaveLength(0);
  });

  it("should get template by id", () => {
    const { addTemplate, getTemplate } = useTemplateStore.getState();
    const id = addTemplate("Test", "desc", [], "r1", "t");
    const tpl = getTemplate(id);
    expect(tpl).toBeTruthy();
    expect(tpl!.name).toBe("Test");
    expect(getTemplate("nonexistent")).toBeNull();
  });

  it("should update template", () => {
    const { addTemplate, updateTemplate } = useTemplateStore.getState();
    const id = addTemplate("Old Name", "old desc", [], "r1", "t");
    updateTemplate(id, { name: "New Name", description: "new desc" });
    const tpl = useTemplateStore.getState().templates[0];
    expect(tpl.name).toBe("New Name");
    expect(tpl.description).toBe("new desc");
  });

  it("should cap at MAX_TEMPLATES (20)", () => {
    const { addTemplate } = useTemplateStore.getState();
    for (let i = 0; i < 25; i++) {
      addTemplate(`Template ${i}`, "", [], `r${i}`, "t");
    }
    expect(useTemplateStore.getState().templates).toHaveLength(20);
    // Newest should be first
    expect(useTemplateStore.getState().templates[0].name).toBe("Template 24");
  });

  it("should preserve createdAt timestamp", () => {
    const { addTemplate } = useTemplateStore.getState();
    addTemplate("Test", "", [], "r1", "t");
    const tpl = useTemplateStore.getState().templates[0];
    expect(tpl.createdAt).toBeTruthy();
    expect(new Date(tpl.createdAt).getTime()).toBeGreaterThan(0);
  });
});
