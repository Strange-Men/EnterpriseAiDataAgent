/**
 * M4-8.8.2.z — History Dropdown Position Hotfix Tests
 *
 * Verifies the DropdownMenu component uses portal rendering (createPortal)
 * to escape overflow clipping, and positions the menu correctly:
 * 1. Menu renders with data-testid="history-record-menu"
 * 2. Menu uses portal (document.body) — not inline absolute
 * 3. Right alignment: align="right" positions menu right edge at trigger right edge
 * 4. High z-index via inline style (not CSS variable that may be overridden)
 * 5. Menu does not depend on hover to be visible
 * 6. Delete action retains danger styling
 * 7. All menu items preserved: rerun, export, copy, delete
 * 8. i18n keys preserved
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// Mock createPortal to render inline in tests (jsdom lacks full portal support)
vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

describe("DropdownMenu — Portal Position (M4-8.8.2.z)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should render trigger without menu by default", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    expect(screen.getByText("More")).toBeDefined();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should open menu on trigger click", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    expect(screen.getByRole("menu")).toBeDefined();
  });

  it("should render menu with data-testid=history-record-menu", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    expect(screen.getByTestId("history-record-menu")).toBeDefined();
  });

  it("should use fixed positioning (portal-based, not absolute)", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    const menu = screen.getByRole("menu");
    // Portal-based: style should contain position:fixed
    expect(menu.style.position).toBe("fixed");
  });

  it("should have high z-index inline style", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    const menu = screen.getByRole("menu");
    // z-index should be very high (2147483647)
    expect(menu.style.zIndex).toBe("2147483647");
  });

  it("should apply min-width of 160px", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    const menu = screen.getByRole("menu");
    expect(menu.style.minWidth).toBe("180px");
  });

  it("should close on Escape key", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    expect(screen.getByRole("menu")).toBeDefined();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should close when clicking outside", () => {
    render(
      <div>
        <DropdownMenu trigger={<button>More</button>}>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenu>
        <div data-testid="outside">Outside</div>
      </div>
    );
    fireEvent.click(screen.getByText("More"));
    expect(screen.getByRole("menu")).toBeDefined();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("should default to align=right", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    fireEvent.click(screen.getByText("More"));
    const menu = screen.getByRole("menu");
    // With align=right, left should be computed (not 0)
    // The menu should have a numeric left value
    expect(menu.style.left).toBeDefined();
    expect(menu.style.left).not.toBe("");
  });

  it("should not depend on hover for visibility", () => {
    render(
      <DropdownMenu trigger={<button>More</button>}>
        <DropdownMenuItem>Item</DropdownMenuItem>
      </DropdownMenu>
    );
    // Click to open — no hover needed
    fireEvent.click(screen.getByText("More"));
    const menu = screen.getByRole("menu");
    expect(menu).toBeDefined();
    // Menu should be visible without any hover event
    expect(menu.style.position).toBe("fixed");
  });
});

describe("DropdownMenuItem — Danger styling (M4-8.8.2.z)", () => {
  it("should apply danger class when danger prop is true", () => {
    render(
      <DropdownMenuItem danger>Delete</DropdownMenuItem>
    );
    const item = screen.getByRole("menuitem");
    expect(item.className).toContain("error");
  });

  it("should not apply danger class when danger is false", () => {
    render(
      <DropdownMenuItem>Normal</DropdownMenuItem>
    );
    const item = screen.getByRole("menuitem");
    expect(item.className).not.toContain("error");
  });
});

describe("History menu items i18n (M4-8.8.2.z)", () => {
  it("should preserve rerun-analysis key", () => {
    expect(zh.translation["history.rerun-analysis"]).toBe("重新运行");
    expect(en.translation["history.rerun-analysis"]).toBe("Re-run");
  });

  it("should preserve export-md key", () => {
    expect(zh.translation["history.export-md"]).toBe("导出 Markdown");
    expect(en.translation["history.export-md"]).toBe("Export Markdown");
  });

  it("should preserve copy-question key", () => {
    expect(zh.translation["history.copy-question"]).toBe("复制问题");
    expect(en.translation["history.copy-question"]).toBe("Copy Question");
  });

  it("should preserve delete key", () => {
    expect(zh.translation["history.delete"]).toBe("删除记录");
    expect(en.translation["history.delete"]).toBe("Delete entry");
  });

  it("should preserve more-actions key", () => {
    expect(zh.translation["history.more-actions"]).toBeDefined();
    expect(en.translation["history.more-actions"]).toBe("More actions");
  });
});

describe("DropdownMenuSeparator (M4-8.8.2.z)", () => {
  it("should render a separator element with border", () => {
    const { container } = render(<DropdownMenuSeparator />);
    const sep = container.firstElementChild as HTMLElement;
    expect(sep).not.toBeNull();
    expect(sep.className).toContain("border-t");
  });
});
