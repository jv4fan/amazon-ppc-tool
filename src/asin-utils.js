// ASIN识别与分类功能

/**
 * 识别搜索词中的ASIN格式字符串
 * @param {string} searchTerm - 搜索词
 * @returns {string|null} - 提取到的ASIN(大写)或null
 */
export const extractASIN = (searchTerm) => {
  if (!searchTerm) return null;

  // ASIN格式匹配: b0开头,总共10个字符
  const asinRegex = /\b[bB]0[a-zA-Z0-9]{8}\b/;
  const match = searchTerm.match(asinRegex);

  if (match) {
    // 返回大写的ASIN
    return match[0].toUpperCase();
  }

  return null;
};

/**
 * 对搜索词数据进行ASIN分类处理
 * @param {Array} processedData - 处理过的搜索词数据
 * @returns {Object} - 包含ASIN分类结果的对象
 */
export const categorizeASINSearchTerms = (processedData) => {
  const asinTerms = [];
  const nonAsinTerms = [];
  const asinPerformance = {
    totalClicks: 0,
    totalSpend: 0,
    totalSales: 0,
    totalOrders: 0,
    totalImpressions: 0,
    uniqueAsinCount: 0,
    asinDetails: {}, // 各ASIN的详细表现
  };

  // 使用Set来跟踪唯一ASIN
  const uniqueAsins = new Set();

  // 遍历所有搜索词
  processedData.forEach((term) => {
    const searchTerm = term["Search Term"] || "";
    const extractedAsin = extractASIN(searchTerm);

    if (extractedAsin) {
      // 将这个搜索词加入ASIN类别
      const termWithAsin = {
        ...term,
        ASIN: extractedAsin,
      };
      asinTerms.push(termWithAsin);

      // 更新ASIN表现统计
      asinPerformance.totalClicks += term.Clicks || 0;
      asinPerformance.totalSpend += term.Spend || 0;
      asinPerformance.totalSales += term.Sales || 0;
      asinPerformance.totalOrders += term.Orders || 0;
      asinPerformance.totalImpressions += term.Impressions || 0;

      // 添加到唯一ASIN集合
      uniqueAsins.add(extractedAsin);

      // 更新单个ASIN的详细表现
      if (!asinPerformance.asinDetails[extractedAsin]) {
        asinPerformance.asinDetails[extractedAsin] = {
          asin: extractedAsin,
          searchTerms: [],
          clicks: 0,
          spend: 0,
          sales: 0,
          orders: 0,
          impressions: 0,
        };
      }

      // 累加该ASIN的数据
      const asinDetail = asinPerformance.asinDetails[extractedAsin];
      asinDetail.searchTerms.push(searchTerm);
      asinDetail.clicks += term.Clicks || 0;
      asinDetail.spend += term.Spend || 0;
      asinDetail.sales += term.Sales || 0;
      asinDetail.orders += term.Orders || 0;
      asinDetail.impressions += term.Impressions || 0;
    } else {
      // 非ASIN搜索词
      nonAsinTerms.push(term);
    }
  });

  // 设置唯一ASIN计数
  asinPerformance.uniqueAsinCount = uniqueAsins.size;

  // 将asinDetails对象转换为数组以便于使用
  const asinDetailsArray = Object.values(asinPerformance.asinDetails);

  // 计算各ASIN的ACOS和转化率
  asinDetailsArray.forEach((asin) => {
    asin.acos =
      asin.sales > 0
        ? (asin.spend / asin.sales) * 100
        : asin.spend > 0
        ? 999
        : 0;
    asin.conversionRate = asin.clicks > 0 ? asin.orders / asin.clicks : 0;
  });

  // 按点击量排序ASIN详情
  const sortedAsinDetails = asinDetailsArray.sort(
    (a, b) => b.clicks - a.clicks
  );

  return {
    asinTerms,
    nonAsinTerms,
    asinPerformance: {
      ...asinPerformance,
      asinDetails: sortedAsinDetails,
    },
  };
};

/**
 * 导出ASIN分析结果为CSV
 * @param {Array} asinDetails - ASIN详细表现数据
 * @param {Function} exportToCSV - 导出CSV的函数
 */
export const exportASINAnalysis = (asinDetails, exportToCSV) => {
  // 准备导出数据
  const exportData = asinDetails.map((asin) => ({
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
