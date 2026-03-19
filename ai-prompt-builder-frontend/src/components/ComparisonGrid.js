import React, { useState, useEffect } from 'react';
import { getModelById } from '../config/models';
import { formatDuration, formatTokens, formatCost } from '../utils/formatters';
import { exportToCSV, exportToJSON } from '../utils/exports';

const ComparisonGrid = ({ results, comparisonResults, primaryModel }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(new Set(['responseTime', 'tokens', 'cost']));
  const [chartType, setChartType] = useState('bar');

  const getComparisonData = () => {
    const data = [];
    const primaryResult = results;

    // Include primary result
    if (primaryResult) {
      data.push({
        model: getModelById(primaryModel)?.name || 'Primary',
        responseTime: primaryResult.responseTime,
        tokens: primaryResult.tokens || 0,
        cost: primaryResult.cost || 0,
        response: primaryResult.response,
        isPrimary: true
      });
    }

    // Include comparison results
    Object.keys(comparisonResults).forEach(modelId => {
      const result = comparisonResults[modelId];
      if (result && result.response) {
        data.push({
          model: getModelById(modelId)?.name || modelId,
          responseTime: result.responseTime,
          tokens: result.tokens || 0,
          cost: result.cost || 0,
          response: result.response,
          isPrimary: false
        });
      }
    });

    return data;
  };

  const metricsData = getComparisonData();

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => {
      const newMetrics = new Set(prev);
      if (newMetrics.has(metric)) {
        newMetrics.delete(metric);
      } else {
        newMetrics.add(metric);
      }
      return newMetrics;
    });
  };

  const renderMetricRow = (metric, label, formatter) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-right">
          {metricsData.map((item, index) => (
            <span
              key={item.model}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.isPrimary ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {formatter(item[metric])}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const handleExportCSV = () => {
    exportToCSV(metricsData, 'comparison_results.csv');
  };

  const handleExportJSON = () => {
    exportToJSON(metricsData, 'comparison_results.json');
  };

  const renderChart = () => {
    if (metricsData.length < 2) return null;

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="font-medium text-sm">Visual Comparison</h5>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          {/* Simple chart representation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['responseTime', 'tokens', 'cost'].map((metric) => (
              <div key={metric}>
                <div className="font-medium text-xs mb-1">{metric}</div>
                <div className="flex items-center gap-2">
                  {metricsData.map((item) => (
                    <div
                      key={item.model}
                      className="flex-1 bg-blue-500 rounded-full h-4"
                      style={{
                        width: `${(item[metric] || 0) / Math.max(...metricsData.map(d => d[metric] || 1)) * 100}%`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-green-600">analytics</span>
        Advanced Comparison
      </h4>

      {/* Metrics Selection */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {['responseTime', 'tokens', 'cost'].map((metric) => (
            <button
              key={metric}
              onClick={() => handleMetricToggle(metric)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedMetrics.has(metric)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {metric}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">Select metrics to compare</p>
      </div>

      {/* Metrics Table */}
      <div className="mb-6">
        {selectedMetrics.has('responseTime') && renderMetricRow('responseTime', 'Response Time', formatDuration)}
        {selectedMetrics.has('tokens') && renderMetricRow('tokens', 'Token Count', formatTokens)}
        {selectedMetrics.has('cost') && renderMetricRow('cost', 'Estimated Cost', formatCost)}
      </div>

      {/* Charts */}
      {renderChart()}

      {/* Export Options */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h5 className="font-medium text-sm mb-3">Export Results</h5>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComparisonGrid;