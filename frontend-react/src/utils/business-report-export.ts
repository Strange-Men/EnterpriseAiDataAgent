import type { AgentBusinessReport, BusinessReportItem } from "@/services/api";

export interface BusinessReportExportMetadata {
  generatedAt?: Date | string;
  tableName?: string | null;
  requestedProvider?: string | null;
  providerStatus?: string | null;
  isSimulated?: boolean;
  fallbackReason?: string | null;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function items(value: unknown): BusinessReportItem[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is BusinessReportItem => {
      const type = typeof item;
      return item !== null && (type === "string" || type === "number" || type === "boolean" || type === "object");
    });
  }
  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean" || (value && type === "object")) {
    return [value as BusinessReportItem];
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function itemTitle(item: BusinessReportItem): string {
  if (!isRecord(item)) return stringify(item);
  for (const key of ["title", "summary", "finding", "risk_name", "opportunity", "action", "question", "limitation", "name"]) {
    const text = stringify(item[key]).trim();
    if (text) return text;
  }
  return Object.entries(item)
    .slice(0, 3)
    .map(([key, value]) => `${key}: ${stringify(value)}`)
    .join("; ");
}

function textList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => stringify(item).trim()).filter(Boolean);
  const text = stringify(value).trim();
  return text ? [text] : [];
}

function recommendation(item: BusinessReportItem) {
  if (!isRecord(item)) {
    return {
      priority: "medium",
      action: stringify(item) || "排查重点业务风险",
      why: "",
      how: "",
      metrics: [] as string[],
      deadline: "",
      ownerHint: "",
    };
  }
  return {
    priority: stringify(item.priority || "medium"),
    action: stringify(item.action || item.recommendation || item.title || "排查重点业务风险"),
    why: stringify(item.why || item.reason || ""),
    how: stringify(item.how || ""),
    metrics: textList(item.metrics || item.monitoring_metric),
    deadline: stringify(item.deadline || item.expected_action_window || ""),
    ownerHint: stringify(item.owner_hint || item.owner || ""),
  };
}

function safeLine(value: unknown): string {
  return stringify(value).replace(/\r?\n/g, " ").trim();
}

function formatGeneratedAt(value: Date | string | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return stringify(value);
  return date.toLocaleString();
}

function sectionList(sectionItems: BusinessReportItem[]): string {
  if (sectionItems.length === 0) return "- 暂无。";
  return sectionItems.map((item, index) => `${index + 1}. ${safeLine(itemTitle(item))}`).join("\n");
}

function evidenceList(sectionItems: BusinessReportItem[]): string {
  if (sectionItems.length === 0) return "- 暂无。";
  return sectionItems.map((item, index) => `${index + 1}. ${safeLine(itemTitle(item))}`).join("\n");
}

export function businessReportFilename(extension: "md" | "html", now = new Date()): string {
  const pad = (num: number) => String(num).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  return `business-report-${stamp}.${extension}`;
}

export function buildBusinessReportMarkdown(
  report: AgentBusinessReport,
  metadata: BusinessReportExportMetadata = {}
): string {
  const recommendations = items(report.recommendations);
  const risksAndOpportunities = [...items(report.risk_priorities), ...items(report.opportunities), ...items(report.key_findings)];
  const evidence = items(report.evidence_summary);
  const limitations = items(report.limitations);
  const nextQuestions = items(report.next_questions);
  const providerStatus = metadata.providerStatus || "unknown";
  const simulatedNotice = metadata.isSimulated
    ? [
        "",
        "> 当前结果为模拟分析，仅供参考。",
        metadata.fallbackReason ? `> 兜底原因：${safeLine(metadata.fallbackReason)}` : "",
      ].filter(Boolean).join("\n")
    : "";

  const lines = [
    "# 业务健康度诊断报告",
    "",
    "## 1. 报告信息",
    "",
    `- 生成时间：${formatGeneratedAt(metadata.generatedAt)}`,
    `- 当前数据表：${safeLine(metadata.tableName || "未指定")}`,
    `- Provider 状态：${safeLine(providerStatus)}`,
    `- 是否模拟结果：${metadata.isSimulated ? "是" : "否"}`,
    metadata.fallbackReason ? `- fallback_reason：${safeLine(metadata.fallbackReason)}` : "",
    simulatedNotice,
    "",
    "## 2. 总体判断",
    "",
    safeLine(report.executive_summary || "暂无总体判断。"),
    "",
    "## 3. 优先行动建议",
    "",
  ].filter((line) => line !== "");

  if (recommendations.length === 0) {
    lines.push("- 暂无。");
  } else {
    recommendations.forEach((item, index) => {
      const rec = recommendation(item);
      lines.push(
        `### 建议 ${index + 1}：${safeLine(rec.action)}`,
        "",
        `- 优先级：${safeLine(rec.priority)}`,
        `- 为什么重要：${safeLine(rec.why || "当前报告未提供详细原因。")}`,
        `- 具体怎么做：${safeLine(rec.how || "先按相关业务对象导出明细，再分组排查。")}`,
        `- 看什么指标：${rec.metrics.length ? rec.metrics.map(safeLine).join("、") : "退款率、投诉率、满意度、利润率"}`,
        `- 建议周期：${safeLine(rec.deadline || "建议 1 周内完成初查")}`,
        `- 建议负责人：${safeLine(rec.ownerHint || "运营 / 售后 / 商品负责人")}`,
        ""
      );
    });
  }

  lines.push(
    "## 4. 主要风险与机会",
    "",
    sectionList(risksAndOpportunities),
    "",
    "## 5. 关键原因解释",
    "",
    sectionList(items(report.key_findings)),
    "",
    "## 6. 关键数据依据",
    "",
    evidenceList(evidence),
    "",
    "## 7. 数据局限",
    "",
    sectionList(limitations),
    "",
    "## 8. 下一步可以继续问",
    "",
    sectionList(nextQuestions),
    "",
    "## 9. 技术说明",
    "",
    "- SQL、trace、tool calls 等技术细节未包含在导出报告中。",
    "- 如需排查，可在系统内展开技术细节查看。",
    ""
  );

  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function markdownToSimpleHtml(markdown: string): string {
  const body = markdown
    .split(/\r?\n/)
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${escapeHtml(line.slice(2))}</h1>`;
      if (line.startsWith("## ")) return `<h2>${escapeHtml(line.slice(3))}</h2>`;
      if (line.startsWith("### ")) return `<h3>${escapeHtml(line.slice(4))}</h3>`;
      if (line.startsWith("- ")) return `<li>${escapeHtml(line.slice(2))}</li>`;
      if (/^\d+\.\s/.test(line)) return `<p>${escapeHtml(line)}</p>`;
      if (line.startsWith("> ")) return `<blockquote>${escapeHtml(line.slice(2))}</blockquote>`;
      if (!line.trim()) return "";
      return `<p>${escapeHtml(line)}</p>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>业务健康度诊断报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 880px; margin: 40px auto; padding: 0 24px; line-height: 1.72; color: #172033; background: #fff; }
    h1 { font-size: 28px; margin-bottom: 24px; }
    h2 { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 20px; }
    h3 { margin-top: 20px; font-size: 16px; }
    li { margin: 6px 0; }
    blockquote { margin: 12px 0; padding: 10px 14px; border-left: 4px solid #f59e0b; background: #fff7ed; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export function buildBusinessReportHtml(
  report: AgentBusinessReport,
  metadata: BusinessReportExportMetadata = {}
): string {
  return markdownToSimpleHtml(buildBusinessReportMarkdown(report, metadata));
}
