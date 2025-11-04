import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { importFromCSV, importFromJSON, importFromExcel, type ImportResult, type ImportOptions } from '@/lib/data-import';
import { toast } from 'sonner';

interface ImportDialogProps {
  onImport: (data: any[]) => void;
  acceptedFormats?: string[];
  maxFileSize?: number;
  validateData?: (data: any[]) => { isValid: boolean; errors: string[] };
  children?: React.ReactNode;
}

export function ImportDialog({
  onImport,
  acceptedFormats = ['.csv', '.json', '.xlsx'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  validateData,
  children
}: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [options, setOptions] = useState<ImportOptions>({
    hasHeaders: true,
    delimiter: ',',
    maxFileSize,
    validateData
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  }, []);

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      let result: ImportResult;
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();

      switch (fileExtension) {
        case 'csv':
          result = await importFromCSV(selectedFile, options);
          break;
        case 'json':
          result = await importFromJSON(selectedFile, options);
          break;
        case 'xlsx':
        case 'xls':
          result = await importFromExcel(selectedFile, options);
          break;
        default:
          throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      setImportResult(result);

      if (result.success) {
        toast.success(`Successfully imported ${result.rowCount} rows`);
      } else {
        toast.error('Import completed with errors');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import file');
      setImportResult({
        success: false,
        data: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        rowCount: 0
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.success && importResult.data.length > 0) {
      onImport(importResult.data);
      setIsOpen(false);
      setSelectedFile(null);
      setImportResult(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload a file to import data. Supported formats: {acceptedFormats.join(', ')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="options">Import Options</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File</Label>
              <Input
                id="file-upload"
                type="file"
                accept={acceptedFormats.join(',')}
                onChange={handleFileSelect}
                disabled={isImporting}
              />
              {selectedFile && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                  <Badge variant="secondary">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              )}
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Label>Importing...</Label>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {importResult && (
              <div className="space-y-3">
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {importResult.success
                      ? `Successfully processed ${importResult.rowCount} rows`
                      : `Import failed with ${importResult.errors.length} errors`}
                  </AlertDescription>
                </Alert>

                {importResult.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Warnings:</div>
                        {importResult.warnings.slice(0, 5).map((warning, index) => (
                          <div key={index} className="text-sm">{warning}</div>
                        ))}
                        {importResult.warnings.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {importResult.warnings.length - 5} more warnings
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <div className="font-medium">Errors:</div>
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <div key={index} className="text-sm">{error}</div>
                        ))}
                        {importResult.errors.length > 5 && (
                          <div className="text-sm text-muted-foreground">
                            ... and {importResult.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="has-headers">File has headers</Label>
                <Switch
                  id="has-headers"
                  checked={options.hasHeaders}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, hasHeaders: checked }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delimiter">CSV Delimiter</Label>
                <Input
                  id="delimiter"
                  value={options.delimiter}
                  onChange={(e) =>
                    setOptions(prev => ({ ...prev, delimiter: e.target.value }))
                  }
                  placeholder=","
                  maxLength={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Max File Size</Label>
                <div className="text-sm text-muted-foreground">
                  {(maxFileSize / 1024 / 1024).toFixed(0)} MB maximum
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import'}
            </Button>
          )}
          {importResult && importResult.success && (
            <Button onClick={handleConfirmImport}>
              Confirm Import ({importResult.rowCount} rows)
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}