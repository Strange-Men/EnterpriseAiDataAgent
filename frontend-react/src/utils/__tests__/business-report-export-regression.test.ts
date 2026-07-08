import { describe, expect, it } from "vitest";
import { buildBusinessReportHtml, buildBusinessReportMarkdown } from "../business-report-export";
import type { AgentBusinessReport } from "@/services/api";

const report: AgentBusinessReport = {
  executive_summary: "整体经营有收入规模，但退款、体验和渠道质量需要优先关注。",
  recommendations: [
    {
      priority: "high",
      action: "优先排查直播渠道售后问题",
      why: "直播渠道订单多，但退款和投诉压力更高。",
      how: "按品类、商品和退货原因拆解近 7 天退款订单。",
      metrics: ["refund_rate", "complaint_rate", "satisfaction_score"],
      deadline: "建议 1 周内完成初查",
      owner_hint: "运营 / 售后 / 商品负责人",
    },
    {
      priority: "high",
      action: "优先排查直播渠道售后问题",
      why: "重复建议应该被去重。",
      how: "重复建议应该被去重。",
      metrics: ["refund_rate"],
      deadline: "1 周",
      owner_hint: "运营",
    },
    {
      priority: "medium",
      action: "建立每周经营质量复盘",
      why: "需要同时看收入和风险。",
      how: "每周复盘销售、退款、利润和履约指标。",
      metrics: ["sales_amount", "gross_margin_rate"],
      deadline: "本周启动",
      owner_hint: "运营负责人",
    },
    {
      priority: "low",
      action: "观察低风险区域",
      why: "作为对照组。",
      how: "保留监控。",
      metrics: ["sales_amount"],
      deadline: "下月观察",
      owner_hint: "区域负责人",
    },
  ],
  risk_priorities: [
    { risk_name: "字段校验完成：6 个可用，0 个缺失" },
    { risk_name: "直播渠道高收入高风险，需要优先处理" },
    { risk_name: "动态 P90 已识别退款风险对象" },
  ],
  key_findings: ["业务术语映射完成：0 个已映射", "Apparel 重复风险", "Apparel 重复风险"],
  evidence_summary: [
    { summary: "字段校验完成：6 个可用，0 个缺失" },
    { summary: "已按 region 返回 Top/Bottom evidence，impact/severity/confidence 已排序" },
    { summary: "South China 的 refund_rate 和 complaint_rate 高于整体水平。" },
  ],
  limitations: ["campaign_creative 不存在，不能计算 ROI。"],
  next_questions: ["继续看高风险渠道的具体品类。", "生成一周整改计划。"],
};

describe("business report export polish regression", () => {
  it("exports clean Chinese Markdown without system-log evidence and with top 3 deduped recommendations", () => {
    const markdown = buildBusinessReportMarkdown(report, {
      tableName: "demo_sales_business_50k",
      providerStatus: "fallback",
      isSimulated: true,
      fallbackReason: "provider_unavailable_or_mock_fallback",
      language: "zh",
    });

    expect(markdown).toContain("# 业务健康度诊断报告");
    expect(markdown).toContain("## 3. 最优先的 3 条行动建议");
    expect(markdown.match(/### 建议/g)).toHaveLength(3);
    expect(markdown).toContain("直播渠道高收入高风险，需要优先处理");
    expect(markdown).toContain("South China 的退款率和投诉率高于整体水平。");
    expect(markdown).not.toContain("字段校验完成");
    expect(markdown).not.toContain("业务术语映射完成");
    expect(markdown).not.toContain("动态 P90");
    expect(markdown).not.toContain("Top/Bottom evidence");
    expect(markdown).not.toContain("impact/severity/confidence");
    expect(markdown).not.toContain("tool_calls");
    expect(markdown).not.toContain("raw JSON");
    expect(markdown).not.toContain("SELECT ");
  });

  it("exports English Markdown without bare unsupported wording", () => {
    const markdown = buildBusinessReportMarkdown(
      {
        ...report,
        executive_summary: "The business has revenue scale while refund and fulfillment risks need attention.",
        limitations: ["unsupported"],
      },
      { language: "en", providerStatus: "mock", isSimulated: true }
    );

    expect(markdown).toContain("# Business Diagnosis Report");
    expect(markdown).toContain("## 3. Top 3 priority action suggestions");
    expect(markdown).toContain("This is a simulated analysis result");
    expect(markdown.toLowerCase()).not.toContain("\nunsupported");
    expect(markdown).not.toContain("字段校验完成");
  });

  it("keeps HTML structure aligned with Markdown and escapes content", () => {
    const html = buildBusinessReportHtml(
      {
        ...report,
        executive_summary: "<script>alert(1)</script>",
      },
      { language: "en", providerStatus: "live_success", isSimulated: false }
    );

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("Business Diagnosis Report");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});
