import React from "react";

const UploadTab = ({
  handleFileUpload,
  isLoading,
  searchTermData,
  summary,
  enhancedMode,
  toggleEnhancedMode,
}) => {
  return (
    <div className="card">
      <h2 className="card-title">上传广告报告</h2>

      <div className="mode-selector">
        <p className="mode-description">选择分析模式：</p>
        <div className="mode-options">
          <div
            className={`mode-option ${!enhancedMode ? "active" : ""}`}
            onClick={() => enhancedMode && toggleEnhancedMode()}
          >
            <h3 className="mode-name">标准模式</h3>
            <p className="mode-info">基础数据处理与分析，适合简单优化</p>
          </div>
          <div
            className={`mode-option ${enhancedMode ? "active" : ""}`}
            onClick={() => !enhancedMode && toggleEnhancedMode()}
          >
            <h3 className="mode-name">增强模式</h3>
            <p className="mode-info">高级数据分析与智能推荐，基于V2模型</p>
          </div>
        </div>
      </div>

      <p>上传亚马逊广告搜索词报告（Excel 或 CSV）：</p>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        className="file-input"
        disabled={isLoading}
      />

      {isLoading && (
        <div className="loading">
          <svg
            className="spinner"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Processing your file...</span>
        </div>
      )}

      {searchTermData.length > 0 && !isLoading && (
        <div className="success-message">
          <h3 className="success-title">文件上传成功！</h3>
          <p>{summary.processedKeywords} 条关键词处理完成</p>
          <div className="stats-snapshot">
            <div className="snapshot-item">
              <span className="snapshot-label">总点击：</span>
              <span className="snapshot-value">
                {summary.totalClicks.toLocaleString()}
              </span>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-label">总花费：</span>
              <span className="snapshot-value">
                ${summary.totalSpend.toFixed(2)}
              </span>
            </div>
            <div className="snapshot-item">
              <span className="snapshot-label">平均ACOS：</span>
              <span className="snapshot-value">
                {summary.averageAcos === 999
                  ? "∞"
                  : summary.averageAcos.toFixed(2) + "%"}
              </span>
            </div>
          </div>
          <div className="tip-box">
            <p>
              <strong>小贴士:</strong>
            </p>
            <ul>
              <li>使用上面的标签查看不同的报告和分析</li>
              <li>在设置选项卡中调整阈值</li>
              <li>
                请查看 {enhancedMode ? "参考建议" : "Opti_Advice"}{" "}
                标签以获取关键词优化建议
              </li>
              <li>使用导出按钮下载您的数据为CSV格式</li>
              {enhancedMode && (
                <li>增强模式提供更细致的关键词分类和优化决策</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTab;
