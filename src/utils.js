import Papa from "papaparse";
import _ from "lodash";

// 修复中文导出函数
export const exportToCSV = (data, filename) => {
  // 添加BOM标记以支持中文
  const BOM = "\uFEFF";

  // 转换数据为CSV格式
  const csvData = Papa.unparse(data);

  // 创建带有BOM的CSV数据
  const csvWithBOM = BOM + csvData;

  // 创建Blob并指定字符编码为UTF-8
  const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });

  // 创建URL
  const url = URL.createObjectURL(blob);

  // 创建下载链接
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);

  // 添加到文档并触发下载
  document.body.appendChild(link);
  link.click();

  // 移除链接
  document.body.removeChild(link);
};

// Process the search term data
export const processSearchTermData = (data) => {
  // Check if data exists and has items
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
    };
  }

  // Clean up column names - accommodate different naming conventions from various report formats
  const cleanedData = data.map((row) => {
    const newRow = { ...row };

    // Map common column names to standardized versions - using strings as keys
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

      // Add additional columns from the provided headers
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

    // Apply mappings - case insensitive matching
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

  // Filter out rows without necessary data - more flexible filtering
  const validData = cleanedData.filter(
    (row) =>
      row.Impressions !== undefined ||
      row.Clicks !== undefined ||
      row.Spend !== undefined
  );

  // Calculate metrics for each row
  const processed = validData.map((row) => {
    // Try to handle percentage values that might be stored as strings with % signs
    const parsePercentage = (value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const cleaned = value.replace("%", "").trim();
        return parseFloat(cleaned) / 100; // Convert to decimal format
      }
      return null;
    };

    // Parse numeric values
    const clicks = parseFloat(row.Clicks) || 0;
    const impressions = parseFloat(row.Impressions) || 0;
    const spend = parseFloat(row.Spend) || 0;
    const orders = parseFloat(row.Orders) || 0;
    const sales = parseFloat(row.Sales) || 0;

    // Use provided values if available, otherwise calculate
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

    // For ACOS, check if it's directly provided
    let acos = null;
    if (row.ACOS !== undefined && row.ACOS !== null) {
      // Try to parse the ACOS value
      if (typeof row.ACOS === "string") {
        // Handle string values, which might include % symbol
        acos = parseFloat(row.ACOS.replace("%", ""));
      } else if (typeof row.ACOS === "number") {
        acos = row.ACOS;
        // If ACOS is stored as a decimal (e.g., 0.25 for 25%), convert it
        if (acos < 1 && acos > 0) {
          acos = acos * 100;
        }
      }
    } else {
      // Calculate ACOS if not provided
      if (sales > 0) {
        acos = (spend / sales) * 100;
      } else if (spend > 0) {
        acos = 999; // Infinity indicator
      } else {
        acos = 0; // No spend, no sales
      }
    }

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
    };
  });

  // Calculate summary statistics
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

  const summary = {
    totalClicks,
    totalSpend,
    totalSales,
    totalOrders,
    totalImpressions,
    averageAcos,
    processedKeywords: processed.length,
  };

  // Process split words
  const splitWords = processSplitWords(processed);

  return {
    processedData: processed,
    summary,
    splitWords,
  };
};

// Split search terms into individual words and analyze
export const processSplitWords = (data) => {
  const allWords = {};

  // Extract individual words from search terms
  data.forEach((row) => {
    const searchTerm = row["Search Term"] || "";
    if (searchTerm) {
      const words = searchTerm.toLowerCase().split(" ");

      words.forEach((word) => {
        if (word.length > 2) {
          // Filter out very short words
          if (!allWords[word]) {
            allWords[word] = {
              word,
              impressions: 0,
              clicks: 0,
              orders: 0,
              spend: 0,
              sales: 0,
              occurrences: 0,
            };
          }

          allWords[word].impressions += parseFloat(row.Impressions) || 0;
          allWords[word].clicks += parseFloat(row.Clicks) || 0;
          allWords[word].orders += parseFloat(row.Orders) || 0;
          allWords[word].spend += parseFloat(row.Spend) || 0;
          allWords[word].sales += parseFloat(row.Sales) || 0;
          allWords[word].occurrences += 1;
        }
      });
    }
  });

  // Convert to array and calculate derived metrics
  const wordsArray = Object.values(allWords).map((wordData) => {
    const ctr =
      wordData.impressions > 0 ? wordData.clicks / wordData.impressions : 0;
    const convRate =
      wordData.clicks > 0 ? wordData.orders / wordData.clicks : 0;

    // Calculate ACOS based on spend and sales
    let acos = null;
    if (wordData.sales > 0) {
      acos = (wordData.spend / wordData.sales) * 100;
    } else if (wordData.spend > 0) {
      // If there's spend but no sales, set a high but finite ACOS
      acos = 999; // Infinity indicator
    } else {
      acos = 0; // No spend, no sales
    }

    const reliability = Math.min(1, wordData.clicks / 50); // Reliability based on click volume

    return {
      ...wordData,
      ctr,
      convRate,
      acos,
      reliability,
    };
  });

  // Sort by occurrences
  const sortedWords = _.orderBy(wordsArray, ["occurrences"], ["desc"]);
  return sortedWords;
};

// Generate recommendations based on settings and data
export const generateRecommendations = (
  processedData,
  splitWords,
  settings
) => {
  // Exact negative keywords (high confidence poor performers)
  const exactNegative = splitWords.filter(
    (word) =>
      word.clicks >= 5 && // Minimum clicks for statistical significance
      word.acos > settings.targetAcosIndex * 100 * settings.exactNegativeLv &&
      word.reliability >= settings.reliability &&
      word.orders === 0 // No orders
  );

  // Phrase negative keywords (moderate confidence poor performers)
  const phraseNegative = splitWords.filter(
    (word) =>
      word.clicks >= 3 &&
      word.acos > settings.targetAcosIndex * 100 * settings.phraseNegativeLv &&
      word.reliability >= settings.reliability * 0.7 &&
      !exactNegative.some((w) => w.word === word.word)
  );

  // Increase bid keywords (good performers below target ACOS)
  const increaseBid = processedData
    .filter(
      (term) =>
        term.Clicks >= 3 &&
        term.ACOS < settings.targetAcosIndex * 100 * settings.increaseBidLv &&
        term.Orders > 0
    )
    .sort((a, b) => a.ACOS - b.ACOS); // Sort by ACOS ascending

  // Decrease bid keywords (poor performers above target ACOS)
  const decreaseBid = processedData
    .filter(
      (term) =>
        term.Clicks >= 5 &&
        term.ACOS > settings.targetAcosIndex * 100 * settings.decreaseBidLv &&
        (term.Orders === 0 || term.ACOS > settings.targetAcosIndex * 200)
    )
    .sort((a, b) => b.ACOS - a.ACOS); // Sort by ACOS descending

  return {
    exactNegative,
    phraseNegative,
    increaseBid,
    decreaseBid,
  };
};
