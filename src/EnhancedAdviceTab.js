import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { extractASIN, categorizeASINSearchTerms } from "./asin-utils"; // 导入ASIN工具函数

const EnhancedAdviceTab = ({
  processedData,
  recommendations,
  enhancedRecommendations,
  decisions,
  settings,
  exportToCSV,
  timeComparison,
  funnelAnalysis,
  exportDecisionsToCSV,
}) => {
  const [activeTab, setActiveTab] = useState("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // ASIN分析相关状态
  const [asinData, setAsinData] = useState(null);
  const [selectedAsin, setSelectedAsin] = useState(null);
  const [asinSearchTerm, setAsinSearchTerm] = useState("");

  // 当processedData变化时进行ASIN分类
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      const categorized = categorizeASINSearchTerms(processedData);
      setAsinData(categorized);
    }
  }, [processedData]);

  // 处理ASIN选择
  const handleAsinSelect = (asin) => {
    setSelectedAsin(selectedAsin === asin ? null : asin);
  };

  // 过滤ASIN详情
  const getFilteredAsinDetails = () => {
    if (!asinData) return [];
    return asinData.asinPerformance.asinDetails.filter((asin) =>
      asin.asin.toLowerCase().includes(asinSearchTerm.toLowerCase())
    );
  };

  // 导出ASIN分析
  const handleExportAsinAnalysis = () => {
    if (!asinData) return;

    // 准备导出数据
    const exportData = asinData.asinPerformance.asinDetails.map((asin) => ({
      ASIN: asin.asin,
      搜索次数: asin.searchTerms.length,
      点击量: asin.clicks,
      花费: asin.spend.toFixed(2),
      销售额: asin.sales.toFixed(2),
      订单数: asin.orders,
      ACOS: asin.acos === 999 ? "∞" : asin.acos.toFixed(2) + "%",
      转化率: (asin.conversionRate * 100).toFixed(2) + "%",
    }));

    // 调用导出函数
    exportToCSV(exportData, "asin_analysis_enhanced.csv");
  };

  // 过滤已经选择的类别
  const filterByCategory = (items, category) => {
    if (category === "all") return items;
    return items.filter((item) => {
      // 针对不同类型的数据结构进行过滤
      if (item.category) return item.category === category;

      // 对于增加/减少出价建议使用评分范围过滤
      if (category === "strategicCore" && item.score >= 150) return true;
      if (
        category === "efficientExpansion" &&
        item.score >= 120 &&
        item.score < 150
      )
        return true;
      if (
        category === "stablePerformers" &&
        item.score >= 90 &&
        item.score < 120
      )
        return true;
      if (
        category === "needsOptimization" &&
        item.score >= 70 &&
        item.score < 90
      )
        return true;
      if (category === "testObservation" && item.score >= 50 && item.score < 70)
        return true;
      if (
        category === "strategyAdjustment" &&
        item.score >= 30 &&
        item.score < 50
      )
        return true;

      return false;
    });
  };

  // 过滤搜索词
  const filterBySearchTerm = (items) => {
    if (!searchTerm) return items;
    return items.filter((item) => {
      const termField = item.term || item["Search Term"] || item.word || "";
      return termField.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  // 组合过滤器
  const applyFilters = (items) => {
    return filterBySearchTerm(filterByCategory(items, selectedCategory));
  };

  // 获取漏斗分析数据
  const getFunnelData = () => {
    return [
      { name: "顶部漏斗", value: funnelAnalysis.top.length, color: "#3182ce" },
      {
        name: "中部漏斗",
        value: funnelAnalysis.middle.length,
        color: "#8bc34a",
      },
      {
        name: "底部漏斗",
        value: funnelAnalysis.bottom.length,
        color: "#f6ad55",
      },
    ];
  };

  // 获取时间趋势数据
  const getTrendData = () => {
    const { current, previous, trends } = timeComparison;

    return [
      {
        name: "ACOS",
        current: current.averageAcos || 0,
        previous: previous.averageAcos || 0,
        trend: trends.acosTrend || 0,
      },
      {
        name: "CTR",
        current: current.clickThroughRate ? current.clickThroughRate * 100 : 0,
        previous: previous.clickThroughRate
          ? previous.clickThroughRate * 100
          : 0,
        trend: trends.ctrTrend || 0,
      },
      {
        name: "转化率",
        current: current.conversionRate ? current.conversionRate * 100 : 0,
        previous: previous.conversionRate ? previous.conversionRate * 100 : 0,
        trend: trends.conversionTrend || 0,
      },
      {
        name: "CPC",
        current: current.averageCPC || 0,
        previous: previous.averageCPC || 0,
        trend: trends.cpcTrend || 0,
      },
    ];
  };

  // 渲染概览面板
  const renderSummaryTab = () => {
    return (
      <div className="summary-tab-content">
        <div className="enhanced-stats-grid">
          <div className="stat-card">
            <h3 className="stat-card-title">优化建议摘要</h3>
            <div className="stat-card-content">
              <div className="stat-item">
                <span className="stat-label">战略核心词:</span>
                <span className="stat-value">
                  {enhancedRecommendations.strategicCore.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">高效扩展词:</span>
                <span className="stat-value">
                  {enhancedRecommendations.efficientExpansion.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">稳定表现词:</span>
                <span className="stat-value">
                  {enhancedRecommendations.stablePerformers.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">建议否定词:</span>
                <span className="stat-value">
                  {recommendations.exactNegative.length +
                    recommendations.phraseNegative.length}
                </span>
              </div>
              {asinData && (
                <div className="stat-item">
                  <span className="stat-label">ASIN关键词:</span>
                  <span className="stat-value">
                    {asinData.asinTerms.length}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-card-title">搜索词漏斗分析</h3>
            <div className="chart-container" style={{ height: "180px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getFunnelData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {getFunnelData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} 个搜索词`, "数量"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-card span-2">
            <h3 className="stat-card-title">关键指标时间趋势</h3>
            <div className="chart-container" style={{ height: "180px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTrendData()} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "current" || name === "previous") {
                        return [
                          getTrendData()[0].name === "ACOS" ||
                          getTrendData()[0].name === "CTR" ||
                          getTrendData()[0].name === "转化率"
                            ? `${value.toFixed(2)}%`
                            : `$${value.toFixed(2)}`,
                          name === "current" ? "当前期" : "前一期",
                        ];
                      }
                      return [`${value.toFixed(2)}%`, "变化率"];
                    }}
                  />
                  <Legend
                    formatter={(value) =>
                      value === "current"
                        ? "当前期"
                        : value === "previous"
                        ? "前一期"
                        : "变化率"
                    }
                  />
                  <Bar dataKey="current" fill="#3182ce" name="current" />
                  <Bar dataKey="previous" fill="#a0aec0" name="previous" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => exportDecisionsToCSV(decisions)}
            className="btn btn-primary"
          >
            导出完整优化决策
          </button>
        </div>
      </div>
    );
  };

  // 渲染分类推荐面板
  const renderCategorizedRecommendations = () => {
    return (
      <div className="categorized-tab-content">
        <div className="filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="搜索关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">所有类别</option>
              <option value="strategicCore">战略核心词</option>
              <option value="efficientExpansion">高效扩展词</option>
              <option value="stablePerformers">稳定表现词</option>
              <option value="needsOptimization">需要优化词</option>
              <option value="testObservation">测试观察词</option>
              <option value="strategyAdjustment">策略调整词</option>
            </select>
          </div>
        </div>

        <div className="recommendation-categories">
          {selectedCategory === "all" ||
          selectedCategory === "strategicCore" ? (
            <div className="recommendation-category">
              <h3 className="category-title strategic">战略核心词</h3>
              <p className="category-description">
                高转化、高效率关键词，应增加出价25-35%，创建单独的精确匹配广告组
              </p>
              <div className="recommendation-items">
                {applyFilters(enhancedRecommendations.strategicCore).length >
                0 ? (
                  applyFilters(enhancedRecommendations.strategicCore).map(
                    (term, index) => (
                      <div
                        key={index}
                        className="recommendation-item strategic"
                      >
                        <div className="item-header">
                          <span className="item-term">
                            {term["Search Term"]}
                          </span>
                          <span className="item-score">
                            得分: {term.score.toFixed(0)}
                          </span>
                        </div>
                        <div className="item-metrics">
                          <span className="metric">点击: {term.Clicks}</span>
                          <span className="metric">订单: {term.Orders}</span>
                          <span className="metric">
                            ACOS:{" "}
                            {term.ACOS < 999 ? term.ACOS.toFixed(2) + "%" : "∞"}
                          </span>
                          <span className="metric">
                            支出: ${term.Spend?.toFixed(2)}
                          </span>
                        </div>
                        <div className="item-action">
                          <span className="action">
                            建议: 增加出价25-35%，创建专门广告组
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="no-items">没有找到符合条件的关键词</p>
                )}
              </div>
            </div>
          ) : null}

          {selectedCategory === "all" ||
          selectedCategory === "efficientExpansion" ? (
            <div className="recommendation-category">
              <h3 className="category-title efficient">高效扩展词</h3>
              <p className="category-description">
                表现良好的关键词，应增加出价15-25%，添加为短语匹配，增加预算
              </p>
              <div className="recommendation-items">
                {applyFilters(enhancedRecommendations.efficientExpansion)
                  .length > 0 ? (
                  applyFilters(enhancedRecommendations.efficientExpansion).map(
                    (term, index) => (
                      <div
                        key={index}
                        className="recommendation-item efficient"
                      >
                        <div className="item-header">
                          <span className="item-term">
                            {term["Search Term"]}
                          </span>
                          <span className="item-score">
                            得分: {term.score.toFixed(0)}
                          </span>
                        </div>
                        <div className="item-metrics">
                          <span className="metric">点击: {term.Clicks}</span>
                          <span className="metric">订单: {term.Orders}</span>
                          <span className="metric">
                            ACOS:{" "}
                            {term.ACOS < 999 ? term.ACOS.toFixed(2) + "%" : "∞"}
                          </span>
                          <span className="metric">
                            支出: ${term.Spend?.toFixed(2)}
                          </span>
                        </div>
                        <div className="item-action">
                          <span className="action">
                            建议: 增加出价15-25%，添加为短语匹配
                          </span>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <p className="no-items">没有找到符合条件的关键词</p>
                )}
              </div>
            </div>
          ) : null}

          {/* 其他类别也以类似方式处理 */}
          {selectedCategory === "all" ||
          selectedCategory === "stablePerformers" ? (
            <div className="recommendation-category">
              <h3 className="category-title stable">稳定表现词</h3>
              <p className="category-description">
                表现稳定的关键词，保持或小幅提高出价5-10%
              </p>
              <div className="recommendation-items">
                {applyFilters(enhancedRecommendations.stablePerformers).length >
                0 ? (
                  applyFilters(enhancedRecommendations.stablePerformers)
                    .slice(0, 5)
                    .map((term, index) => (
                      <div key={index} className="recommendation-item stable">
                        <div className="item-header">
                          <span className="item-term">
                            {term["Search Term"]}
                          </span>
                          <span className="item-score">
                            得分: {term.score.toFixed(0)}
                          </span>
                        </div>
                        <div className="item-metrics">
                          <span className="metric">点击: {term.Clicks}</span>
                          <span className="metric">订单: {term.Orders}</span>
                          <span className="metric">
                            ACOS:{" "}
                            {term.ACOS < 999 ? term.ACOS.toFixed(2) + "%" : "∞"}
                          </span>
                        </div>
                        <div className="item-action">
                          <span className="action">
                            建议: 保持或小幅提高出价5-10%
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="no-items">没有找到符合条件的关键词</p>
                )}
                {applyFilters(enhancedRecommendations.stablePerformers).length >
                  5 && (
                  <div className="show-more">
                    显示了5项，共
                    {
                      applyFilters(enhancedRecommendations.stablePerformers)
                        .length
                    }
                    项
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // 渲染否定关键词面板
  const renderNegativeKeywordsTab = () => {
    return (
      <div className="negative-keywords-tab-content">
        <div className="filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="搜索关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="negative-keywords-container">
          <div className="negative-keywords-section">
            <h3 className="section-title">精确否定关键词</h3>
            <p className="section-description">
              这些关键词有较高点击但没有转化，建议添加为精确匹配否定关键词
            </p>
            <div className="keywords-list">
              {applyFilters(recommendations.exactNegative).length > 0 ? (
                applyFilters(recommendations.exactNegative).map(
                  (word, index) => (
                    <div key={index} className="keyword-item exact-negative">
                      <span className="keyword">{word.word}</span>
                      <div className="keyword-metrics">
                        <span className="metric">点击: {word.clicks}</span>
                        <span className="metric">
                          花费: ${word.spend.toFixed(2)}
                        </span>
                        <span className="metric">ACOS: ∞</span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="no-items">没有找到符合条件的关键词</p>
              )}
            </div>
          </div>

          <div className="negative-keywords-section">
            <h3 className="section-title">短语否定关键词</h3>
            <p className="section-description">
              这些关键词在大多数情况下表现不佳，建议添加为短语匹配否定关键词
            </p>
            <div className="keywords-list">
              {applyFilters(recommendations.phraseNegative).length > 0 ? (
                applyFilters(recommendations.phraseNegative).map(
                  (word, index) => (
                    <div key={index} className="keyword-item phrase-negative">
                      <span className="keyword">{word.word}</span>
                      <div className="keyword-metrics">
                        <span className="metric">点击: {word.clicks}</span>
                        <span className="metric">
                          ACOS:{" "}
                          {word.acos < 999 ? word.acos.toFixed(2) + "%" : "∞"}
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <p className="no-items">没有找到符合条件的关键词</p>
              )}
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => {
              const exportData = [
                ...recommendations.exactNegative.map((word) => ({
                  keyword: word.word,
                  clicks: word.clicks,
                  spend: word.spend,
                  type: "精确否定",
                })),
                ...recommendations.phraseNegative.map((word) => ({
                  keyword: word.word,
                  clicks: word.clicks,
                  acos: word.acos,
                  type: "短语否定",
                })),
              ];
              exportToCSV(exportData, "negative_keywords.csv");
            }}
            className="btn btn-danger"
          >
            导出否定关键词
          </button>
        </div>
      </div>
    );
  };

  // 渲染出价调整面板
  const renderBidAdjustmentsTab = () => {
    return (
      <div className="bid-adjustments-tab-content">
        <div className="filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="搜索关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="bid-adjustments-container">
          <div className="bid-adjustment-section">
            <h3 className="section-title increase">建议增加出价</h3>
            <p className="section-description">
              这些关键词的ACOS显著低于目标ACOS，建议增加出价以获取更多流量
            </p>
            <div className="terms-list">
              {applyFilters(recommendations.increaseBid).length > 0 ? (
                applyFilters(recommendations.increaseBid).map((term, index) => (
                  <div key={index} className="term-item increase">
                    <span className="term">{term["Search Term"]}</span>
                    <div className="term-metrics">
                      <span className="metric">
                        ACOS:{" "}
                        {term.ACOS < 999 ? term.ACOS.toFixed(2) + "%" : "∞"}
                      </span>
                      <span className="metric">
                        目标: {(settings.targetAcosIndex * 100).toFixed(2)}%
                      </span>
                      <span className="metric">点击: {term.Clicks}</span>
                      <span className="metric">订单: {term.Orders}</span>
                    </div>
                    <div className="term-action">
                      <span className="action">
                        建议增加出价
                        {Math.round(
                          (1 -
                            term.ACOS /
                              (settings.targetAcosIndex *
                                100 *
                                settings.increaseBidLv)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">没有找到符合条件的关键词</p>
              )}
            </div>
          </div>

          <div className="bid-adjustment-section">
            <h3 className="section-title decrease">建议降低出价</h3>
            <p className="section-description">
              这些关键词的ACOS显著高于目标ACOS，建议降低出价以提高利润率
            </p>
            <div className="terms-list">
              {applyFilters(recommendations.decreaseBid).length > 0 ? (
                applyFilters(recommendations.decreaseBid).map((term, index) => (
                  <div key={index} className="term-item decrease">
                    <span className="term">{term["Search Term"]}</span>
                    <div className="term-metrics">
                      <span className="metric">
                        ACOS:{" "}
                        {term.ACOS < 999 ? term.ACOS.toFixed(2) + "%" : "∞"}
                      </span>
                      <span className="metric">
                        目标: {(settings.targetAcosIndex * 100).toFixed(2)}%
                      </span>
                      <span className="metric">点击: {term.Clicks}</span>
                      <span className="metric">订单: {term.Orders}</span>
                    </div>
                    <div className="term-action">
                      <span className="action">
                        建议降低出价
                        {Math.min(
                          50,
                          Math.round(
                            (term.ACOS / (settings.targetAcosIndex * 100) - 1) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-items">没有找到符合条件的关键词</p>
              )}
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button
            onClick={() => {
              const exportData = [
                ...recommendations.increaseBid.map((term) => ({
                  term: term["Search Term"],
                  clicks: term.Clicks,
                  orders: term.Orders,
                  acos: term.ACOS,
                  targetAcos: settings.targetAcosIndex * 100,
                  recommendedAdjustment: `+${Math.round(
                    (1 -
                      term.ACOS /
                        (settings.targetAcosIndex *
                          100 *
                          settings.increaseBidLv)) *
                      100
                  )}%`,
                  type: "增加出价",
                })),
                ...recommendations.decreaseBid.map((term) => ({
                  term: term["Search Term"],
                  clicks: term.Clicks,
                  orders: term.Orders,
                  acos: term.ACOS,
                  targetAcos: settings.targetAcosIndex * 100,
                  recommendedAdjustment: `-${Math.min(
                    50,
                    Math.round(
                      (term.ACOS / (settings.targetAcosIndex * 100) - 1) * 100
                    )
                  )}%`,
                  type: "降低出价",
                })),
              ];
              exportToCSV(exportData, "bid_adjustments.csv");
            }}
            className="btn btn-primary"
          >
            导出出价调整
          </button>
        </div>
      </div>
    );
  };

  // 渲染ASIN分析面板
  const renderAsinAnalysisTab = () => {
    return (
      <div className="asin-analysis-tab-content">
        {asinData && asinData.asinTerms.length > 0 ? (
          <div className="asin-analysis">
            <div className="asin-summary">
              <h3 className="section-title">ASIN分析概览</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <h4 className="stat-label">ASIN搜索词数</h4>
                  <p className="stat-value">{asinData.asinTerms.length}</p>
                </div>
                <div className="stat-box">
                  <h4 className="stat-label">唯一ASIN数</h4>
                  <p className="stat-value">
                    {asinData.asinPerformance.uniqueAsinCount}
                  </p>
                </div>
                <div className="stat-box">
                  <h4 className="stat-label">ASIN总点击</h4>
                  <p className="stat-value">
                    {asinData.asinPerformance.totalClicks}
                  </p>
                </div>
                <div className="stat-box">
                  <h4 className="stat-label">ASIN总销售额</h4>
                  <p className="stat-value">
                    ${asinData.asinPerformance.totalSales.toFixed(2)}
                  </p>
                </div>
                <div className="stat-box">
                  <h4 className="stat-label">ASIN占比</h4>
                  <p className="stat-value">
                    {(
                      (asinData.asinTerms.length / processedData.length) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="stat-box">
                  <h4 className="stat-label">ASIN平均ACOS</h4>
                  <p className="stat-value">
                    {asinData.asinPerformance.totalSales > 0
                      ? (
                          (asinData.asinPerformance.totalSpend /
                            asinData.asinPerformance.totalSales) *
                          100
                        ).toFixed(2) + "%"
                      : "∞"}
                  </p>
                </div>
              </div>

              <div className="charts-row">
                <div className="pie-chart-container">
                  <h4 className="chart-title">ASIN vs 非ASIN</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "ASIN搜索",
                            value: asinData.asinTerms.length,
                            fill: "#3182ce",
                          },
                          {
                            name: "非ASIN搜索",
                            value: asinData.nonAsinTerms.length,
                            fill: "#48bb78",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="bar-chart-container">
                  <h4 className="chart-title">热门ASIN点击量</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={asinData.asinPerformance.asinDetails.slice(0, 5)}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="asin"
                        type="category"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip
                        formatter={(value) => [`${value} 次点击`, "点击量"]}
                      />
                      <Bar dataKey="clicks" fill="#3182ce" name="点击量" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="asin-details">
              <h3 className="section-title">ASIN详情</h3>
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="搜索ASIN..."
                  value={asinSearchTerm}
                  onChange={(e) => setAsinSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="asin-table-container">
                <table className="asin-table">
                  <thead>
                    <tr>
                      <th>ASIN</th>
                      <th>搜索词数</th>
                      <th>点击量</th>
                      <th>订单数</th>
                      <th>转化率</th>
                      <th>花费</th>
                      <th>销售额</th>
                      <th>ACOS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAsinDetails().map((asin, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={
                            selectedAsin === asin.asin ? "selected-row" : ""
                          }
                          onClick={() => handleAsinSelect(asin.asin)}
                        >
                          <td>{asin.asin}</td>
                          <td>{asin.searchTerms.length}</td>
                          <td>{asin.clicks}</td>
                          <td>{asin.orders}</td>
                          <td>{(asin.conversionRate * 100).toFixed(2)}%</td>
                          <td>${asin.spend.toFixed(2)}</td>
                          <td>${asin.sales.toFixed(2)}</td>
                          <td>
                            {asin.acos === 999
                              ? "∞"
                              : asin.acos.toFixed(2) + "%"}
                          </td>
                        </tr>
                        {selectedAsin === asin.asin && (
                          <tr className="search-terms-row">
                            <td colSpan="8">
                              <div className="search-terms-container">
                                <h4>相关搜索词:</h4>
                                <div className="search-terms-list">
                                  {asin.searchTerms.map((term, idx) => (
                                    <span
                                      key={idx}
                                      className="search-term-chip"
                                    >
                                      {term}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="asin-recommendations">
              <h3 className="section-title">ASIN优化建议</h3>
              <div className="asin-recommendation-list">
                {getFilteredAsinDetails().length > 0 ? (
                  getFilteredAsinDetails()
                    .map((asin, index) => {
                      // 根据ASIN的表现生成建议
                      const recommendation = generateAsinRecommendation(
                        asin,
                        settings
                      );
                      if (!recommendation) return null;

                      return (
                        <div
                          key={index}
                          className={`asin-recommendation-card ${recommendation.type}`}
                        >
                          <div className="card-header">
                            <h4 className="asin-card-title">{asin.asin}</h4>
                            <span className="recommendation-type">
                              {recommendation.typeText}
                            </span>
                          </div>
                          <div className="card-body">
                            <p className="recommendation-text">
                              {recommendation.text}
                            </p>
                            <div className="metrics-summary">
                              <span className="metric">
                                ACOS:{" "}
                                {asin.acos === 999
                                  ? "∞"
                                  : asin.acos.toFixed(2) + "%"}
                              </span>
                              <span className="metric">
                                转化率: {(asin.conversionRate * 100).toFixed(2)}
                                %
                              </span>
                              <span className="metric">
                                点击量: {asin.clicks}
                              </span>
                              <span className="metric">
                                订单数: {asin.orders}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                    .filter(Boolean)
                ) : (
                  <p className="no-data-message">没有找到符合条件的ASIN</p>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button
                onClick={handleExportAsinAnalysis}
                className="btn btn-primary"
              >
                导出ASIN分析
              </button>
            </div>
          </div>
        ) : (
          <p className="no-data-message">
            未在搜索词报告中找到ASIN格式的搜索词
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="enhanced-advice-tab">
      <div className="tab-header">
        <h2 className="tab-title">高级优化建议</h2>
        <div className="subtabs">
          <button
            className={`subtab-button ${
              activeTab === "summary" ? "active" : ""
            }`}
            onClick={() => setActiveTab("summary")}
          >
            概览
          </button>
          <button
            className={`subtab-button ${
              activeTab === "categorized" ? "active" : ""
            }`}
            onClick={() => setActiveTab("categorized")}
          >
            分类建议
          </button>
          <button
            className={`subtab-button ${
              activeTab === "negative" ? "active" : ""
            }`}
            onClick={() => setActiveTab("negative")}
          >
            否定关键词
          </button>
          <button
            className={`subtab-button ${
              activeTab === "bidding" ? "active" : ""
            }`}
            onClick={() => setActiveTab("bidding")}
          >
            出价调整
          </button>
          <button
            className={`subtab-button ${activeTab === "asin" ? "active" : ""}`}
            onClick={() => setActiveTab("asin")}
          >
            ASIN分析
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "summary" && renderSummaryTab()}
        {activeTab === "categorized" && renderCategorizedRecommendations()}
        {activeTab === "negative" && renderNegativeKeywordsTab()}
        {activeTab === "bidding" && renderBidAdjustmentsTab()}
        {activeTab === "asin" && renderAsinAnalysisTab()}
      </div>
    </div>
  );
};

// 根据ASIN表现生成建议
function generateAsinRecommendation(asin, settings) {
  const targetAcos = settings.targetAcosIndex * 100;

  // 无订单的ASIN
  if (asin.orders === 0 && asin.clicks >= 10) {
    return {
      type: "negative",
      typeText: "建议否定",
      text: `此ASIN有${asin.clicks}次点击但无转化。建议将其添加为否定关键词，或检查产品页面是否需要优化。`,
    };
  }

  // 高ACOS的ASIN
  if (asin.acos > targetAcos * 1.5 && asin.clicks >= 5) {
    return {
      type: "decrease",
      typeText: "建议降低出价",
      text: `此ASIN的ACOS(${asin.acos.toFixed(
        2
      )}%)远高于目标(${targetAcos.toFixed(
        2
      )}%)。建议降低出价20-30%或检查此ASIN产品的竞争情况。`,
    };
  }

  // 低ACOS高效ASIN
  if (asin.acos < targetAcos * 0.7 && asin.orders >= 2) {
    return {
      type: "increase",
      typeText: "建议增加出价",
      text: `此ASIN表现良好，ACOS(${asin.acos.toFixed(
        2
      )}%)远低于目标(${targetAcos.toFixed(
        2
      )}%)。建议增加出价15-25%以获取更多流量。`,
    };
  }

  // 中等表现但高转化率
  if (
    asin.acos < targetAcos * 1.2 &&
    asin.acos > targetAcos * 0.8 &&
    asin.conversionRate > 0.1
  ) {
    return {
      type: "maintain",
      typeText: "稳定表现",
      text: `此ASIN有良好的转化率(${(asin.conversionRate * 100).toFixed(
        2
      )}%)，ACOS在目标范围内。建议保持当前设置，继续监控表现。`,
    };
  }

  // 数据不足的ASIN
  if (asin.clicks < 5) {
    return {
      type: "monitor",
      typeText: "继续监控",
      text: `此ASIN数据较少(仅${asin.clicks}次点击)，建议继续收集更多数据后再做决策。`,
    };
  }

  return null;
}

export default EnhancedAdviceTab;
