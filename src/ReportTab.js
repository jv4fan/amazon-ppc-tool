import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ReportTab = ({
  searchTermData,
  summary,
  settings,
  processedData,
  exportToCSV,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">数据概览</h2>
      {searchTermData.length > 0 ? (
        <>
          <div className="stats-grid">
            <div className="stat-box">
              <h3 className="stat-label">总点击量</h3>
              <p className="stat-value">
                {summary.totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="stat-box">
              <h3 className="stat-label">总花费</h3>
              <p className="stat-value">${summary.totalSpend.toFixed(2)}</p>
            </div>
            <div className="stat-box">
              <h3 className="stat-label">总销售额</h3>
              <p className="stat-value">${summary.totalSales.toFixed(2)}</p>
            </div>
            <div className="stat-box">
              <h3 className="stat-label">总订单数</h3>
              <p className="stat-value">{summary.totalOrders}</p>
            </div>
            <div className="stat-box">
              <h3 className="stat-label">平均ACOS</h3>
              <p className="stat-value">
                {summary.averageAcos === 999
                  ? "∞"
                  : summary.averageAcos.toFixed(2) + "%"}
              </p>
            </div>
            <div className="stat-box">
              <h3 className="stat-label">分析关键词数</h3>
              <p className="stat-value">{summary.processedKeywords}</p>
            </div>
          </div>

          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            表现指标
          </h3>
          <div style={{ height: "16rem", marginBottom: "1.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "当前ACOS",
                    value:
                      summary.averageAcos > 100 ? 100 : summary.averageAcos,
                  },
                  {
                    name: "目标ACOS",
                    value: settings.targetAcosIndex * 100,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "ACOS %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="ACOS %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
              所有关键词表现
            </h3>
            <button
              onClick={() =>
                exportToCSV(processedData, "amazon_keyword_performance.csv")
              }
              className="btn btn-success"
            >
              导出CSV
            </button>
          </div>

          {/* 使用虚拟化表格提高性能 */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>关键词</th>
                  <th style={{ width: "8.33%" }}>展示量</th>
                  <th style={{ width: "8.33%" }}>点击量</th>
                  <th style={{ width: "8.33%" }}>订单数</th>
                  <th style={{ width: "8.33%" }}>ACOS</th>
                  <th style={{ width: "8.33%" }}>花费</th>
                  <th style={{ width: "8.33%" }}>销售额</th>
                </tr>
              </thead>
              <tbody>
                {processedData.map((row, index) => (
                  <tr key={index}>
                    <td>{row["Search Term"] || "未知"}</td>
                    <td>{row.Impressions || 0}</td>
                    <td>{row.Clicks || 0}</td>
                    <td>{row.Orders || 0}</td>
                    <td>
                      {row.ACOS === 0
                        ? "0.00%"
                        : row.ACOS === 999
                        ? "∞"
                        : row.ACOS !== undefined && row.ACOS !== null
                        ? row.ACOS.toFixed(2) + "%"
                        : "∞"}
                    </td>
                    <td>${row.Spend?.toFixed(2) || "0.00"}</td>
                    <td>${row.Sales?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>请上传您的搜索词报告以查看统计数据</p>
      )}
    </div>
  );
};

export default ReportTab;
