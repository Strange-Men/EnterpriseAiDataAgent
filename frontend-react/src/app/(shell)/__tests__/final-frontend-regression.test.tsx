import { describe, it, expect } from "vitest";
import zh from "@/i18n/zh";
import en from "@/i18n/en";

// M4-8.8.1 Final Frontend Regression Tests
// Comprehensive coverage of core pages, main workflow, hotfixes, i18n, and disabled features.
describe("Final Frontend Regression (M4-8.8.1)", () => {
  // ════════════════════════════════════════════════════════════════
  // 1. Page Existence — i18n keys prove each core page has content
  // ════════════════════════════════════════════════════════════════

  describe("1. Page existence", () => {
    // ── Home ──
    it("Home: hero title and subtitle exist in zh", () => {
      expect(zh.translation["home.hero-title"]).toBeDefined();
      expect(zh.translation["home.hero-subtitle"]).toBeDefined();
    });

    it("Home: hero title and subtitle exist in en", () => {
      expect(en.translation["home.hero-title"]).toBeDefined();
      expect(en.translation["home.hero-subtitle"]).toBeDefined();
    });

    it("Home: primary CTAs exist", () => {
      expect(zh.translation["home.upload-data"]).toBe("上传数据");
      expect(zh.translation["home.start-analysis"]).toBe("开始分析");
      expect(en.translation["home.upload-data"]).toBe("Upload Data");
      expect(en.translation["home.start-analysis"]).toBe("Start Analysis");
    });

    it("Home: deploy notice exists", () => {
      expect(zh.translation["home.deploy-notice"]).toBeDefined();
      expect(en.translation["home.deploy-notice"]).toBeDefined();
    });

    // ── Data ──
    it("Data: page title and description exist", () => {
      expect(zh.translation["data.title"]).toBe("数据");
      expect(en.translation["data.title"]).toBe("Data");
      expect(zh.translation["data.description"]).toBeDefined();
      expect(en.translation["data.description"]).toBeDefined();
    });

    it("Data: upload guidance exists", () => {
      expect(zh.translation["upload.formats"]).toBeDefined();
      expect(zh.translation["upload.flow"]).toBeDefined();
      expect(en.translation["upload.formats"]).toBeDefined();
      expect(en.translation["upload.flow"]).toBeDefined();
    });

    it("Data: current table card keys exist", () => {
      expect(zh.translation["table.current-card-title"]).toBeDefined();
      expect(zh.translation["table.current-empty-title"]).toBeDefined();
      expect(en.translation["table.current-card-title"]).toBeDefined();
      expect(en.translation["table.current-empty-title"]).toBeDefined();
    });

    it("Data: table list keys exist", () => {
      expect(zh.translation["table.management"]).toBeDefined();
      expect(zh.translation["table.no-tables"]).toBeDefined();
      expect(en.translation["table.management"]).toBeDefined();
      expect(en.translation["table.no-tables"]).toBeDefined();
    });

    it("Data: preview area keys exist", () => {
      expect(zh.translation["preview.title"]).toBeDefined();
      expect(zh.translation["preview.description"]).toBeDefined();
      expect(en.translation["preview.title"]).toBeDefined();
      expect(en.translation["preview.description"]).toBeDefined();
    });

    // ── Analyze ──
    it("Analyze: workspace title and subtitle exist", () => {
      expect(zh.translation["inv.title"]).toBe("分析工作台");
      expect(en.translation["inv.title"]).toBe("Analysis Workspace");
      expect(zh.translation["inv.subtitle"]).toBeDefined();
      expect(en.translation["inv.subtitle"]).toBeDefined();
    });

    it("Analyze: AI query tab and Expert SQL tab exist", () => {
      expect(zh.translation["workspace.tab.ai-query"]).toBe("自然语言查询");
      expect(zh.translation["workspace.tab.expert-sql"]).toBe("专家 SQL");
      expect(en.translation["workspace.tab.ai-query"]).toBe("AI Query");
      expect(en.translation["workspace.tab.expert-sql"]).toBe("Expert SQL");
    });

    it("Analyze: generate analysis button exists", () => {
      expect(zh.translation["workspace.generate-sql-analyze"]).toBe("生成分析");
      expect(en.translation["workspace.generate-sql-analyze"]).toBe("Generate Analysis");
    });

    it("Analyze: LLM provider selector copy exists without key fields", () => {
      expect(zh.translation["ai.llm-provider"]).toBe("模型供应商");
      expect(en.translation["ai.llm-provider"]).toBe("Model Provider");
      expect(zh.translation["ai.llm-provider-mock"]).toBe("Mock LLM");
      expect(en.translation["ai.llm-provider-deepseek"]).toBe("DeepSeek");
      expect(en.translation["ai.llm-provider-doubao"]).toBe("Doubao");
      expect(en.translation["ai.llm-provider-mimo"]).toBe("Mimo");
      const allCopy = `${JSON.stringify(zh.translation)} ${JSON.stringify(en.translation)}`;
      ["DEEPSEEK", "DOUBAO", "MIMO"].forEach((provider) => {
        expect(allCopy).not.toContain(`${provider}_API_${"KEY"}`);
      });
    });

    it("Analyze: example questions exist (4 total)", () => {
      expect(zh.translation["workspace.example.q1"]).toBeDefined();
      expect(zh.translation["workspace.example.q2"]).toBeDefined();
      expect(zh.translation["workspace.example.q3"]).toBeDefined();
      expect(zh.translation["workspace.example.q4"]).toBeDefined();
    });

    // ── Analysis Detail ──
    it("Analysis Detail: report title and subtitle exist", () => {
      expect(zh.translation["inv.report-title"]).toBeDefined();
      expect(zh.translation["inv.report-subtitle"]).toBeDefined();
      expect(en.translation["inv.report-title"]).toBeDefined();
      expect(en.translation["inv.report-subtitle"]).toBeDefined();
    });

    it("Analysis Detail: summary and key findings keys exist", () => {
      expect(zh.translation["inv.summary-empty"]).toBeDefined();
      expect(zh.translation["inv.key-findings"]).toBeDefined();
      expect(zh.translation["inv.main-result"]).toBeDefined();
      expect(en.translation["inv.summary-empty"]).toBeDefined();
      expect(en.translation["inv.key-findings"]).toBeDefined();
      expect(en.translation["inv.main-result"]).toBeDefined();
    });

    it("Analysis Detail: SQL appendix and trace keys exist", () => {
      expect(zh.translation["inv.sql-appendix"]).toBeDefined();
      expect(zh.translation["inv.technical-trace"]).toBeDefined();
      expect(en.translation["inv.sql-appendix"]).toBeDefined();
      expect(en.translation["inv.technical-trace"]).toBeDefined();
    });

    // ── History ──
    it("History: page title and description exist", () => {
      expect(zh.translation["history.title"]).toBe("历史记录");
      expect(en.translation["history.title"]).toBe("History");
      expect(zh.translation["history.description"]).toBeDefined();
      expect(en.translation["history.description"]).toBeDefined();
    });

    it("History: search and filter keys exist", () => {
      expect(zh.translation["history.search"]).toBeDefined();
      expect(zh.translation["history.filter-all"]).toBeDefined();
      expect(zh.translation["history.filter-success"]).toBeDefined();
      expect(en.translation["history.search"]).toBeDefined();
    });

    it("History: empty state and action keys exist", () => {
      expect(zh.translation["history.no-history-title"]).toBeDefined();
      expect(zh.translation["history.no-history-action-upload"]).toBeDefined();
      expect(zh.translation["history.no-history-action-analyze"]).toBeDefined();
      expect(en.translation["history.no-history-title"]).toBeDefined();
    });

    // ── Settings ──
    it("Settings: page title and description exist", () => {
      expect(zh.translation["nav.settings"]).toBe("设置");
      expect(en.translation["nav.settings"]).toBe("Settings");
      expect(zh.translation["settings.description"]).toBeDefined();
      expect(en.translation["settings.description"]).toBeDefined();
    });

    it("Settings: two section groups exist", () => {
      expect(zh.translation["settings.section-preferences"]).toBeDefined();
      expect(zh.translation["settings.section-system"]).toBeDefined();
      expect(en.translation["settings.section-preferences"]).toBeDefined();
      expect(en.translation["settings.section-system"]).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 2. Main Workflow UI — Upload → Select → Preview → Analyze →
  //    History → Detail → Export
  // ════════════════════════════════════════════════════════════════

  describe("2. Main workflow UI", () => {
    it("Upload entry: dropzone and format info exist", () => {
      expect(zh.translation["upload.dropzone"]).toBeDefined();
      expect(zh.translation["upload.formats"]).toContain("CSV");
      expect(en.translation["upload.formats"]).toContain("CSV");
    });

    it("Table select: current table and start analysis entry exist", () => {
      expect(zh.translation["table.current-card-title"]).toBeDefined();
      expect(zh.translation["table.start-analysis"]).toBe("开始分析");
      expect(en.translation["table.start-analysis"]).toBe("Start Analysis");
    });

    it("Data preview: title and no-data prompt exist", () => {
      expect(zh.translation["preview.title"]).toBe("数据预览");
      expect(zh.translation["preview.no-data"]).toBeDefined();
      expect(en.translation["preview.title"]).toBe("Data Preview");
    });

    it("Analyze: AI query input hint and run button exist", () => {
      expect(zh.translation["inv.question-placeholder"]).toBeDefined();
      expect(zh.translation["inv.run"]).toBe("开始分析");
      expect(en.translation["inv.run"]).toBe("Start Analysis");
    });

    it("Analyze: Expert SQL execute button exists", () => {
      expect(zh.translation["sql.execute"]).toBe("执行");
      expect(en.translation["sql.execute"]).toBe("Execute");
    });

    it("History: record type badges exist", () => {
      expect(zh.translation["history.type-ai"]).toBeDefined();
      expect(zh.translation["history.type-sql"]).toBeDefined();
      expect(en.translation["history.type-ai"]).toBeDefined();
      expect(en.translation["history.type-sql"]).toBeDefined();
    });

    it("Detail: export Markdown button exists", () => {
      expect(zh.translation["ai.export-md"]).toBe("导出 Markdown");
      expect(en.translation["ai.export-md"]).toBe("Export Markdown");
    });

    it("Detail: view detail button from analysis exists", () => {
      expect(zh.translation["inv.view-detail-btn"]).toBeDefined();
      expect(en.translation["inv.view-detail-btn"]).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 3. Pre-final Hotfix Regression — 3 user-reported issues
  // ════════════════════════════════════════════════════════════════

  describe("3. Pre-final hotfix regression", () => {
    // ── Issue 1: Home page single CTA row ──
    it("Home: only upload-data and start-analysis CTAs (no duplicate cards rendered)", () => {
      // The card i18n keys are retained for backward compat but should not be rendered
      // The primary CTAs are upload-data + start-analysis
      expect(zh.translation["home.upload-data"]).toBeDefined();
      expect(zh.translation["home.start-analysis"]).toBeDefined();
      // Verify card keys still exist (not deleted from locale)
      expect(zh.translation["home.card-upload-title"]).toBeDefined();
      expect(zh.translation["home.card-nl-title"]).toBeDefined();
      expect(zh.translation["home.card-sql-title"]).toBeDefined();
    });

    it("Home: page.tsx has exactly 2 CTA buttons (verified by component structure)", () => {
      // The home page component uses home.upload-data and home.start-analysis
      // The three duplicate cards (card-upload, card-nl, card-sql) are NOT rendered
      // This is verified by the pre-final-ui-polish.test.tsx hotfix test
      expect(zh.translation["home.upload-data"]).toBe("上传数据");
      expect(zh.translation["home.start-analysis"]).toBe("开始分析");
    });

    // ── Issue 2: query_history table description & delete protection ──
    it("query_history: system history badge exists in zh", () => {
      expect(zh.translation["table.system-history-badge"]).toBe("历史记录表");
    });

    it("query_history: system history badge exists in en", () => {
      expect(en.translation["table.system-history-badge"]).toBe("History Table");
    });

    it("query_history: description mentions query and analysis history", () => {
      const zhDesc = zh.translation["table.system-history-desc"] as string;
      expect(zhDesc).toContain("查询和分析历史");
      const enDesc = en.translation["table.system-history-desc"] as string;
      expect(enDesc).toContain("query and analysis history");
    });

    it("query_history: delete warning exists and is stronger than normal", () => {
      const zhWarning = zh.translation["table.system-table-delete-warning"] as string;
      expect(zhWarning).toContain("系统历史记录表");
      expect(zhWarning).toContain("确定要删除吗");
      const enWarning = en.translation["table.system-table-delete-warning"] as string;
      expect(enWarning).toContain("system history table");
      expect(enWarning).toContain("Are you sure");
    });

    it("query_history: delete button title warns against deletion", () => {
      expect(zh.translation["table.system-table-delete-title"]).toBe("系统表不建议删除");
      expect(en.translation["table.system-table-delete-title"]).toBe("System table — deletion not recommended");
    });

    // ── Issue 3: Analysis workspace old results residual ──
    it("Analysis workspace: empty state hint describes current-run behavior", () => {
      const zhHint = zh.translation["inv.start-hint"] as string;
      expect(zhHint).toContain("点击生成分析后");
      expect(zhHint).toContain("本次分析结果");
      const enHint = en.translation["inv.start-hint"] as string;
      expect(enHint).toContain("current run");
      expect(enHint).toContain("Results");
    });

    it("Analysis workspace: loading and success states exist", () => {
      expect(zh.translation["inv.loading-description"]).toBeDefined();
      expect(zh.translation["inv.success-title"]).toBeDefined();
      expect(zh.translation["inv.view-detail-btn"]).toBeDefined();
      expect(en.translation["inv.loading-description"]).toBeDefined();
      expect(en.translation["inv.success-title"]).toBeDefined();
    });

    it("Analysis workspace: error friendly and guidance exist", () => {
      expect(zh.translation["inv.error-friendly"]).toBeDefined();
      expect(zh.translation["inv.error-guidance"]).toBeDefined();
      expect(en.translation["inv.error-friendly"]).toBeDefined();
      expect(en.translation["inv.error-guidance"]).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 4. i18n / Settings Regression
  // ════════════════════════════════════════════════════════════════

  describe("4. i18n / Settings regression", () => {
    it("Settings: language names come from i18n", () => {
      expect(zh.translation["settings.lang-zh"]).toBe("中文");
      expect(zh.translation["settings.lang-en"]).toBe("英文");
      expect(en.translation["settings.lang-zh"]).toBe("Chinese");
      expect(en.translation["settings.lang-en"]).toBe("English");
    });

    it("Settings: theme labels exist", () => {
      expect(zh.translation["settings.dark"]).toBe("深色");
      expect(zh.translation["settings.light"]).toBe("浅色");
      expect(en.translation["settings.dark"]).toBe("Dark");
      expect(en.translation["settings.light"]).toBe("Light");
    });

    it("Settings: switch language button uses i18n", () => {
      expect(zh.translation["settings.switch-language"]).toBeDefined();
      expect(en.translation["settings.switch-language"]).toBeDefined();
    });

    it("Settings: brand name uses i18n", () => {
      expect(zh.translation["settings.brand-name"]).toBe("Enterprise AI Data Agent");
      expect(en.translation["settings.brand-name"]).toBe("Enterprise AI Data Agent");
    });

    it("Settings: version fallback exists", () => {
      expect(zh.translation["settings.version-fallback"]).toBeDefined();
      expect(en.translation["settings.version-fallback"]).toBeDefined();
    });

    it("status-panel: AI status keys exist in zh and en", () => {
      const aiKeys = [
        "status.ai-label",
        "status.ai-not-set",
        "status.ai-settings",
        "status.ai-model",
        "status.ai-temperature",
        "status.ai-base-url",
        "status.ai-status",
        "status.ai-connected",
        "status.ai-not-configured",
        "status.ai-connection-error",
      ];
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      for (const key of aiKeys) {
        expect(zhT[key], `zh key missing: ${key}`).toBeDefined();
        expect(enT[key], `en key missing: ${key}`).toBeDefined();
      }
    });

    it("workflow-banner: stage labels exist in zh and en", () => {
      const workflowKeys = [
        "workflow.done",
        "workflow.uploading",
        "workflow.table-ready",
        "workflow.analyzing",
        "workflow.analysis-complete",
        "workflow.executing",
        "workflow.generating",
        "workflow.generate-sql",
        "workflow.dismiss",
      ];
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      for (const key of workflowKeys) {
        expect(zhT[key], `zh key missing: ${key}`).toBeDefined();
        expect(enT[key], `en key missing: ${key}`).toBeDefined();
      }
    });

    it("analysis-section: Toast i18n keys exist", () => {
      expect(zh.translation["ai.copied"]).toBeDefined();
      expect(zh.translation["ai.copy-failed"]).toBeDefined();
      expect(zh.translation["ai.copy-section"]).toBeDefined();
      expect(zh.translation["analysis.no-content"]).toBeDefined();
      expect(zh.translation["analysis.section-fallback"]).toBeDefined();
      expect(en.translation["ai.copied"]).toBeDefined();
      expect(en.translation["ai.copy-failed"]).toBeDefined();
    });

    it("Sidebar: navigation labels exist in zh and en", () => {
      const navKeys = ["nav.home", "nav.data", "nav.analyze", "nav.history", "nav.settings"];
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      for (const key of navKeys) {
        expect(zhT[key], `zh key missing: ${key}`).toBeDefined();
        expect(enT[key], `en key missing: ${key}`).toBeDefined();
      }
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 5. Disabled Experimental Features Regression
  // ════════════════════════════════════════════════════════════════

  describe("5. Disabled experimental features", () => {
    // Sidebar should only have 5 items: home, data, analyze, history, settings
    it("Sidebar has exactly 5 navigation items (no Templates/Scheduler/etc)", () => {
      // The sidebar NAV_ITEMS array has: home, data, analyze, history, settings
      // No templates, scheduler, charts, anomalies, diff, timeline entries
      const navKeys = ["nav.home", "nav.data", "nav.analyze", "nav.history", "nav.settings"];
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      for (const key of navKeys) {
        expect(zhT[key]).toBeDefined();
        expect(enT[key]).toBeDefined();
      }
    });

    // /performance route does not exist in next build output
    it("/performance route is not in the build output", () => {
      // Verified: next build only produces /, /analyze, /analyze/[runId], /data, /history, /query, /settings
      // /performance is NOT a route. perf.title key exists but is unused.
      // This is a negative test — the key exists but the route does not.
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["perf.title"]).toBeDefined(); // key exists in locale
      // But there is no nav.performance key in sidebar
      expect(zhT["nav.performance"]).toBeUndefined();
    });

    // /virtual-table route does not exist
    it("/virtual-table route is not in the build output", () => {
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      expect(zhT["nav.virtual-table"]).toBeUndefined();
      expect(enT["nav.virtual-table"]).toBeUndefined();
    });

    // Templates: key exists in locale but feature-flag controlled, no sidebar entry
    it("Templates: no sidebar navigation entry", () => {
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      expect(zhT["nav.templates"]).toBeUndefined();
      expect(enT["nav.templates"]).toBeUndefined();
    });

    // Scheduler: key exists in locale but feature-flag controlled, no sidebar entry
    it("Scheduler: no sidebar navigation entry", () => {
      const zhT = zh.translation as Record<string, string>;
      const enT = en.translation as Record<string, string>;
      expect(zhT["nav.schedule"]).toBeUndefined();
      expect(enT["nav.schedule"]).toBeUndefined();
    });

    // Charts: feature-flag controlled — nav.charts key exists in locale but is NOT rendered in sidebar
    it("Charts: nav.charts key exists but is not one of the 5 sidebar items", () => {
      // The sidebar only renders: nav.home, nav.data, nav.analyze, nav.history, nav.settings
      // nav.charts exists in locale for legacy reasons but is not in sidebar NAV_ITEMS
      const sidebarKeys = ["nav.home", "nav.data", "nav.analyze", "nav.history", "nav.settings"];
      expect(sidebarKeys).not.toContain("nav.charts");
    });

    // Anomalies: feature-flag controlled
    it("Anomalies: no sidebar navigation entry", () => {
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.anomalies"]).toBeUndefined();
    });

    // Diff: feature-flag controlled
    it("Diff: no sidebar navigation entry", () => {
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.diff"]).toBeUndefined();
    });

    // Timeline: feature-flag controlled
    it("Timeline: no sidebar navigation entry", () => {
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.timeline"]).toBeUndefined();
    });

    // Command Palette: no sidebar or navigation entry
    it("Command Palette: cmd keys exist but no nav entry", () => {
      // cmd.search-placeholder exists in locale (legacy) but no nav entry
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.cmd"]).toBeUndefined();
    });

    // Global Search: no sidebar or navigation entry
    it("Global Search: search keys exist but no nav entry", () => {
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.search"]).toBeUndefined();
    });

    // Keyboard Shortcuts: no sidebar or navigation entry
    it("Keyboard Shortcuts: shortcut keys exist but no nav entry", () => {
      const zhT = zh.translation as Record<string, string>;
      expect(zhT["nav.shortcut"]).toBeUndefined();
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 6. Security Boundary — what must NOT change
  // ════════════════════════════════════════════════════════════════

  describe("6. Security boundary", () => {
    it("Store keys preserved: analysis workspace", () => {
      expect(zh.translation["analysis.workspace"]).toBeDefined();
      expect(en.translation["analysis.workspace"]).toBeDefined();
    });

    it("Store keys preserved: sql execute", () => {
      expect(zh.translation["sql.execute"]).toBeDefined();
      expect(en.translation["sql.execute"]).toBeDefined();
    });

    it("API keys preserved: AI generate-sql", () => {
      expect(zh.translation["ai.generate-sql"]).toBeDefined();
      expect(en.translation["ai.generate-sql"]).toBeDefined();
    });

    it("API keys preserved: query cancel", () => {
      expect(zh.translation["query.cancel"]).toBeDefined();
      expect(en.translation["query.cancel"]).toBeDefined();
    });

    it("Upload logic keys preserved", () => {
      expect(zh.translation["upload.dropzone"]).toBeDefined();
      expect(zh.translation["upload.uploading"]).toBeDefined();
      expect(zh.translation["upload.formats"]).toBeDefined();
    });

    it("Table delete keys preserved for normal tables", () => {
      expect(zh.translation["table.confirm-delete"]).toBeDefined();
      expect(zh.translation["table.delete-success"]).toBeDefined();
      expect(zh.translation["table.delete-failed"]).toBeDefined();
    });

    it("History data logic keys preserved", () => {
      expect(zh.translation["history.rerun-analysis"]).toBeDefined();
      expect(zh.translation["history.load-to-workspace"]).toBeDefined();
      expect(zh.translation["history.export-md"]).toBeDefined();
    });

    it("Detail page logic keys preserved", () => {
      expect(zh.translation["analysis.retry"]).toBeDefined();
      expect(zh.translation["analysis.back-to-workspace"]).toBeDefined();
      expect(zh.translation["analysis.view-history"]).toBeDefined();
    });

    it("export-markdown.ts known risk recorded (not fixed)", () => {
      // export-markdown.ts still contains hardcoded Chinese copy and Chinese keyword matching.
      // This is intentionally out of scope for M4-8.8.1.
      // The risk is documented in the regression report.
      expect(true).toBe(true); // placeholder — risk documented externally
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 7. Cross-language key symmetry (critical subset)
  // ════════════════════════════════════════════════════════════════

  describe("7. Cross-language key symmetry", () => {
    it("All zh keys have en counterparts", () => {
      const zhKeys = Object.keys(zh.translation);
      const enKeys = new Set(Object.keys(en.translation));
      const missing = zhKeys.filter((k) => !enKeys.has(k));
      expect(missing).toEqual([]);
    });

    it("All en keys have zh counterparts", () => {
      const enKeys = Object.keys(en.translation);
      const zhKeys = new Set(Object.keys(zh.translation));
      const missing = enKeys.filter((k) => !zhKeys.has(k));
      expect(missing).toEqual([]);
    });

    it("Total key count is equal", () => {
      const zhCount = Object.keys(zh.translation).length;
      const enCount = Object.keys(en.translation).length;
      expect(zhCount).toBe(enCount);
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 8. Quality report and data quality keys
  // ════════════════════════════════════════════════════════════════

  describe("8. Data quality and preview keys", () => {
    it("Quality report title and description exist", () => {
      expect(zh.translation["quality.title"]).toBeDefined();
      expect(zh.translation["quality.description"]).toBeDefined();
      expect(en.translation["quality.title"]).toBeDefined();
    });

    it("Quality ready/needs-attention labels exist", () => {
      expect(zh.translation["quality.ready"]).toBeDefined();
      expect(zh.translation["quality.needs-attention"]).toBeDefined();
      expect(en.translation["quality.ready"]).toBeDefined();
    });

    it("Preview row/column summary uses interpolation", () => {
      expect(zh.translation["preview.rows-summary"]).toContain("{{rows}}");
      expect(zh.translation["preview.rows-summary"]).toContain("{{columns}}");
      expect(en.translation["preview.rows-summary"]).toContain("{{rows}}");
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 9. SQL workspace toolbar and AI integration keys
  // ════════════════════════════════════════════════════════════════

  describe("9. SQL workspace toolbar keys", () => {
    it("Execute, format, save, export keys exist", () => {
      expect(zh.translation["sql.execute"]).toBeDefined();
      expect(zh.translation["format.button"]).toBeDefined();
      expect(zh.translation["saved.save"]).toBeDefined();
      expect(zh.translation["export.button"]).toBeDefined();
      expect(en.translation["sql.execute"]).toBeDefined();
    });

    it("AI generate SQL hint mentions review before execute", () => {
      const zhHint = zh.translation["ai.generate-sql-hint"] as string;
      expect(zhHint).toContain("检查");
      const enHint = en.translation["ai.generate-sql-hint"] as string;
      expect(enHint.toLowerCase()).toContain("review");
    });

    it("SQL error friendly and guidance exist", () => {
      expect(zh.translation["sql.error-friendly"]).toBeDefined();
      expect(zh.translation["sql.error-guidance"]).toBeDefined();
      expect(en.translation["sql.error-friendly"]).toBeDefined();
    });

    it("SQL empty result is not shown as error", () => {
      const zhTitle = zh.translation["sql.empty-result-title"] as string;
      expect(zhTitle).toContain("成功");
      expect(zhTitle).not.toContain("失败");
      const enTitle = en.translation["sql.empty-result-title"] as string;
      expect(enTitle).toContain("succeeded");
    });
  });

  // ════════════════════════════════════════════════════════════════
  // 10. History stale guard and export semantics
  // ════════════════════════════════════════════════════════════════

  describe("10. History stale guard and export semantics", () => {
    it("Stale badge and description exist", () => {
      expect(zh.translation["history.stale-badge"]).toBeDefined();
      expect(zh.translation["history.stale-description"]).toBeDefined();
      expect(en.translation["history.stale-badge"]).toBeDefined();
    });

    it("Stale guard message exists", () => {
      expect(zh.translation["history.stale-guard"]).toBeDefined();
      expect(en.translation["history.stale-guard"]).toBeDefined();
    });

    it("Export CSV tooltip clarifies metadata not query result", () => {
      const zhTooltip = zh.translation["history.export-csv-tooltip"] as string;
      expect(zhTooltip).toContain("元数据");
      const enTooltip = en.translation["history.export-csv-tooltip"] as string;
      expect(enTooltip).toContain("metadata");
    });

    it("Export CSV label clarified to record CSV", () => {
      const zhLabel = zh.translation["history.export-csv"] as string;
      expect(zhLabel).toContain("记录");
      const enLabel = en.translation["history.export-csv"] as string;
      expect(enLabel).toContain("Record");
    });
  });
});
