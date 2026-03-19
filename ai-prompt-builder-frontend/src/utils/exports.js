// Utility functions for exporting comparison data

export const exportToCSV = (data, filename = 'comparison_results.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

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

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToJSON = (data, filename = 'comparison_results.json') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const jsonData = {
    timestamp: new Date().toISOString(),
    comparisonData: data
  };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};