// Data export utilities for various formats
export type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';

export interface ExportOptions {
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  delimiter?: string; // For CSV
}

// CSV Export
export function exportToCSV(data: any[], options: ExportOptions = {}) {
  const {
    filename = 'export.csv',
    includeHeaders = true,
    delimiter = ','
  } = options;

  if (!data.length) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  const csvContent = [];

  // Add headers if requested
  if (includeHeaders) {
    csvContent.push(headers.join(delimiter));
  }

  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Handle special characters and quotes
      if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    });
    csvContent.push(values.join(delimiter));
  });

  downloadFile(csvContent.join('\n'), filename, 'text/csv');
}

// JSON Export
export function exportToJSON(data: any[], options: ExportOptions = {}) {
  const { filename = 'export.json' } = options;
  
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// Excel Export (using a simple XML format that Excel can read)
export function exportToExcel(data: any[], options: ExportOptions = {}) {
  const { filename = 'export.xlsx', includeHeaders = true } = options;

  if (!data.length) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(data[0]);
  
  // Create XML content for Excel
  let xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Sheet1">
<Table>`;

  // Add headers
  if (includeHeaders) {
    xmlContent += '<Row>';
    headers.forEach(header => {
      xmlContent += `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`;
    });
    xmlContent += '</Row>';
  }

  // Add data rows
  data.forEach(row => {
    xmlContent += '<Row>';
    headers.forEach(header => {
      const value = row[header];
      const type = typeof value === 'number' ? 'Number' : 'String';
      xmlContent += `<Cell><Data ss:Type="${type}">${escapeXml(String(value ?? ''))}</Data></Cell>`;
    });
    xmlContent += '</Row>';
  });

  xmlContent += '</Table></Worksheet></Workbook>';

  downloadFile(xmlContent, filename, 'application/vnd.ms-excel');
}

// Chart Export (as image)
export async function exportChartAsImage(chartElement: HTMLElement, options: ExportOptions = {}) {
  const { filename = 'chart.png' } = options;

  try {
    // Use html2canvas if available, otherwise fall back to basic method
    if (typeof window !== 'undefined' && 'html2canvas' in window) {
      const canvas = await (window as any).html2canvas(chartElement);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } else {
      // Fallback: export chart data as JSON
      console.warn('html2canvas not available, exporting chart data as JSON');
      const chartData = extractChartData(chartElement);
      exportToJSON([chartData], { filename: filename.replace('.png', '.json') });
    }
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart');
  }
}

// Table Export with advanced options
export function exportTableData(
  data: any[],
  columns: { key: string; header: string; formatter?: (value: any) => string }[],
  format: ExportFormat,
  options: ExportOptions = {}
) {
  // Transform data based on column configuration
  const transformedData = data.map(row => {
    const transformedRow: any = {};
    columns.forEach(col => {
      const value = row[col.key];
      transformedRow[col.header] = col.formatter ? col.formatter(value) : value;
    });
    return transformedRow;
  });

  switch (format) {
    case 'csv':
      exportToCSV(transformedData, options);
      break;
    case 'excel':
      exportToExcel(transformedData, options);
      break;
    case 'json':
      exportToJSON(transformedData, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// Utility functions
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractChartData(chartElement: HTMLElement): any {
  // Try to extract data from common chart libraries
  const chartInstance = (chartElement as any).__chart__;
  if (chartInstance) {
    return {
      type: 'chart',
      data: chartInstance.data || {},
      options: chartInstance.options || {}
    };
  }
  
  return {
    type: 'chart',
    element: chartElement.outerHTML,
    timestamp: new Date().toISOString()
  };
}