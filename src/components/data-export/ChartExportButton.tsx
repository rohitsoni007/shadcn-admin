import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Image, FileJson } from 'lucide-react';
import { exportChartAsImage, exportToJSON } from '@/lib/data-export';
import { toast } from 'sonner';

interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLDivElement>;
  chartData?: any[];
  filename?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function ChartExportButton({
  chartRef,
  chartData,
  filename = 'chart',
  disabled = false,
  variant = 'outline',
  size = 'sm'
}: ChartExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    if (!chartRef.current) {
      toast.error('Chart not available for export');
      return;
    }

    setIsExporting(true);
    
    try {
      await exportChartAsImage(chartRef.current as HTMLElement, { filename: `${filename}.png` });
      toast.success('Chart exported as image');
    } catch (error) {
      console.error('Chart export error:', error);
      toast.error('Failed to export chart');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportData = () => {
    if (!chartData || !chartData.length) {
      toast.error('No chart data to export');
      return;
    }

    try {
      exportToJSON(chartData, { filename: `${filename}-data.json` });
      toast.success('Chart data exported as JSON');
    } catch (error) {
      console.error('Chart data export error:', error);
      toast.error('Failed to export chart data');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Chart'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportImage}>
          <Image className="h-4 w-4 mr-2" />
          Export as Image
        </DropdownMenuItem>
        {chartData && (
          <DropdownMenuItem onClick={handleExportData}>
            <FileJson className="h-4 w-4 mr-2" />
            Export Data as JSON
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}