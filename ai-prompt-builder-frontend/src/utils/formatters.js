// Utility functions for formatting comparison metrics

export const formatDuration = (ms) => {
  if (ms === null || ms === undefined) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

export const formatTokens = (tokens) => {
  if (tokens === null || tokens === undefined) return 'N/A';
  if (tokens < 1000) return `${tokens}`;
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(1)}M`;
};

export const formatCost = (cost) => {
  if (cost === null || cost === undefined) return 'N/A';
  if (cost === 0) return '$0.00';
  if (cost < 0.01) return '< $0.01';
  return `$${cost.toFixed(2)}`;
};

export const formatPercentage = (value, total) => {
  if (!total || total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatCSV = (data) => {
  const headers = ['Model', 'Response Time (ms)', 'Tokens', 'Cost'];
  const rows = data.map(item => [
    item.model,
    item.responseTime || '',
    item.tokens || '',
    item.cost || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    ''
  ].join('\n');

  return csvContent;
};