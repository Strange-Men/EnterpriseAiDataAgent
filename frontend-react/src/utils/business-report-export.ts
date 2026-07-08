import type { AgentBusinessReport, BusinessReportItem } from "@/services/api";

export interface BusinessReportExportMetadata {
  generatedAt?: Date | string;
  tableName?: string | null;
  requestedProvider?: string | null;
  providerStatus?: string | null;
  isSimulated?: boolean;
  fallbackReason?: string | null;
  language?: string | null;
}

function isEnglish(language: string | null | undefined): boolean {
  return String(language || "").toLowerCase().startsWith("en");
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(stringify).filter(Boolean).join(", ");
  if (isRecord(value)) {
    for (const key of ["summary", "title", "finding", "risk_name", "opportunity", "action", "question", "limitation", "name"]) {
      const text = stringify(value[key]).trim();
      if (text) return text;
    }
    return "";
  }
  return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

const SYSTEM_LOG_PATTERNS = [
  /字段校验完成/i,
  /业务术语映射完成/i,
  /动态\s*p90/i,
  /dynamic\s*p90/i,
  /top\/bottom evidence/i,
  /tool_calls?/i,
  /trace/i,
  /raw json/i,
  /\bsql\b/i,
  /\bimpact\b/i,
  /\bseverity\b/i,
  /\bconfidence\b/i,
  /\bunsupported\b/i,
  /validate_fields/i,
  /map_business_terms/i,
  /business_tool/i,
  /已按.*返回/i,
  /关键业务证据/i,
  /业务影响/i,
  /证据可靠性/i,
];

const FIELD_LABELS_ZH: Record<string, string> = {
  sales_amount: "销售额",
  total_sales: "销售额",
  order_count: "订单数",
  avg_order_value: "客单价",
  refund_amount: "退款金额",
  refund_rate: "退款率",
  return_rate: "退货率",
  gross_margin_rate: "毛利率",
  avg_discount: "平均折扣",
  avg_shipping_days: "平均发货周期",
  shipping_days: "发货周期",
  complaint_rate: "投诉率",
  complaint_count: "投诉量",
  avg_satisfaction_score: "满意度",
  satisfaction_score: "满意度",
  ad_channel: "渠道",
  city_level: "城市等级",
  customer_segment: "客户分层",
};

const FIELD_LABELS_EN: Record<string, string> = {
  sales_amount: "sales",
  total_sales: "sales",
  order_count: "order count",
  avg_order_value: "average order value",
  refund_amount: "refund amount",
  refund_rate: "refund rate",
  return_rate: "return rate",
  gross_margin_rate: "gross margin rate",
  avg_discount: "average discount",
  avg_shipping_days: "average shipping days",
  shipping_days: "shipping days",
  complaint_rate: "complaint rate",
  complaint_count: "complaints",
  avg_satisfaction_score: "satisfaction",
  satisfaction_score: "satisfaction",
  ad_channel: "channel",
  city_level: "city tier",
  customer_segment: "customer segment",
};

function looksLikeSystemLog(text: string): boolean {
  return SYSTEM_LOG_PATTERNS.some((pattern) => pattern.test(text));
}

function humanizeText(value: unknown, language: string | null | undefined): string {
  const english = isEnglish(language);
  let text = stringify(value).replace(/\r?\n/g, " ").trim();
  if (!text) return "";
  const labels = english ? FIELD_LABELS_EN : FIELD_LABELS_ZH;
  for (const [field, label] of Object.entries(labels)) {
    text = text.replaceAll(field, label);
  }
  text = text
    .replace(/provider_unavailable_or_mock_fallback/gi, english ? "the live model did not return successfully and the system switched to a simulated result." : "真实模型未成功返回，已切换为模拟分析结果。")
    .replace(/dynamic\s*p90/gi, english ? "relative high-risk threshold" : "相对高风险水平")
    .replace(/top\/bottom evidence/gi, english ? "top and bottom business evidence" : "关键业务证据")
    .replace(/\bimpact\b/gi, english ? "business impact" : "业务影响")
    .replace(/\bseverity\b/gi, english ? "risk level" : "风险等级")
    .replace(/\bconfidence\b/gi, english ? "evidence reliability" : "证据可靠性")
    .replace(/\bunsupported\b/gi, english ? "The current data does not support this analysis directly." : "当前数据不支持直接分析该问题。");
  if (!english) {
    text = text
      .replace(/\s+(销售额|订单数|客单价|退款金额|退款率|退货率|毛利率|平均折扣|平均发货周期|发货周期|投诉率|投诉量|满意度|渠道|城市等级|客户分层)/g, "$1")
      .replace(/的\s+/g, "的")
      .replace(/\s*和\s*/g, "和")
      .replace(/\s+(高于|低于|明显|需要|存在|形成|较高|较低)/g, "$1");
  }
  return text.replace(/\s+/g, " ").trim();
}

function cleanBusinessText(value: unknown, language: string | null | undefined): string {
  const text = humanizeText(value, language);
  if (!text || looksLikeSystemLog(text)) return "";
  return text.replace(/\s+/g, " ").trim();
}

function uniqueByText<T>(list: T[], getText: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of list) {
    const key = getText(item).toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function textList(value: unknown, language: string | null | undefined): string[] {
  if (Array.isArray(value)) return value.map((item) => cleanBusinessText(item, language)).filter(Boolean);
  const raw = typeof value === "string" ? value.split(/[+,/，、]/) : [value];
  return raw.map((item) => cleanBusinessText(item, language)).filter(Boolean);
}

function recommendation(item: BusinessReportItem, language: string | null | undefined) {
  const english = isEnglish(language);
  if (!isRecord(item)) {
    return {
      priority: "medium",
      action: cleanBusinessText(item, language) || (english ? "Review the highest-priority business risk." : "排查最优先的业务风险"),
      why: "",
      how: "",
      metrics: [] as string[],
      deadline: "",
      ownerHint: "",
    };
  }
  return {
    priority: cleanBusinessText(item.priority || "medium", language),
    action: cleanBusinessText(item.action || item.recommendation || item.title, language) || (english ? "Review the highest-priority business risk." : "排查最优先的业务风险"),
    why: cleanBusinessText(item.why || item.reason, language),
    how: cleanBusinessText(item.how, language),
    metrics: textList(item.metrics || item.monitoring_metric, language),
    deadline: cleanBusinessText(item.deadline || item.expected_action_window, language),
    ownerHint: cleanBusinessText(item.owner_hint || item.owner, language),
  };
}

function safeLine(value: unknown, language?: string | null): string {
  return cleanBusinessText(value, language) || stringify(value).replace(/\r?\n/g, " ").trim();
}

function formatGeneratedAt(value: Date | string | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return stringify(value);
  return date.toLocaleString();
}

function sectionList(sectionItems: BusinessReportItem[], language: string | null | undefined, emptyText: string, max = 5): string {
  const lines = uniqueByText(
    sectionItems
      .map((item) => cleanBusinessText(item, language))
      .filter(Boolean),
    (item) => item
  ).slice(0, max);
  if (lines.length === 0) return `- ${emptyText}`;
  return lines.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function cleanEvidence(sectionItems: BusinessReportItem[], language: string | null | undefined): BusinessReportItem[] {
  const cleaned = sectionItems
    .map((item) => cleanBusinessText(item, language))
    .filter(Boolean)
    .map((summary) => ({ summary }));
  return uniqueByText(cleaned, (item) => String(item.summary)).slice(0, 5);
}

function cleanRecommendations(sectionItems: BusinessReportItem[], language: string | null | undefined): ReturnType<typeof recommendation>[] {
  return uniqueByText(
    sectionItems.map((item) => recommendation(item, language)).filter((item) => item.action),
    (item) => item.action
  ).slice(0, 3);
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
  const english = isEnglish(metadata.language);
  const emptyText = english ? "Not available." : "暂无。";
  const recommendations = cleanRecommendations(items(report.recommendations), metadata.language);
  const risksAndOpportunities = cleanEvidence([...items(report.risk_priorities), ...items(report.opportunities), ...items(report.key_findings)], metadata.language);
  const evidence = cleanEvidence(items(report.evidence_summary), metadata.language);
  const limitations = cleanEvidence(items(report.limitations), metadata.language);
  const nextQuestions = cleanEvidence(items(report.next_questions), metadata.language);
  const providerStatus = metadata.providerStatus || "unknown";
  const fallbackReason = cleanBusinessText(metadata.fallbackReason, metadata.language);
  const simulatedNotice = metadata.isSimulated
    ? english
      ? `> This is a simulated analysis result for reference only. Reason: ${fallbackReason || "the live model did not return successfully and the system switched to a simulated result."}`
      : `> 当前为模拟分析结果，仅供参考。原因：${fallbackReason || "真实模型未成功返回，已切换为模拟分析结果。"}`
    : "";

  const labels = english
    ? {
        title: "# Business Health Diagnosis Report",
        info: "## 1. Report information",
        time: "Generated at",
        table: "Current table",
        provider: "Provider status",
        simulated: "Simulated result",
        yes: "Yes",
        no: "No",
        summary: "## 2. Overall assessment",
        actions: "## 3. Top 3 priority action suggestions",
        actionPrefix: "Suggestion",
        priority: "Priority",
        why: "Why it matters",
        how: "How to do it",
        metrics: "Metrics to watch",
        deadline: "Suggested timeline",
        owner: "Suggested owner",
        risks: "## 4. Main risks and opportunities",
        evidence: "## 5. Key evidence",
        limitations: "## 6. Data limitations",
        next: "## 7. Follow-up questions",
        technical: "## 8. Technical note",
        technicalLine: "SQL, trace, tool calls, and raw JSON are hidden from this exported report.",
      }
    : {
        title: "# 业务健康度诊断报告",
        info: "## 1. 报告信息",
        time: "生成时间",
        table: "当前数据表",
        provider: "Provider 状态",
        simulated: "是否模拟结果",
        yes: "是",
        no: "否",
        summary: "## 2. 总体判断",
        actions: "## 3. 最优先的 3 条行动建议",
        actionPrefix: "建议",
        priority: "优先级",
        why: "为什么重要",
        how: "具体怎么做",
        metrics: "看什么指标",
        deadline: "建议周期",
        owner: "建议负责人",
        risks: "## 4. 主要风险与机会",
        evidence: "## 5. 关键数据依据",
        limitations: "## 6. 数据局限",
        next: "## 7. 下一步可以继续问",
        technical: "## 8. 技术说明",
        technicalLine: "本报告已隐藏 SQL、trace、tool calls 和原始 JSON。",
      };

  const lines = [
    labels.title,
    "",
    labels.info,
    "",
    `- ${labels.time}: ${formatGeneratedAt(metadata.generatedAt)}`,
    `- ${labels.table}: ${safeLine(metadata.tableName || (english ? "Not specified" : "未指定"), metadata.language)}`,
    `- ${labels.provider}: ${safeLine(providerStatus, metadata.language)}`,
    `- ${labels.simulated}: ${metadata.isSimulated ? labels.yes : labels.no}`,
    simulatedNotice,
    "",
    labels.summary,
    "",
    safeLine(report.executive_summary || emptyText, metadata.language),
    "",
    labels.actions,
    "",
  ].filter((line) => line !== "");

  if (recommendations.length === 0) {
    lines.push(`- ${emptyText}`);
  } else {
    recommendations.forEach((rec, index) => {
      lines.push(
        `### ${labels.actionPrefix} ${index + 1}: ${safeLine(rec.action, metadata.language)}`,
        "",
        `- ${labels.priority}: ${safeLine(rec.priority || "medium", metadata.language)}`,
        `- ${labels.why}: ${safeLine(rec.why || (english ? "This recommendation is based on the current business evidence." : "该建议基于当前业务证据。"), metadata.language)}`,
        `- ${labels.how}: ${safeLine(rec.how || (english ? "Review related orders by business object and assign an owner." : "按相关业务对象导出明细并分配负责人排查。"), metadata.language)}`,
        `- ${labels.metrics}: ${rec.metrics.length ? rec.metrics.map((metric) => safeLine(metric, metadata.language)).join(english ? ", " : "、") : (english ? "refund rate, complaint rate, satisfaction, margin" : "退款率、投诉率、满意度、利润率")}`,
        `- ${labels.deadline}: ${safeLine(rec.deadline || (english ? "Complete the first review within 1 week." : "建议 1 周内完成初查"), metadata.language)}`,
        `- ${labels.owner}: ${safeLine(rec.ownerHint || (english ? "Operations / After-sales / Product owner" : "运营 / 售后 / 商品负责人"), metadata.language)}`,
        ""
      );
    });
  }

  lines.push(
    labels.risks,
    "",
    sectionList(risksAndOpportunities, metadata.language, emptyText, 5),
    "",
    labels.evidence,
    "",
    sectionList(evidence, metadata.language, emptyText, 5),
    "",
    labels.limitations,
    "",
    sectionList(limitations, metadata.language, emptyText, 5),
    "",
    labels.next,
    "",
    sectionList(nextQuestions, metadata.language, emptyText, 3),
    "",
    labels.technical,
    "",
    `- ${labels.technicalLine}`,
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

function markdownToSimpleHtml(markdown: string, language: string | null | undefined): string {
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
  const lang = isEnglish(language) ? "en" : "zh-CN";
  const title = isEnglish(language) ? "Business Health Diagnosis Report" : "业务健康度诊断报告";
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
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
  return markdownToSimpleHtml(buildBusinessReportMarkdown(report, metadata), metadata.language);
}
