import React, { useState, useEffect } from "react";
import { extractASIN, categorizeASINSearchTerms } from "./asin-utils"; // 导入ASIN工具函数

const AdviceTab = ({
  processedData,
  recommendations,
  settings,
  exportToCSV,
}) => {
  const [activeSection, setActiveSection] = useState("recommendations");
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
    exportToCSV(exportData, "asin_analysis.csv");
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 className="card-title">优化建议</h2>
        <div className="export-buttons">
          {activeSection === "recommendations" && (
            <button
              onClick={() => {
                // Create a combined recommendations object for export
                const exportData = [
                  ...recommendations.exactNegative.map((word) => ({
                    ...word,
                    type: "Exact Negative",
                  })),
                  ...recommendations.phraseNegative.map((word) => ({
                    ...word,
                    type: "Phrase Negative",
                  })),
                  ...recommendations.increaseBid.map((term) => ({
                    term: term["Search Term"],
                    clicks: term.Clicks,
                    orders: term.Orders,
                    acos: term.ACOS,
                    type: "Increase Bid",
                  })),
                  ...recommendations.decreaseBid.map((term) => ({
                    term: term["Search Term"],
                    clicks: term.Clicks,
                    orders: term.Orders,
                    acos: term.ACOS,
                    type: "Decrease Bid",
                  })),
                ];
                exportToCSV(exportData, "optimization_recommendations.csv");
              }}
              className="btn btn-success"
            >
              导出建议
            </button>
          )}
          {activeSection === "asin" &&
            asinData &&
            asinData.asinTerms.length > 0 && (
              <button
                onClick={handleExportAsinAnalysis}
                className="btn btn-success"
              >
                导出ASIN分析
              </button>
            )}
        </div>
      </div>

      {/* 分段导航 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${
            activeSection === "recommendations" ? "active" : ""
          }`}
          onClick={() => setActiveSection("recommendations")}
        >
          优化建议
        </button>
        <button
          className={`tab-button ${activeSection === "asin" ? "active" : ""}`}
          onClick={() => setActiveSection("asin")}
        >
          ASIN分析
        </button>
      </div>

      {/* 优化建议部分 */}
      {activeSection === "recommendations" &&
        (processedData.length > 0 ? (
          <div
            className="recommendation-groups"
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div className="recommendation-group">
              <h3 className="recommendation-title" style={{ color: "#b91c1c" }}>
                建议精确否定关键词
              </h3>
              <p className="recommendation-description">
                这些关键词有高点击但无转化。添加为精确匹配否定关键词。
              </p>
              {recommendations.exactNegative.length > 0 ? (
                <div
                  className="recommendation-tags"
                  style={{ backgroundColor: "#fef2f2" }}
                >
                  {recommendations.exactNegative.map((word, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
                    >
                      {word.word} ({word.clicks} 点击, ${word.spend.toFixed(2)}{" "}
                      花费)
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  未找到建议
                </p>
              )}
            </div>

            <div className="recommendation-group">
              <h3 className="recommendation-title" style={{ color: "#c2410c" }}>
                建议短语否定关键词
              </h3>
              <p className="recommendation-description">
                这些关键词在大多数场景中表现较差。添加为短语匹配否定关键词。
              </p>
              {recommendations.phraseNegative.length > 0 ? (
                <div
                  className="recommendation-tags"
                  style={{ backgroundColor: "#fff7ed" }}
                >
                  {recommendations.phraseNegative.map((word, index) => (
                    <span
                      key={index}
                      className="tag"
                      style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}
                    >
                      {word.word} ({word.clicks} 点击, ACOS:{" "}
                      {word.acos < 999 ? word.acos.toFixed(0) + "%" : "∞"})
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  未找到建议
                </p>
              )}
            </div>

            <div className="recommendation-group">
              <h3 className="recommendation-title" style={{ color: "#15803d" }}>
                建议增加出价
              </h3>
              <p className="recommendation-description">
                这些关键词的ACOS远低于您的目标ACOS。考虑增加出价以获取更多流量。
              </p>
              {recommendations.increaseBid.length > 0 ? (
                <div
                  className="recommendation-tags"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  {recommendations.increaseBid.map((term, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "#dcfce7",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <p style={{ fontWeight: "500", color: "#15803d" }}>
                        {term["Search Term"] || "未知词"}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#166534" }}>
                        ACOS:{" "}
                        {term.ACOS !== undefined && term.ACOS !== null
                          ? term.ACOS.toFixed(2)
                          : "∞"}
                        % (目标: {(settings.targetAcosIndex * 100).toFixed(2)}%)
                        | 点击: {term.Clicks || 0} | 订单: {term.Orders || 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  未找到建议
                </p>
              )}
            </div>

            <div className="recommendation-group">
              <h3 className="recommendation-title" style={{ color: "#1d4ed8" }}>
                建议降低出价
              </h3>
              <p className="recommendation-description">
                这些关键词的ACOS远高于您的目标ACOS。考虑降低出价以提高利润。
              </p>
              {recommendations.decreaseBid.length > 0 ? (
                <div
                  className="recommendation-tags"
                  style={{ backgroundColor: "#eff6ff" }}
                >
                  {recommendations.decreaseBid.map((term, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "0.5rem",
                        padding: "0.5rem",
                        backgroundColor: "#dbeafe",
                        borderRadius: "0.375rem",
                      }}
                    >
                      <p style={{ fontWeight: "500", color: "#1d4ed8" }}>
                        {term["Search Term"] || "未知词"}
                      </p>
                      <p style={{ fontSize: "0.75rem", color: "#1e40af" }}>
                        ACOS:{" "}
                        {term.ACOS !== undefined && term.ACOS !== null
                          ? term.ACOS.toFixed(2)
                          : "∞"}
                        % (目标: {(settings.targetAcosIndex * 100).toFixed(2)}%)
                        | 点击: {term.Clicks || 0} | 订单: {term.Orders || 0}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  未找到建议
                </p>
              )}
            </div>
          </div>
        ) : (
          <p>请上传您的搜索词报告以查看优化建议</p>
        ))}

      {/* ASIN分析部分 */}
      {activeSection === "asin" &&
        (processedData.length > 0 ? (
          asinData && asinData.asinTerms.length > 0 ? (
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
                                  转化率:{" "}
                                  {(asin.conversionRate * 100).toFixed(2)}%
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
            </div>
          ) : (
            <p>未在搜索词报告中找到ASIN格式的搜索词</p>
          )
        ) : (
          <p>请上传您的搜索词报告以查看ASIN分析</p>
        ))}
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

export default AdviceTab;
