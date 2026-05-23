import { describe, it, expect, beforeEach } from "vitest";
import { useWorkspaceStore } from "../workspace-store";

describe("workspace-store", () => {
  beforeEach(() => {
    useWorkspaceStore.setState({
      language: "en",
      layout: "default",
      collapsedPanels: { left: false, center: false, right: false },
    });
    // Clear localStorage mock
    localStorage.clear();
  });

  it("should have correct initial state", () => {
    const state = useWorkspaceStore.getState();
    expect(state.language).toBe("en");
    expect(state.layout).toBe("default");
    expect(state.collapsedPanels).toEqual({ left: false, center: false, right: false });
  });

  it("should set language", () => {
    const { setLanguage } = useWorkspaceStore.getState();
    setLanguage("zh");
    expect(useWorkspaceStore.getState().language).toBe("zh");
    setLanguage("en");
    expect(useWorkspaceStore.getState().language).toBe("en");
  });

  it("should set layout", () => {
    const { setLayout } = useWorkspaceStore.getState();
    setLayout("left-wide");
    expect(useWorkspaceStore.getState().layout).toBe("left-wide");
    setLayout("center-focus");
    expect(useWorkspaceStore.getState().layout).toBe("center-focus");
  });

  it("should toggle panel", () => {
    const { togglePanel } = useWorkspaceStore.getState();
    expect(useWorkspaceStore.getState().collapsedPanels.left).toBe(false);
    togglePanel("left");
    expect(useWorkspaceStore.getState().collapsedPanels.left).toBe(true);
    togglePanel("left");
    expect(useWorkspaceStore.getState().collapsedPanels.left).toBe(false);
  });

  it("should toggle multiple panels independently", () => {
    const { togglePanel } = useWorkspaceStore.getState();
    togglePanel("left");
    togglePanel("right");
    const panels = useWorkspaceStore.getState().collapsedPanels;
    expect(panels.left).toBe(true);
    expect(panels.center).toBe(false);
    expect(panels.right).toBe(true);
  });

  it("should set panel collapsed state directly", () => {
    const { setPanelCollapsed } = useWorkspaceStore.getState();
    setPanelCollapsed("center", true);
    expect(useWorkspaceStore.getState().collapsedPanels.center).toBe(true);
    setPanelCollapsed("center", false);
    expect(useWorkspaceStore.getState().collapsedPanels.center).toBe(false);
  });

  it("should not affect other panels when setting one panel", () => {
    const { setPanelCollapsed } = useWorkspaceStore.getState();
    setPanelCollapsed("left", true);
    const panels = useWorkspaceStore.getState().collapsedPanels;
    expect(panels.left).toBe(true);
    expect(panels.center).toBe(false);
    expect(panels.right).toBe(false);
  });
});
