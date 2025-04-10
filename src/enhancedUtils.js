import Papa from "papaparse";
import _ from "lodash";
import { exportToCSV } from "./utils";

// 增强型搜索词处理 - 实现V2模型
export const enhancedProcessSearchTermData = (data) => {
  // 检查数据是否存在
  if (!data || data.length === 0) {
    console.error("No data to process");
    return {
      processedData: [],
      summary: {
        totalClicks: 0,
        totalSpend: 0,
        totalSales: 0,
        totalOrders: 0,
        totalImpressions: 0,
        averageAcos: 0,
        processedKeywords: 0,
      },
      splitWords: [],
      timeComparison: { current: {}, previous: {} },
      funnelAnalysis: { top: [], middle: [], bottom: [] },
    };
  }

  // 标准化数据字段 (保留原有逻辑)
  const cleanedData = normalizeDataFields(data);
  
  // 过滤有效数据
  const validData = cleanedData.filter(
    (row) =>
      row.Impressions !== undefined ||
      row.Clicks !== undefined ||
      row.Spend !== undefined
  );

  // 计算指标
  const processed = calculateMetrics(validData);
  
  // 计算汇总统计
  const summary = calculateSummary(processed);
  
  // 时间维度分析 - 分割最近7天与之前数据
  const timeComparison = performTimeAnalysis(processed);
  
  // 购买漏斗分类
  const funnelAnalysis = categorizeFunnel(processed);
  
  // 处理拆分词
  const splitWords = enhancedSplitWordAnalysis(processed);
  
  // 词语权重分析
  const weightedWords = calculateWordWeights(splitWords, processed);

  return {
    processedData: processed,
    summary,
    splitWords: weightedWords,
    timeComparison,
    funnelAnalysis,
  };
};

// 标准化数据字段 - 处理不同列名
function normalizeDataFields(data) {
  return data.map((row) => {
    const newRow = { ...row };

    // 列名映射
    const columnMappings = {
      impressions: "Impressions",
      "impr.": "Impressions",
      impr: "Impressions",
      展示量: "Impressions",

      clicks: "Clicks",
      点击量: "Clicks",

      orders: "Orders",
      订单: "Orders",
      订单数: "Orders",
      "7 day total orders (#)": "Orders",
      "7 day total orders": "Orders",

      spend: "Spend",
      cost: "Spend",
      花费: "Spend",

      sales: "Sales",
      revenue: "Sales",
      销售额: "Sales",
      "7 day total sales ": "Sales",

      "search term": "Search Term",
      search_term: "Search Term",
      "customer search term": "Search Term",
      keyword: "Search Term",
      客户搜索词: "Search Term",
      搜索词: "Search Term",

      "total advertising cost of sales (acos) ": "ACOS",
      acos: "ACOS",

      "click-thru rate (ctr)": "CTR",
      ctr: "CTR",

      "7 day conversion rate": "ConversionRate",
      "conversion rate": "ConversionRate",

      "cost per click (cpc)": "CPC",
      "total return on advertising spend (roas)": "ROAS",
      "7 day total units (#)": "Units",
      "7 day advertised sku units (#)": "AdvertisedSKUUnits",
      "7 day other sku units (#)": "OtherSKUUnits",
      "7 day advertised sku sales": "AdvertisedSKUSales",
      "7 day other sku sales": "OtherSKUSales",
      "match type": "MatchType",
      "campaign name": "CampaignName",
      "ad group name": "AdGroupName",
    };

    // 应用映射 - 不区分大小写匹配
    Object.keys(row).forEach((key) => {
      if (key) {
        const lowerKey = key.toLowerCase();
        if (columnMappings[lowerKey]) {
          newRow[columnMappings[lowerKey]] = row[key];
        }
      }
    });

    return newRow;
  });
}

// 计算各行指标
function calculateMetrics(validData) {
  return validData.map((row) => {
    // 解析百分比值
    const parsePercentage = (value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const cleaned = value.replace("%", "").trim();
        return parseFloat(cleaned) / 100; // 转换为小数格式
      }
      return null;
    };

    // 解析数值
    const clicks = parseFloat(row.Clicks) || 0;
    const impressions = parseFloat(row.Impressions) || 0;
    const spend = parseFloat(row.Spend) || 0;
    const orders = parseFloat(row.Orders) || 0;
    const sales = parseFloat(row.Sales) || 0;
    const cpc = row.CPC ? parseFloat(row.CPC) : spend > 0 ? spend / clicks : 0;

    // 使用提供的值或计算
    let ctr =
      row.CTR !== undefined
        ? parsePercentage(row.CTR)
        : impressions > 0
        ? clicks / impressions
        : 0;
    let convRate =
      row.ConversionRate !== undefined
        ? parsePercentage(row.ConversionRate)
        : clicks > 0
        ? orders / clicks
        : 0;

    // ACOS处理
    let acos = null;
    if (row.ACOS !== undefined && row.ACOS !== null) {
      // 解析ACOS值
      if (typeof row.ACOS === "string") {
        acos = parseFloat(row.ACOS.replace("%", ""));
      } else if (typeof row.ACOS === "number") {
        acos = row.ACOS;
        // 如果ACOS存储为小数(例如0.25表示25%)，转换它
        if (acos < 1 && acos > 0) {
          acos = acos * 100;
        }
      }
    } else {
      // 计算ACOS
      if (sales > 0) {
        acos = (spend / sales) * 100;
      } else if (spend > 0) {
        acos = 999; // 无限指示器
      } else {
        acos = 0; // 无花费，无销售
      }
    }

    // 计算ROAS
    const roas = sales > 0 ? sales / spend : 0;

    // 添加日期信息和广告组相关性 (如果存在)
    const date = row.Date ? new Date(row.Date) : null;
    const isRecent = date ? (new Date() - date) / (1000 * 60 * 60 * 24) <= 7 : true;

    return {
      ...row,
      Clicks: clicks,
      Impressions: impressions,
      Spend: spend,
      Orders: orders,
      Sales: sales,
      CTR: ctr,
      ConversionRate: convRate,
      ACOS: acos,
      CPC: cpc,
      ROAS: roas,
      isRecent: isRecent,
    };
  });
}

// 计算汇总统计
function calculateSummary(processed) {
  const totalClicks = _.sumBy(processed, (row) => parseFloat(row.Clicks) || 0);
  const totalSpend = _.sumBy(processed, (row) => parseFloat(row.Spend) || 0);
  const totalSales = _.sumBy(processed, (row) => parseFloat(row.Sales) || 0);
  const totalOrders = _.sumBy(processed, (row) => parseFloat(row.Orders) || 0);
  const totalImpressions = _.sumBy(
    processed,
    (row) => parseFloat(row.Impressions) || 0
  );
  const averageAcos =
    totalSales > 0 ? (totalSpend / totalSales) * 100 : totalSpend > 0 ? 999 : 0;
  const averageCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const clickThroughRate = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const conversionRate = totalClicks > 0 ? totalOrders / totalClicks : 0;
  const roas = totalSpend > 0 ? totalSales / totalSpend : 0;

  return {
    totalClicks,
    totalSpend,
    totalSales,
    totalOrders,
    totalImpressions,
    averageAcos,
    averageCPC,
    clickThroughRate,
    conversionRate,
    roas,
    processedKeywords: processed.length,
  };
}

// 时间维度分析
function performTimeAnalysis(processed) {
  // 假设数据按时间排序，或使用Date字段
  // 这里简化为最近的数据是最近7天
  const recentData = processed.filter((row) => row.isRecent);
  const previousData = processed.filter((row) => !row.isRecent);

  // 分别计算两个时间段的汇总数据
  const currentPeriod = calculateSummary(recentData);
  const previousPeriod = calculateSummary(previousData);

  // 计算趋势变化率
  const calculateTrend = (current, previous, metric) => {
    if (previous[metric] === 0) return 0;
    return ((current[metric] - previous[metric]) / previous[metric]) * 100;
  };

  const trends = {
    acosTrend: calculateTrend(currentPeriod, previousPeriod, "averageAcos"),
    ctrTrend: calculateTrend(currentPeriod, previousPeriod, "clickThroughRate"),
    conversionTrend: calculateTrend(currentPeriod, previousPeriod, "conversionRate"),
    cpcTrend: calculateTrend(currentPeriod, previousPeriod, "averageCPC"),
  };

  return {
    current: currentPeriod,
    previous: previousPeriod,
    trends,
  };
}

// 购买漏斗分类
function categorizeFunnel(processed) {
  // 定义漏斗关键词特征
  const topFunnelTerms = ["best", "top", "vs", "compared", "review", "guide", "推荐", "比较"];
  const bottomFunnelTerms = ["buy", "price", "purchase", "discount", "coupon", "cheap", "deal", "购买", "价格", "优惠"];
  
  // 分类函数
  const categorizeSearchTerm = (term) => {
    if (!term) return "unknown";
    const lowerTerm = term.toLowerCase();
    
    // 顶部漏斗: 通用、研究性词
    if (topFunnelTerms.some(word => lowerTerm.includes(word))) {
      return "top";
    }
    
    // 底部漏斗: 高购买意向词
    if (bottomFunnelTerms.some(word => lowerTerm.includes(word))) {
      return "bottom";
    }
    
    // 考虑词长度 - 通常更长的词更具体，更接近底部
    const wordCount = term.split(" ").length;
    if (wordCount >= 4) {
      return "bottom";
    } else if (wordCount >= 2) {
      return "middle";
    }
    
    // 默认为中部漏斗
    return "middle";
  };
  
  // 分类搜索词
  const topFunnel = [];
  const middleFunnel = [];
  const bottomFunnel = [];
  
  processed.forEach(term => {
    const category = categorizeSearchTerm(term["Search Term"]);
    switch (category) {
      case "top":
        topFunnel.push(term);
        break;
      case "middle":
        middleFunnel.push(term);
        break;
      case "bottom":
        bottomFunnel.push(term);
        break;
      default:
        middleFunnel.push(term);
    }
  });
  
  return {
    top: topFunnel,
    middle: middleFunnel,
    bottom: bottomFunnel
  };
}

// 增强型单词分析
function enhancedSplitWordAnalysis(data) {
  const allWords = {};

  // 提取搜索词中的单个词并分析
  data.forEach((row) => {
    const searchTerm = row["Search Term"] || "";
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(" ");
      
      // 记录词在搜索词中的位置
      words.forEach((word, position) => {
        if (word.length > 2) { // 过滤非常短的词
          if (!allWords[word]) {
            allWords[word] = {
              word,
              impressions: 0,
              clicks: 0,
              orders: 0,
              spend: 0,
              sales: 0,
              occurrences: 0,
              positions: {},
              totalPositions: 0,
            };
          }

          // 累加指标
          allWords[word].impressions += parseFloat(row.Impressions) || 0;
          allWords[word].clicks += parseFloat(row.Clicks) || 0;
          allWords[word].orders += parseFloat(row.Orders) || 0;
          allWords[word].spend += parseFloat(row.Spend) || 0;
          allWords[word].sales += parseFloat(row.Sales) || 0;
          allWords[word].occurrences += 1;
          
          // 记录位置分布
          const normalizedPosition = position === 0 ? "first" : 
                                    position === words.length - 1 ? "last" : "middle";
          
          allWords[word].positions[normalizedPosition] = 
            (allWords[word].positions[normalizedPosition] || 0) + 1;
          
          allWords[word].totalPositions += 1;
        }
      });
    }
  });

  // 转换为数组并计算衍生指标
  const wordsArray = Object.values(allWords).map((wordData) => {
    const ctr = wordData.impressions > 0 ? wordData.clicks / wordData.impressions : 0;
    const convRate = wordData.clicks > 0 ? wordData.orders / wordData.clicks : 0;

    // 计算ACOS
    let acos = null;
    if (wordData.sales > 0) {
      acos = (wordData.spend / wordData.sales) * 100;
    } else if (wordData.spend > 0) {
      acos = 999; // 无限指示器
    } else {
      acos = 0;
    }

    // 计算可靠性
    const baseReliability = Math.min(1, wordData.clicks / 50);
    
    // 增强的可靠性计算 - 考虑最近趋势
    // 假设数据已按时间排序，我们可以使用整体趋势作为最近趋势的近似值
    const reliabilityMultiplier = 1 + (wordData.clicks > 20 ? 0.2 : 0);
    const reliability = Math.min(1, baseReliability * reliabilityMultiplier);

    // 计算位置概率
    const positionProbabilities = {};
    for (const position in wordData.positions) {
      positionProbabilities[position] = wordData.positions[position] / wordData.totalPositions;
    }
    
    // 主要位置 - 最常见的位置
    const mainPosition = Object.keys(positionProbabilities).reduce(
      (a, b) => positionProbabilities[a] > positionProbabilities[b] ? a : b
    );

    return {
      ...wordData,
      ctr,
      convRate,
      acos,
      reliability,
      positionProbabilities,
      mainPosition,
    };
  });

  // 按出现次数排序
  return _.orderBy(wordsArray, ["occurrences"], ["desc"]);
}

// 计算词权重
function calculateWordWeights(splitWords, processed) {
  // 计算每个词的权重
  return splitWords.map(word => {
    // 频率权重 = 该词在所有搜索词中出现次数 / 总搜索词数
    const frequencyWeight = word.occurrences / processed.length;
    
    // 位置权重 - 基于词在搜索词中的位置
    const positionWeight = 
      (word.positionProbabilities.first || 0) * 1.2 + 
      (word.positionProbabilities.middle || 0) * 1.0 + 
      (word.positionProbabilities.last || 0) * 0.8;
    
    // 计算加权ACOS (按点击量权重)
    // 这是一个简化版的实现，实际中可能需要查找所有包含该词的搜索词
    
    // 最终权重
    const finalWeight = frequencyWeight * positionWeight;
    
    // 词语分类
    let category = "unknown";
    if (word.clicks > 0 && word.reliability > 0.5) {
      if (word.acos < 10) {
        category = "superEfficient";
      } else if (word.acos < 15) {
        category = "efficient";
      } else if (word.acos < 25) {
        category = "adequate";
      } else if (word.acos < 40) {
        category = "marginal";
      } else {
        category = "inefficient";
      }
    } else if (word.clicks > 0 && word.reliability <= 0.5) {
      category = "undetermined";
    } else {
      category = "noClicks";
    }
    
    return {
      ...word,
      frequencyWeight,
      positionWeight,
      finalWeight,
      category,
    };
  });
}

// 高级推荐生成
export const generateEnhancedRecommendations = (
  processedData,
  splitWords,
  settings,
  funnelAnalysis
) => {
  // 基于词语分类的推荐
  const recommendations = {
    exactNegative: [],
    phraseNegative: [],
    increaseBid: [],
    decreaseBid: [],
    strategicCore: [], // 战略核心词
    efficientExpansion: [], // 高效扩展词
    stablePerformers: [], // 稳定表现词
    needsOptimization: [], // 需要优化词
    testObservation: [], // 测试观察词
    strategyAdjustment: [], // 策略调整词
  };
  
  // 扩展现有的推荐逻辑
  recommendations.exactNegative = splitWords.filter(
    (word) =>
      word.clicks >= 5 && 
      word.acos > settings.targetAcosIndex * 100 * settings.exactNegativeLv &&
      word.reliability >= settings.reliability &&
      word.orders === 0
  );

  recommendations.phraseNegative = splitWords.filter(
    (word) =>
      word.clicks >= 3 &&
      word.acos > settings.targetAcosIndex * 100 * settings.phraseNegativeLv &&
      word.reliability >= settings.reliability * 0.7 &&
      !recommendations.exactNegative.some((w) => w.word === word.word)
  );

  // 使用漏斗分析进行差异化ACOS目标设置
  const getTargetAcosByFunnel = (searchTerm) => {
    if (funnelAnalysis.top.some(term => term["Search Term"] === searchTerm)) {
      return settings.targetAcosIndex * 100 * 1.5; // 顶部漏斗词目标ACOS更高
    } else if (funnelAnalysis.bottom.some(term => term["Search Term"] === searchTerm)) {
      return settings.targetAcosIndex * 100 * 0.8; // 底部漏斗词目标ACOS更低
    }
    return settings.targetAcosIndex * 100; // 默认目标ACOS
  };
  
  // 增强型增加出价关键词推荐
  recommendations.increaseBid = processedData
    .filter(term => {
      const targetAcos = getTargetAcosByFunnel(term["Search Term"]);
      return term.Clicks >= 3 &&
             term.ACOS < targetAcos * settings.increaseBidLv &&
             term.Orders > 0;
    })
    .sort((a, b) => a.ACOS - b.ACOS); // 按ACOS升序排列
  
  // 增强型降低出价关键词推荐
  recommendations.decreaseBid = processedData
    .filter(term => {
      const targetAcos = getTargetAcosByFunnel(term["Search Term"]);
      return term.Clicks >= 5 &&
             term.ACOS > targetAcos * settings.decreaseBidLv &&
             (term.Orders === 0 || term.ACOS > targetAcos * 2);
    })
    .sort((a, b) => b.ACOS - a.ACOS); // 按ACOS降序排列
  
  // V2模型中的高级搜索词分类
  processedData.forEach(term => {
    if (!term["Search Term"]) return;
    
    // 计算搜索词的得分
    const score = calculateTermScore(term, splitWords, settings);
    const targetAcos = getTargetAcosByFunnel(term["Search Term"]);
    
    // 根据得分分类
    if (score >= 150) {
      recommendations.strategicCore.push({...term, score});
    } else if (score >= 120 && score < 150) {
      recommendations.efficientExpansion.push({...term, score});
    } else if (score >= 90 && score < 120) {
      recommendations.stablePerformers.push({...term, score});
    } else if (score >= 70 && score < 90) {
      recommendations.needsOptimization.push({...term, score});
    } else if (score >= 50 && score < 70) {
      recommendations.testObservation.push({...term, score});
    } else if (score >= 30 && score < 50) {
      recommendations.strategyAdjustment.push({...term, score});
    }
  });
  
  return recommendations;
};

// 计算搜索词得分
function calculateTermScore(term, splitWords, settings) {
  if (!term["Search Term"]) return 0;
  
  // 基础得分
  let score = 100;
  
  // 分词并评估每个词的贡献
  const words = term["Search Term"].toLowerCase().split(" ");
  
  words.forEach(word => {
    // 查找这个词在splitWords中的分析
    const wordAnalysis = splitWords.find(w => w.word === word);
    
    if (wordAnalysis) {
      // 根据词的类别调整分数
      if (wordAnalysis.category === "superEfficient") {
        score += 30;
      } else if (wordAnalysis.category === "efficient") {
        score += 20;
      } else if (wordAnalysis.category === "adequate") {
        score += 10;
      } else if (wordAnalysis.category === "marginal") {
        score -= 10;
      } else if (wordAnalysis.category === "inefficient") {
        score -= 20;
      } else if (wordAnalysis.clicks > 0 && wordAnalysis.acos > wordAnalysis.acos * 1.3) {
        // 下滑词 (之前ACOS增长超过30%)
        score -= 15;
      } else if (wordAnalysis.clicks > 0 && wordAnalysis.acos < wordAnalysis.acos * 0.7) {
        // 改善词 (之前ACOS下降超过30%)
        score += 5;
      }
    }
  });
  
  // 商业相关性评估
  // 这里简化实现，实际使用时可能需要一个核心产品词列表
  const relevanceMultiplier = calculateRelevanceMultiplier(term["Search Term"]);
  
  // 最终得分
  return score * relevanceMultiplier;
}

// 计算相关性系数
function calculateRelevanceMultiplier(searchTerm) {
  if (!searchTerm) return 1.0;
  
  // 这里是一个简化的实现
  // 实际使用时，应该有一个核心产品词列表来评估匹配程度
  // 例如，如果搜售的是"patio cushions"，应该检查搜索词是否包含这些词
  
  // 假设:
  // - 词数超过3个，可能与特定产品更相关
  // - 较短的词可能更通用
  const wordCount = searchTerm.split(" ").length;
  
  if (wordCount >= 3) {
    return 1.2; // 高相关度
  } else if (wordCount === 2) {
    return 1.0; // 中相关度
  } else {
    return 0.8; // 低相关度
  }
}

// 生成搜索词优化决策
export const generateOptimizationDecisions = (recommendations) => {
  const decisions = {
    strategicCore: [],
    efficientExpansion: [],
    stablePerformers: [],
    needsOptimization: [],
    testObservation: [],
    strategyAdjustment: [],
    stopTargeting: []
  };
  
  // 战略核心词决策
  decisions.strategicCore = recommendations.strategicCore.map(term => ({
    term: term["Search Term"],
    action: "increaseBid",
    bidAdjustment: "+25-35%",
    priority: "high",
    matchType: "exact",
    notes: "创建单独的精确匹配广告组，优先展示位置"
  }));
  
  // 高效扩展词决策
  decisions.efficientExpansion = recommendations.efficientExpansion.map(term => ({
    term: term["Search Term"],
    action: "increaseBid",
    bidAdjustment: "+15-25%",
    priority: "medium-high",
    matchType: "phrase",
    notes: "添加为短语匹配，增加每日预算"
  }));
  
  // 稳定表现词决策
  decisions.stablePerformers = recommendations.stablePerformers.map(term => ({
    term: term["Search Term"],
    action: "maintainBid",
    bidAdjustment: "+5-10%",
    priority: "medium",
    matchType: "current",
    notes: "保持或小幅提高出价，维持当前匹配类型"
  }));
  
  // 需要优化词决策
  decisions.needsOptimization = recommendations.needsOptimization.map(term => ({
    term: term["Search Term"],
    action: "decreaseBid",
    bidAdjustment: "-5-10%",
    priority: "medium-low",
    matchType: "current",
    notes: "降低出价，保留投放，优化商品详情页相关内容"
  }));
  
  // 测试观察词决策
  decisions.testObservation = recommendations.testObservation.map(term => ({
    term: term["Search Term"],
    action: "limitBudget",
    bidAdjustment: "-15-20%",
    priority: "low",
    matchType: "current",
    notes: "严格限制每日预算，设置A/B测试"
  }));
  
  // 策略调整词决策
  decisions.strategyAdjustment = recommendations.strategyAdjustment.map(term => {
    // 检查是否包含重要品类词
    const isCategoryTerm = term["Search Term"].split(" ").length <= 2;
    
    if (isCategoryTerm) {
      return {
        term: term["Search Term"],
        action: "decreaseBid",
        bidAdjustment: "-20-25%",
        priority: "low",
        matchType: "current",
        notes: "降低出价，限制展示"
      };
    } else {
      return {
        term: term["Search Term"],
        action: "negativeExact",
        bidAdjustment: "N/A",
        priority: "low",
        matchType: "negative exact",
        notes: "添加为否定精确匹配，创建不含此词的新组合"
      };
    }
  });
  
  // 否定精确关键词决策
  const exactNegativeDecisions = recommendations.exactNegative.map(word => ({
    term: word.word,
    action: "negativeExact",
    bidAdjustment: "N/A",
    priority: "high",
    matchType: "negative exact",
    notes: `高点击无转化词，${word.clicks}次点击花费$${word.spend.toFixed(2)}`
  }));
  
  // 否定短语关键词决策
  const phraseNegativeDecisions = recommendations.phraseNegative.map(word => ({
    term: word.word,
    action: "negativePhrase",
    bidAdjustment: "N/A",
    priority: "medium-high",
    matchType: "negative phrase",
    notes: `高ACOS词(${word.acos < 999 ? word.acos.toFixed(0) : "∞"}%)，${word.clicks}次点击`
  }));
  
  // 合并否定词决策
  decisions.stopTargeting = [...exactNegativeDecisions, ...phraseNegativeDecisions];
  
  return decisions;
};

// 导出决策为CSV
export const exportDecisionsToCSV = (decisions) => {
  // 合并所有决策
  const allDecisions = [
    ...decisions.strategicCore.map(d => ({...d, category: "战略核心词"})),
    ...decisions.efficientExpansion.map(d => ({...d, category: "高效扩展词"})),
    ...decisions.stablePerformers.map(d => ({...d, category: "稳定表现词"})),
    ...decisions.needsOptimization.map(d => ({...d, category: "需要优化词"})),
    ...decisions.testObservation.map(d => ({...d, category: "测试观察词"})),
    ...decisions.strategyAdjustment.map(d => ({...d, category: "策略调整词"})),
    ...decisions.stopTargeting.map(d => ({...d, category: "否定词"}))
  ];
  
  // 导出CSV
  exportToCSV(allDecisions, "amazon_ppc_optimization_decisions.csv");
};
