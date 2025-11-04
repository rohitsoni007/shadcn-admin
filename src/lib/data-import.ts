// Data import utilities for various formats
export type ImportFormat = 'csv' | 'json' | 'excel';

export interface ImportOptions {
  hasHeaders?: boolean;
  delimiter?: string; // For CSV
  encoding?: string;
  maxFileSize?: number; // In bytes
  validateData?: (data: any[]) => { isValid: boolean; errors: string[] };
}

export interface ImportResult {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
  rowCount: number;
}

// File reader utility
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// CSV Import
export async function importFromCSV(file: File, options: ImportOptions = {}): Promise<ImportResult> {
  const {
    hasHeaders = true,
    delimiter = ',',
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    validateData
  } = options;

  try {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        data: [],
        errors: [`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)})`],
        warnings: [],
        rowCount: 0
      };
    }

    const content = await readFile(file);
    const lines = content.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return {
        success: false,
        data: [],
        errors: ['File is empty'],
        warnings: [],
        rowCount: 0
      };
    }

    let headers: string[] = [];
    let dataLines = lines;

    if (hasHeaders) {
      headers = parseCSVLine(lines[0], delimiter);
      dataLines = lines.slice(1);
    } else {
      // Generate generic headers
      const firstLine = parseCSVLine(lines[0], delimiter);
      headers = firstLine.map((_, index) => `Column ${index + 1}`);
    }

    const data: any[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    dataLines.forEach((line, index) => {
      try {
        const values = parseCSVLine(line, delimiter);
        
        if (values.length !== headers.length) {
          warnings.push(`Row ${index + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        }

        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        
        data.push(row);
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    });

    // Validate data if validator provided
    if (validateData) {
      const validation = validateData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
      rowCount: data.length
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      warnings: [],
      rowCount: 0
    };
  }
}

// JSON Import
export async function importFromJSON(file: File, options: ImportOptions = {}): Promise<ImportResult> {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    validateData
  } = options;

  try {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        success: false,
        data: [],
        errors: [`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(maxFileSize)})`],
        warnings: [],
        rowCount: 0
      };
    }

    const content = await readFile(file);
    let data: any;

    try {
      data = JSON.parse(content);
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: ['Invalid JSON format'],
        warnings: [],
        rowCount: 0
      };
    }

    // Ensure data is an array
    if (!Array.isArray(data)) {
      data = [data];
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate data if validator provided
    if (validateData) {
      const validation = validateData(data);
      if (!validation.isValid) {
        errors.push(...validation.errors);
      }
    }

    return {
      success: errors.length === 0,
      data,
      errors,
      warnings,
      rowCount: data.length
    };

  } catch (error) {
    return {
      success: false,
      data: [],
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      warnings: [],
      rowCount: 0
    };
  }
}

// Excel Import (basic support for CSV-like Excel files)
export async function importFromExcel(file: File, options: ImportOptions = {}): Promise<ImportResult> {
  // For now, treat Excel files as CSV (this would need a proper Excel library in production)
  console.warn('Excel import is using CSV parsing. Consider using a proper Excel library like SheetJS for production.');
  return importFromCSV(file, options);
}

// Bulk import with validation
export async function bulkImport(
  files: File[],
  format: ImportFormat,
  options: ImportOptions = {}
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  for (const file of files) {
    let result: ImportResult;
    
    switch (format) {
      case 'csv':
        result = await importFromCSV(file, options);
        break;
      case 'json':
        result = await importFromJSON(file, options);
        break;
      case 'excel':
        result = await importFromExcel(file, options);
        break;
      default:
        result = {
          success: false,
          data: [],
          errors: [`Unsupported format: ${format}`],
          warnings: [],
          rowCount: 0
        };
    }

    results.push(result);
  }

  return results;
}

// Data validation helpers
export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^\+?[\d\s\-\(\)]+$/.test(value),
  url: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  date: (value: string) => !isNaN(Date.parse(value)),
  number: (value: string) => !isNaN(Number(value)),
  required: (value: any) => value !== null && value !== undefined && value !== ''
};

// Create validation function for common data types
export function createValidator(schema: Record<string, Array<keyof typeof validators>>) {
  return (data: any[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      Object.entries(schema).forEach(([field, validations]) => {
        const value = row[field];
        
        validations.forEach(validation => {
          if (!validators[validation](value)) {
            errors.push(`Row ${index + 1}, Field "${field}": ${validation} validation failed`);
          }
        });
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };
}

// Utility functions
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}