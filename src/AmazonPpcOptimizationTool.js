import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
// eslint-disable-next-line no-unused-vars
import _ from "lodash";

// 导入标准组件
import UploadTab from "./UploadTab";
import SettingsTab from "./SettingsTab";
import ReportTab from "./ReportTab";
import WordsTab from "./WordsTab";
import AdviceTab from "./AdviceTab";
import HelpTab from "./HelpTab";

// 导入增强型组件
import EnhancedAdviceTab from "./EnhancedAdviceTab";

// 导入工具函数
import {
  processSearchTermData,
  processSplitWords,
  generateRecommendations,
  exportToCSV,
} from "./utils";

// 导入增强型工具函数
import {
  enhancedProcessSearchTermData,
  generateEnhancedRecommendations,
  generateOptimizationDecisions,
  exportDecisionsToCSV,
} from "./enhancedUtils";

// 导入样式
import "./styles.css";
import "./enhancedStyles.css";

const EnhancedAmazonPpcOptimizationTool = () => {
  // 基础状态管理
  const [activeTab, setActiveTab] = useState("upload");
  const [searchTermData, setSearchTermData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [splitWords, setSplitWords] = useState([]);
  const [recommendations, setRecommendations] = useState({
    exactNegative: [],
    phraseNegative: [],
    increaseBid: [],
    decreaseBid: [],
  });

  // 增强型状态管理
  const [enhancedMode, setEnhancedMode] = useState(true); // 默认启用增强型模式
  const [timeComparison, setTimeComparison] = useState({
    current: {},
    previous: {},
    trends: {},
  });
  const [funnelAnalysis, setFunnelAnalysis] = useState({
    top: [],
    middle: [],
    bottom: [],
  });
  const [enhancedRecommendations, setEnhancedRecommendations] = useState({
    strategicCore: [],
    efficientExpansion: [],
    stablePerformers: [],
    needsOptimization: [],
    testObservation: [],
    strategyAdjustment: [],
  });
  const [optimizationDecisions, setOptimizationDecisions] = useState({
    strategicCore: [],
    efficientExpansion: [],
    stablePerformers: [],
    needsOptimization: [],
    testObservation: [],
    strategyAdjustment: [],
    stopTargeting: [],
  });

  // 通用状态
  const [settings, setSettings] = useState({
    targetAcosIndex: 0.3,
    exactNegativeLv: 1.0,
    phraseNegativeLv: 10.0,
    reliability: 1.0,
    increaseBidLv: 0.7,
    decreaseBidLv: 1.1,
  });
  const [summary, setSummary] = useState({
    totalClicks: 0,
    totalSpend: 0,
    totalSales: 0,
    totalOrders: 0,
    totalImpressions: 0,
    averageAcos: 0,
    processedKeywords: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // 处理文件上传
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);

      if (file.name.endsWith(".csv")) {
        // 使用PapaParse解析CSV文件
        Papa.parse(file, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            setSearchTermData(results.data);

            // 处理数据 - 根据所选模式
            if (enhancedMode) {
              // 增强型数据处理
              const enhancedResults = enhancedProcessSearchTermData(
                results.data
              );
              setProcessedData(enhancedResults.processedData);
              setSummary(enhancedResults.summary);
              setSplitWords(enhancedResults.splitWords);
              setTimeComparison(enhancedResults.timeComparison);
              setFunnelAnalysis(enhancedResults.funnelAnalysis);
            } else {
              // 标准数据处理
              const processed = processSearchTermData(results.data);
              setProcessedData(processed.processedData);
              setSummary(processed.summary);
              setSplitWords(processed.splitWords);
            }

            setIsLoading(false);
          },
          error: (error) => {
            console.error("Error parsing CSV:", error);
            alert(
              "Error processing CSV file. Please check the format and try again."
            );
            setIsLoading(false);
          },
        });
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // 使用SheetJS解析Excel文件
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          cellStyles: true,
        });

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 提取表头和数据
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        // 将数据转换为带有表头键的对象数组
        const formattedData = rows.map((row) => {
          const obj = {};
          headers.forEach((header, i) => {
            if (header) obj[header] = row[i];
          });
          return obj;
        });

        setSearchTermData(formattedData);

        // 处理数据 - 根据所选模式
        if (enhancedMode) {
          // 增强型数据处理
          const enhancedResults = enhancedProcessSearchTermData(formattedData);
          setProcessedData(enhancedResults.processedData);
          setSummary(enhancedResults.summary);
          setSplitWords(enhancedResults.splitWords);
          setTimeComparison(enhancedResults.timeComparison);
          setFunnelAnalysis(enhancedResults.funnelAnalysis);
        } else {
          // 标准数据处理
          const processed = processSearchTermData(formattedData);
          setProcessedData(processed.processedData);
          setSummary(processed.summary);
          setSplitWords(processed.splitWords);
        }

        setIsLoading(false);
      } else {
        alert("Please upload a CSV or Excel file");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please check the format and try again.");
      setIsLoading(false);
    }
  };

  // 切换增强型模式
  const toggleEnhancedMode = () => {
    const newMode = !enhancedMode;
    setEnhancedMode(newMode);

    // 如果有数据，重新处理
    if (searchTermData.length > 0) {
      if (newMode) {
        // 切换到增强型模式
        const enhancedResults = enhancedProcessSearchTermData(searchTermData);
        setProcessedData(enhancedResults.processedData);
        setSummary(enhancedResults.summary);
        setSplitWords(enhancedResults.splitWords);
        setTimeComparison(enhancedResults.timeComparison);
        setFunnelAnalysis(enhancedResults.funnelAnalysis);
      } else {
        // 切换到标准模式
        const processed = processSearchTermData(searchTermData);
        setProcessedData(processed.processedData);
        setSummary(processed.summary);
        setSplitWords(processed.splitWords);
      }
    }
  };

  // 处理设置变更
  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: parseFloat(value),
    });
  };

  // 首次渲染时从localStorage加载设置
  useEffect(() => {
    // 从localStorage加载设置
    const savedSettings = localStorage.getItem("amazonPpcToolSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Error loading saved settings:", error);
      }
    }
  }, []);

  // 当设置或数据变化时生成推荐
  useEffect(() => {
    if (processedData.length > 0 && splitWords.length > 0) {
      // 标准推荐
      const newRecommendations = generateRecommendations(
        processedData,
        splitWords,
        settings
      );
      setRecommendations(newRecommendations);

      if (enhancedMode) {
        // 增强型推荐
        const enhanced = generateEnhancedRecommendations(
          processedData,
          splitWords,
          settings,
          funnelAnalysis
        );
        setEnhancedRecommendations(enhanced);

        // 生成优化决策
        const decisions = generateOptimizationDecisions(enhanced);
        setOptimizationDecisions(decisions);
      }
    }
  }, [settings, processedData, splitWords, funnelAnalysis, enhancedMode]);

  // 渲染标签页
  const renderTab = () => {
    switch (activeTab) {
      case "upload":
        return (
          <UploadTab
            handleFileUpload={handleFileUpload}
            isLoading={isLoading}
            searchTermData={searchTermData}
            summary={summary}
            enhancedMode={enhancedMode}
            toggleEnhancedMode={toggleEnhancedMode}
          />
        );

      case "settings":
        return (
          <SettingsTab
            settings={settings}
            handleSettingChange={handleSettingChange}
            setSettings={setSettings}
          />
        );

      case "report":
        return (
          <ReportTab
            searchTermData={searchTermData}
            summary={summary}
            settings={settings}
            processedData={processedData}
            exportToCSV={exportToCSV}
            timeComparison={timeComparison}
            enhancedMode={enhancedMode}
          />
        );

      case "words":
        return <WordsTab splitWords={splitWords} exportToCSV={exportToCSV} />;

      case "advice":
        return enhancedMode ? (
          <EnhancedAdviceTab
            processedData={processedData}
            recommendations={recommendations}
            enhancedRecommendations={enhancedRecommendations}
            decisions={optimizationDecisions}
            settings={settings}
            exportToCSV={exportToCSV}
            timeComparison={timeComparison}
            funnelAnalysis={funnelAnalysis}
            exportDecisionsToCSV={() =>
              exportDecisionsToCSV(optimizationDecisions)
            }
          />
        ) : (
          <AdviceTab
            processedData={processedData}
            recommendations={recommendations}
            settings={settings}
            exportToCSV={exportToCSV}
          />
        );

      case "help":
        return <HelpTab enhancedMode={enhancedMode} />;

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>
          亚马逊PPC广告优化工具{" "}
          {enhancedMode && <span className="enhanced-badge">增强版</span>}
        </h1>
        <p>分析搜索词报告并优化亚马逊广告活动</p>
        <div className="version-info">
          <span className="version-badge">Version 2.0.0</span>
          <span className="version-badge">Last Updated: April 2025</span>
          <button
            className={`mode-toggle ${enhancedMode ? "enhanced" : "standard"}`}
            onClick={toggleEnhancedMode}
          >
            {enhancedMode ? "增强模式" : "标准模式"}
          </button>
        </div>
      </div>

      <div className="tabs">
        <div
          className={`tab ${activeTab === "upload" ? "active" : ""}`}
          onClick={() => setActiveTab("upload")}
        >
          <div className="tab-title">上传报告</div>
          <div className="tab-subtitle">导入数据</div>
        </div>

        <div
          className={`tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          <div className="tab-title">设置</div>
          <div className="tab-subtitle">阈值设置</div>
        </div>

        <div
          className={`tab ${activeTab === "report" ? "active" : ""} ${
            !searchTermData.length ? "disabled" : ""
          }`}
          onClick={() => searchTermData.length && setActiveTab("report")}
        >
          <div className="tab-title">概览</div>
          <div className="tab-subtitle">源数据概览</div>
        </div>

        <div
          className={`tab ${activeTab === "words" ? "active" : ""} ${
            !splitWords.length ? "disabled" : ""
          }`}
          onClick={() => splitWords.length && setActiveTab("words")}
        >
          <div className="tab-title">分词</div>
          <div className="tab-subtitle">单个词表现</div>
        </div>

        <div
          className={`tab ${activeTab === "advice" ? "active" : ""} ${
            !processedData.length ? "disabled" : ""
          }`}
          onClick={() => processedData.length && setActiveTab("advice")}
        >
          <div className="tab-title">参考建议</div>
          <div className="tab-subtitle">广告词调整建议</div>
        </div>

        <div
          className={`tab ${activeTab === "help" ? "active" : ""}`}
          onClick={() => setActiveTab("help")}
        >
          <div className="tab-title">帮助</div>
          <div className="tab-subtitle">相关文档</div>
        </div>
      </div>

      {renderTab()}

      <div className="footer">
        <p>极优网络科技 © 2025</p>
      </div>
    </div>
  );
};

export default EnhancedAmazonPpcOptimizationTool;
