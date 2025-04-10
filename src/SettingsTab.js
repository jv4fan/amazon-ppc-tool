import React from "react";

const SettingsTab = ({ settings, handleSettingChange, setSettings }) => {
  return (
    <div className="card">
      <div className="flex-between">
        <h2 className="card-title">优化设置</h2>
        <div>
          <button
            onClick={() => {
              // 将设置保存到localStorage
              localStorage.setItem(
                "amazonPpcToolSettings",
                JSON.stringify(settings)
              );
              alert("设置保存成功！");
            }}
            className="btn btn-primary"
            style={{ marginRight: "0.5rem" }}
          >
            保存设置
          </button>
          <button
            onClick={() => {
              // 重置为默认设置
              setSettings({
                targetAcosIndex: 0.3,
                exactNegativeLv: 1.0,
                phraseNegativeLv: 10.0,
                reliability: 1.0,
                increaseBidLv: 0.7,
                decreaseBidLv: 1.1,
              });
            }}
            className="btn"
            style={{ backgroundColor: "#4b5563", color: "white" }}
          >
            恢复默认设置
          </button>
        </div>
      </div>

      <div className="settings-grid">
        <div className="setting-box">
          <label className="setting-label">目标ACOS (%)</label>
          <div className="setting-control">
            <input
              type="range"
              min="1"
              max="100"
              value={settings.targetAcosIndex * 100}
              onChange={(e) =>
                handleSettingChange({
                  target: {
                    name: "targetAcosIndex",
                    value: e.target.value / 100,
                  },
                })
              }
            />
            <input
              type="number"
              name="targetAcosIndex"
              value={settings.targetAcosIndex * 100}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: e.target.name, value: e.target.value / 100 },
                })
              }
              step="1"
            />
            <span style={{ marginLeft: "0.25rem" }}>%</span>
          </div>
          <p className="setting-description">您期望的广告销售成本百分比</p>
        </div>

        <div className="setting-box">
          <label className="setting-label">精确否定阈值</label>
          <div className="setting-control">
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={settings.exactNegativeLv}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: "exactNegativeLv", value: e.target.value },
                })
              }
            />
            <input
              type="number"
              name="exactNegativeLv"
              value={settings.exactNegativeLv}
              onChange={handleSettingChange}
              step="0.1"
            />
          </div>
          <p className="setting-description">
            用于识别精确匹配否定关键词的乘数（越高=越严格）
          </p>
        </div>

        <div className="setting-box">
          <label className="setting-label">短语否定阈值</label>
          <div className="setting-control">
            <input
              type="range"
              min="1"
              max="20"
              step="0.5"
              value={settings.phraseNegativeLv}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: "phraseNegativeLv", value: e.target.value },
                })
              }
            />
            <input
              type="number"
              name="phraseNegativeLv"
              value={settings.phraseNegativeLv}
              onChange={handleSettingChange}
              step="0.5"
            />
          </div>
          <p className="setting-description">
            用于识别短语匹配否定关键词的乘数（越高=越严格）
          </p>
        </div>

        <div className="setting-box">
          <label className="setting-label">最低可靠性</label>
          <div className="setting-control">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.reliability}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: "reliability", value: e.target.value },
                })
              }
            />
            <input
              type="number"
              name="reliability"
              value={settings.reliability}
              onChange={handleSettingChange}
              step="0.1"
              min="0.1"
              max="1"
            />
          </div>
          <p className="setting-description">
            可靠建议所需的最低点击阈值（越高=需要更多数据）
          </p>
        </div>

        <div className="setting-box">
          <label className="setting-label">增加出价阈值</label>
          <div className="setting-control">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.increaseBidLv}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: "increaseBidLv", value: e.target.value },
                })
              }
            />
            <input
              type="number"
              name="increaseBidLv"
              value={settings.increaseBidLv}
              onChange={handleSettingChange}
              step="0.1"
            />
          </div>
          <p className="setting-description">
            增加出价建议的ACOS阈值（越低=越激进）
          </p>
        </div>

        <div className="setting-box">
          <label className="setting-label">降低出价阈值</label>
          <div className="setting-control">
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={settings.decreaseBidLv}
              onChange={(e) =>
                handleSettingChange({
                  target: { name: "decreaseBidLv", value: e.target.value },
                })
              }
            />
            <input
              type="number"
              name="decreaseBidLv"
              value={settings.decreaseBidLv}
              onChange={handleSettingChange}
              step="0.1"
            />
          </div>
          <p className="setting-description">
            降低出价建议的ACOS阈值（越高=越激进）
          </p>
        </div>
      </div>

      <div className="info-box">
        <h3 className="info-title">设置说明</h3>
        <p>优化工具使用这些设置来识别需要采取行动的关键词：</p>
        <ul>
          <li>
            <strong>目标ACOS:</strong>{" "}
            所有建议都基于此目标。设置为您期望的广告利润率。
          </li>
          <li>
            <strong>精确否定关键词:</strong> ACOS {">"} (目标ACOS ×
            精确否定阈值) 且订单为0的关键词将被推荐为精确否定关键词。
          </li>
          <li>
            <strong>短语否定关键词:</strong> ACOS {">"} (目标ACOS ×
            短语否定阈值) 的关键词将被推荐为短语否定关键词。
          </li>
          <li>
            <strong>增加出价:</strong> ACOS {"<"} (目标ACOS × 增加出价阈值)
            的关键词将被推荐增加出价。
          </li>
          <li>
            <strong>降低出价:</strong> ACOS {">"} (目标ACOS × 降低出价阈值)
            的关键词将被推荐降低出价。
          </li>
          <li>
            <strong>可靠性:</strong>{" "}
            影响建议所需的置信水平。值越高需要更多的点击数据。
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsTab;
