import React from "react";

const HelpTab = ({ enhancedMode = false }) => {
  return (
    <div className="card">
      <h2 className="card-title">帮助文档</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#1d4ed8",
            marginBottom: "0.5rem",
          }}
        >
          使用指引
        </h3>
        <div
          style={{
            backgroundColor: "#eff6ff",
            padding: "1rem",
            borderRadius: "0.375rem",
          }}
        >
          <ol
            style={{
              paddingLeft: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>
              <strong>上传报告：</strong>
              首先上传您的亚马逊广告搜索词报告（CSV或Excel格式）。
              {enhancedMode && <span>选择标准模式或增强模式进行分析。</span>}
            </li>
            <li>
              <strong>设置阈值：</strong>
              在设置选项卡中调整优化参数，以匹配您的广告目标。
            </li>
            <li>
              <strong>查看数据：</strong>在概览页面查看您上传的数据。
              {enhancedMode && (
                <span>增强模式提供时间趋势对比和更多统计数据。</span>
              )}
            </li>
            <li>
              <strong>分析关键词：</strong>
              点击分词页面分析所有搜索词中的单个关键词表现。
              {enhancedMode && <span>增强模式提供词语权重和位置分析。</span>}
            </li>
            <li>
              <strong>查看建议：</strong>
              点击参考建议选项卡查看优化建议。
              {enhancedMode && (
                <span>
                  增强模式提供按类别分组的详细建议，包括战略核心词、高效扩展词等。
                </span>
              )}
            </li>
          </ol>
        </div>
      </div>

      {enhancedMode && (
        <div style={{ marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "500",
              color: "#1d4ed8",
              marginBottom: "0.5rem",
            }}
          >
            增强模式特性
          </h3>
          <div
            style={{
              backgroundColor: "#eff6ff",
              padding: "1rem",
              borderRadius: "0.375rem",
            }}
          >
            <ul
              style={{
                paddingLeft: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <li>
                <strong>时间维度分析：</strong>
                自动将数据分为当前期（最近7天）与对比期，计算关键指标的变化趋势。
              </li>
              <li>
                <strong>购买漏斗分类：</strong>
                将搜索词自动分类为顶部（发现类）、中部（考虑类）和底部（转化类）漏斗词。
              </li>
              <li>
                <strong>高级词语分析：</strong>
                考虑词语在搜索词中的位置和出现频率，计算权重系数。
              </li>
              <li>
                <strong>精细分类系统：</strong>
                将关键词分为战略核心词、高效扩展词、稳定表现词等多个类别，提供针对性建议。
              </li>
              <li>
                <strong>分层优化决策：</strong>
                根据搜索词的评分和类别，提供精细化的出价和匹配类型调整建议。
              </li>
            </ul>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#1d4ed8",
            marginBottom: "0.5rem",
          }}
        >
          搜索词报告格式
        </h3>
        <p style={{ marginBottom: "0.5rem" }}>
          本工具适用于标准的亚马逊广告搜索词报告。支持以下列名：
        </p>
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "1rem",
            borderRadius: "0.375rem",
            overflowX: "auto",
          }}
        >
          <table style={{ minWidth: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    color: "#6b7280",
                  }}
                >
                  列名
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    color: "#6b7280",
                  }}
                >
                  说明
                </th>
              </tr>
            </thead>
            <tbody style={{ borderTop: "1px solid #e5e7eb" }}>
              <tr>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  Customer Search Term
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  导致您的广告展示的搜索查询
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  Impressions
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>您的广告展示次数</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  Clicks
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>您的广告点击次数</td>
              </tr>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  Spend
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>在此搜索词上的支出</td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  7 Day Total Sales
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  广告点击后7天内产生的销售额
                </td>
              </tr>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  7 Day Total Orders
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  广告点击后7天内的订单数量
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.5rem 1rem", whiteSpace: "nowrap" }}>
                  Total ACOS
                </td>
                <td style={{ padding: "0.5rem 1rem" }}>
                  广告销售成本（支出 ÷ 销售额 × 100%）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p
          style={{
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            color: "#6b7280",
          }}
        >
          注意：工具会自动映射各种列名格式（如"clicks"或"Clicks"）到标准化名称。
        </p>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#1d4ed8",
            marginBottom: "0.5rem",
          }}
        >
          设置说明
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>目标ACOS</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              这是您期望的广告销售成本。所有建议都基于将实际ACOS与此目标进行比较。
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                fontStyle: "italic",
                marginTop: "0.25rem",
              }}
            >
              示例：如果您的目标ACOS是25%，则ACOS低于25%的关键词被视为有利可图。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>精确否定阈值</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              用于识别精确匹配否定关键词的乘数。值越高，筛选越严格。
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                fontStyle: "italic",
                marginTop: "0.25rem",
              }}
            >
              示例：目标ACOS为25%且阈值为1.0时，ACOS大于25%且无订单的关键词将被标记。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>短语否定阈值</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              用于识别短语匹配否定关键词的乘数。值越高，筛选越严格。
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                fontStyle: "italic",
                marginTop: "0.25rem",
              }}
            >
              示例：目标ACOS为25%且阈值为10.0时，ACOS大于250%的关键词将被标记。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>可靠性</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              建议所需的最低置信度。值越高，需要更多的点击数据。
            </p>
            <p
              style={{
                fontSize: "0.875rem",
                fontStyle: "italic",
                marginTop: "0.25rem",
              }}
            >
              示例：可靠性设为0.5时，关键词至少需要25次点击才能被视为完全可靠。
            </p>
          </div>

          {enhancedMode && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "0.75rem",
                borderRadius: "0.375rem",
              }}
            >
              <p style={{ fontWeight: "500" }}>增强模式阈值</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                在增强模式下，系统使用更复杂的阈值计算，包括：
              </p>
              <ul style={{ fontSize: "0.875rem", paddingLeft: "1.5rem" }}>
                <li>为不同漏斗阶段设置差异化目标ACOS</li>
                <li>为搜索词计算综合得分（基于包含单词的表现）</li>
                <li>根据词语位置和频率分配权重</li>
                <li>考虑时间趋势调整可靠性评分</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#1d4ed8",
            marginBottom: "0.5rem",
          }}
        >
          如何使用优化建议
        </h3>
        <div
          style={{
            backgroundColor: "#eff6ff",
            padding: "1rem",
            borderRadius: "0.375rem",
          }}
        >
          <ol
            style={{
              paddingLeft: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <li>
              <strong>精确否定关键词：</strong>
              将这些词添加为广告活动中的精确匹配否定关键词，以防止为这些未转化的特定搜索词展示广告。
            </li>
            <li>
              <strong>短语否定关键词：</strong>
              将这些词添加为短语匹配否定关键词，以防止为包含这些词的任何搜索词展示广告。
            </li>
            <li>
              <strong>增加出价：</strong>
              考虑为这些关键词增加出价，因为它们的ACOS远低于您的目标ACOS，可以通过提高可见性来获得更多利润。
            </li>
            <li>
              <strong>降低出价：</strong>
              考虑为这些关键词降低出价，因为它们的ACOS高于您的目标ACOS，目前不盈利。
            </li>
            {enhancedMode && (
              <>
                <li>
                  <strong>战略核心词：</strong>
                  增加出价25-35%，创建单独的精确匹配广告组，优先展示位置。
                </li>
                <li>
                  <strong>高效扩展词：</strong>
                  增加出价15-25%，添加为短语匹配，增加每日预算。
                </li>
                <li>
                  <strong>稳定表现词：</strong>
                  保持或小幅提高出价5-10%，维持当前匹配类型。
                </li>
                <li>
                  <strong>需要优化词：</strong>
                  降低出价5-10%，保留投放，优化商品详情页相关内容。
                </li>
              </>
            )}
          </ol>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "#4b5563",
            }}
          >
            您可以将任何这些建议列表导出为CSV格式，以便在亚马逊广告活动中更轻松地实施。
          </p>
        </div>
      </div>

      <div>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: "500",
            color: "#1d4ed8",
            marginBottom: "0.5rem",
          }}
        >
          常见问题
        </h3>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>
              问：为什么某些关键词的ACOS值显示为"∞"？
            </p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              答：这表示有支出但没有销售的关键词（无限高的ACOS）。这些通常是否定关键词的首选候选词。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>问：为什么我看不到任何建议？</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              答：确保您的数据有足够的点击和销售数据来生成有意义的建议。您可能还需要调整阈值设置，使其不那么严格。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>问：我可以保存我的设置吗？</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              答：是的，使用设置选项卡中的"保存设置"按钮。这些设置将保存在您的浏览器中，并在您下次使用工具时自动加载。
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "0.75rem",
              borderRadius: "0.375rem",
            }}
          >
            <p style={{ fontWeight: "500" }}>问：为什么工具处理大文件较慢？</p>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              答：处理大型数据集需要大量计算资源。尝试在导出中关注特定时间段或活动，以获得更好的性能。
            </p>
          </div>

          {enhancedMode && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "0.75rem",
                borderRadius: "0.375rem",
              }}
            >
              <p style={{ fontWeight: "500" }}>
                问：增强模式和标准模式有什么区别？
              </p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                答：增强模式提供更深入的数据分析，包括时间趋势比较、搜索词漏斗分类、词语权重分析和更精细的推荐分类系统。它基于更先进的V2优化模型，提供更精准的优化建议。
              </p>
            </div>
          )}

          {enhancedMode && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "0.75rem",
                borderRadius: "0.375rem",
              }}
            >
              <p style={{ fontWeight: "500" }}>问：搜索词分数是如何计算的？</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                答：搜索词分数基于包含的单词性能、商业相关性和历史趋势计算。系统从100分基础分开始，每个高效单词加分，每个低效单词减分，再乘以相关性系数得出最终分数。分数越高，关键词价值越大。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpTab;
