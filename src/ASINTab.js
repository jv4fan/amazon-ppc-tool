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
import { categorizeASINSearchTerms, exportASINAnalysis } from "./asin-utils";

const ASINTab = ({ processedData, exportToCSV }) => {
  const [asinData, setAsinData] = useState(null);
  const [selectedAsin, setSelectedAsin] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 当processedData变化时进行ASIN分类
  useEffect(() => {
    if (processedData && processedData.length > 0) {
      const categorized = categorizeASINSearchTerms(processedData);
      setAsinData(categorized);
    }
  }, [processedData]);

  // 过滤ASIN详情
  const getFilteredAsinDetails = () => {
    if (!asinData) return [];
    return asinData.asinPerformance.asinDetails.filter((asin) =>
      asin.asin.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 获取ASIN与非ASIN搜索词的占比数据
  const getDistributionData = () => {
    if (!asinData) return [];
    return [
      {
        name: "ASIN搜索",
        value: asinData.asinTerms.length,
        color: "#3182ce",
      },
      {
        name: "非ASIN搜索",
        value: asinData.nonAsinTerms.length,
        color: "#48bb78",
      },
    ];
  };

  // 获取ASIN表现对比数据
  const getTopAsinsData = () => {
    if (!asinData) return [];
    // 获取点击量最多的10个ASIN
    return asinData.asinPerformance.asinDetails.slice(0, 10).map((asin) => ({
      name: asin.asin,
      clicks: asin.clicks,
      sales: asin.sales,
      spend: asin.spend,
    }));
  };

  // 处理ASIN选择
  const handleAsinSelect = (asin) => {
    setSelectedAsin(selectedAsin === asin ? null : asin);
  };

  if (!processedData || processedData.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">ASIN分析</h2>
        <p>请先上传搜索词报告以查看ASIN分析</p>
      </div>
    );
  }

  if (!asinData || asinData.asinTerms.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">ASIN分析</h2>
        <p>未在搜索词报告中找到ASIN格式的搜索词</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex-between">
        <h2 className="card-title">ASIN分析</h2>
        <button
          onClick={() =>
            exportASINAnalysis(
              asinData.asinPerformance.asinDetails,
              exportToCSV
            )
          }
          className="btn btn-success"
        >
          导出ASIN分析
        </button>
      </div>

      <div className="summary-section">
        <h3 className="section-title">概览</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <h4 className="stat-label">ASIN搜索词数量</h4>
            <p className="stat-value">{asinData.asinTerms.length}</p>
          </div>
          <div className="stat-box">
            <h4 className="stat-label">唯一ASIN数量</h4>
            <p className="stat-value">
              {asinData.asinPerformance.uniqueAsinCount}
            </p>
          </div>
          <div className="stat-box">
            <h4 className="stat-label">ASIN总点击</h4>
            <p className="stat-value">{asinData.asinPerformance.totalClicks}</p>
          </div>
          <div className="stat-box">
            <h4 className="stat-label">ASIN总花费</h4>
            <p className="stat-value">
              ${asinData.asinPerformance.totalSpend.toFixed(2)}
            </p>
          </div>
          <div className="stat-box">
            <h4 className="stat-label">ASIN总销售额</h4>
            <p className="stat-value">
              ${asinData.asinPerformance.totalSales.toFixed(2)}
            </p>
          </div>
          <div className="stat-box">
            <h4 className="stat-label">ASIN总订单</h4>
            <p className="stat-value">{asinData.asinPerformance.totalOrders}</p>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-container half-width">
            <h3 className="section-title">搜索词分布</h3>
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getDistributionData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                    }
                  >
                    {getDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-container half-width">
            <h3 className="section-title">热门ASIN点击量</h3>
            <div style={{ height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getTopAsinsData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#3182ce" name="点击量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="asin-details-section">
        <h3 className="section-title">ASIN详情</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索ASIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="asin-list">
          <table>
            <thead>
              <tr>
                <th style={{ width: "15%" }}>ASIN</th>
                <th style={{ width: "10%" }}>搜索次数</th>
                <th style={{ width: "10%" }}>点击量</th>
                <th style={{ width: "10%" }}>订单数</th>
                <th style={{ width: "10%" }}>转化率</th>
                <th style={{ width: "15%" }}>花费</th>
                <th style={{ width: "15%" }}>销售额</th>
                <th style={{ width: "15%" }}>ACOS</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAsinDetails().map((asin, index) => (
                <React.Fragment key={index}>
                  <tr
                    className={selectedAsin === asin.asin ? "selected-row" : ""}
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
                      {asin.acos === 999 ? "∞" : asin.acos.toFixed(2) + "%"}
                    </td>
                  </tr>
                  {selectedAsin === asin.asin && (
                    <tr className="asin-search-terms">
                      <td colSpan="8">
                        <div className="search-terms-container">
                          <h4>搜索词:</h4>
                          <div className="search-terms-list">
                            {asin.searchTerms.map((term, idx) => (
                              <span key={idx} className="search-term-tag">
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
    </div>
  );
};

export default ASINTab;
