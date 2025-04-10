import React from "react";

const WordsTab = ({ splitWords, exportToCSV }) => {
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
        <h2 className="card-title">Split Words Analysis</h2>
        <button
          onClick={() => exportToCSV(splitWords, "split_words_analysis.csv")}
          className="btn btn-success"
        >
          Export CSV
        </button>
      </div>

      {splitWords.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: "16.66%" }}>Word</th>
                <th style={{ width: "8.33%" }}>Occurrences</th>
                <th style={{ width: "8.33%" }}>Impressions</th>
                <th style={{ width: "8.33%" }}>Clicks</th>
                <th style={{ width: "8.33%" }}>Orders</th>
                <th style={{ width: "8.33%" }}>ACOS</th>
                <th style={{ width: "8.33%" }}>Spend</th>
                <th style={{ width: "8.33%" }}>Sales</th>
                <th style={{ width: "8.33%" }}>Reliability</th>
              </tr>
            </thead>
            <tbody>
              {splitWords.map((word, index) => (
                <tr key={index}>
                  <td>{word.word}</td>
                  <td>{word.occurrences}</td>
                  <td>{word.impressions}</td>
                  <td>{word.clicks}</td>
                  <td>{word.orders}</td>
                  <td>
                    {word.acos === 0
                      ? "0.00%"
                      : word.acos === 999
                      ? "∞"
                      : word.acos.toFixed(2) + "%"}
                  </td>
                  <td>${word.spend.toFixed(2)}</td>
                  <td>${word.sales.toFixed(2)}</td>
                  <td>{(word.reliability * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Please upload your search term report to see split word analysis</p>
      )}
    </div>
  );
};

export default WordsTab;
