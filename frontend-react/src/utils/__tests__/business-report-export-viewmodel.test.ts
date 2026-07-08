import { describe, expect, it } from "vitest";
import { buildBusinessReportHtml, buildBusinessReportMarkdown } from "../business-report-export";
import type { BusinessReportViewModel } from "@/services/api";

const viewModelZh: BusinessReportViewModel = {
  title: "业务健康度诊断报告",
  locale: "zh-CN",
  provider_notice: {
    type: "mock",
    title: "演示模式",
    message: "当前为演示模式结果，适合产品演示，不代表真实模型回答。",
  },
  is_simulated: true,
  overall_assessment: "整体经营具备收入规模，但退款和体验风险需要优先关注。",
  priority_actions: [
    {
      priority: "high",
      action: "优先排查直播渠道售后问题",
      why: "直播渠道订单多，但退款和投诉压力更高。",
      how: "按品类、商品和退货原因拆解近 7 天退款订单。",
      metrics: ["退款率", "投诉率", "满意度"],
      deadline: "建议 1 周内完成初查",
      owner_hint: "运营 / 售后 / 商品负责人",
    },
    {
      priority: "medium",
      action: "建立每周经营质量复盘",
      why: "需要同时看收入和风险。",
      how: "每周复盘销售、退款、利润和履约指标。",
      metrics: ["销售额", "毛利率"],
      deadline: "本周启动",
      owner_hint: "运营负责人",
    },
  ],
  risks_and_opportunities: ["机会对象：East China。为什么是机会：销售规模较大且满意度相对健康。"],
  key_evidence: ["South China 的退款率和投诉率高于整体水平。"],
  limitations: ["缺少广告花费字段，不能直接计算 ROI。"],
  next_questions: ["继续看高风险渠道的具体品类。"],
  technical_note: "本报告已隐藏 SQL、trace、tool calls 和原始 JSON。",
  data_table: null,
};

const viewModelEn: BusinessReportViewModel = {
  title: "Business Diagnosis Report",
  locale: "en-US",
  provider_notice: {
    type: "fallback",
    title: "Model fallback result",
    message: "Model fallback result. The live model did not return successfully, so the system switched to a simulated analysis result.",
  },
  is_simulated: true,
  overall_assessment: "The business has revenue scale, while refund and fulfillment risks need attention.",
  priority_actions: [
    {
      priority: "high",
      action: "Audit after-sales issues in the live-stream channel.",
      why: "The channel has meaningful orders but weaker refund and complaint indicators.",
      how: "Break recent refunds down by category, product, and return reason.",
      metrics: ["refund rate", "complaint rate", "satisfaction"],
      deadline: "Complete the first review within 1 week.",
      owner_hint: "Operations / After-sales / Product owner",
    },
  ],
  risks_and_opportunities: ["Opportunity: East China. Why it matters: it has meaningful sales volume with healthier refund indicators."],
  key_evidence: ["South China has higher refund and complaint pressure than the overall business."],
  limitations: ["Missing required fields: campaign_creative and ad_spend."],
  next_questions: ["Should we turn these actions into a one-week checklist?"],
  technical_note: "This report hides SQL, trace, tool calls, and raw JSON.",
  data_table: null,
};

describe("BusinessReportViewModel export", () => {
  it("uses the Chinese ViewModel and excludes technical objects", () => {
    const markdown = buildBusinessReportMarkdown(viewModelZh, {
      tableName: "demo_sales_business_50k",
      providerStatus: "mock",
      isSimulated: true,
    });

    expect(markdown).toContain("# 业务健康度诊断报告");
    expect(markdown).toContain("## 3. 最优先的 3 条行动建议");
    expect(markdown).toContain("机会对象：East China");
    expect(markdown.match(/当前为演示模式结果/g)).toHaveLength(1);
    expect(markdown).not.toContain("object_type");
    expect(markdown).not.toContain("score");
    expect(markdown).not.toContain("evidence dict");
    expect(markdown).not.toContain("tool_calls");
    expect(markdown).not.toContain("SELECT ");
  });

  it("uses the English ViewModel without Chinese labels", () => {
    const markdown = buildBusinessReportMarkdown(viewModelEn, {
      tableName: "demo_sales_business_50k",
      providerStatus: "fallback",
      isSimulated: true,
    });

    expect(markdown).toContain("# Business Diagnosis Report");
    expect(markdown).toContain("## 3. Top 3 priority action suggestions");
    expect(markdown).toContain("Model fallback result");
    expect(markdown.match(/Model fallback result/g)?.length).toBeGreaterThanOrEqual(1);
    for (const forbidden of ["退款率", "建议负责人", "具体怎么做", "看什么指标", "建议周期", "暂无", "数据局限", "下一步可以继续问"]) {
      expect(markdown).not.toContain(forbidden);
    }
  });

  it("keeps HTML export aligned with the ViewModel markdown", () => {
    const html = buildBusinessReportHtml(viewModelEn, {
      tableName: "demo_sales_business_50k",
      providerStatus: "live_success",
      isSimulated: false,
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("<html lang=\"en\">");
    expect(html).toContain("Business Diagnosis Report");
    expect(html).not.toContain("tool_calls");
    expect(html).not.toContain("rawRun");
  });
});
