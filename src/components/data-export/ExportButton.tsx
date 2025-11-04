import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToJSON, exportTableData, type ExportFormat } from '@/lib/data-export';
import { toast } from 'sonner';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  columns?: { key: string; header: string; formatter?: (value: any) => string }[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function ExportButton({
  data,
  filename = 'export',
  columns,
  disabled = false,
  variant = 'outline',
  size = 'sm'
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportFilename = `${filename}.${format === 'excel' ? 'xlsx' : format}`;
      
      if (columns) {
        exportTableData(data, columns, format, { filename: exportFilename });
      } else {
        switch (format) {
          case 'csv':
            exportToCSV(data, { filename: exportFilename });
            break;
          case 'excel':
            exportToExcel(data, { filename: exportFilename });
            break;
          case 'json':
            exportToJSON(data, { filename: exportFilename });
            break;
        }
      }
      
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting || !data.length}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}