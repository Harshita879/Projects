'use client';

import { useState, useEffect } from 'react';
import { ColumnMap, AutoMapResult, FieldDefinition } from '@/lib/types';
import { autoMapColumns, validateMapping } from '@/lib/columnAutoMapper';
import { readCSVHeaders } from '@/lib/csvParser';

interface ColumnMapperProps {
  file: File;
  requiredFields: FieldDefinition[];
  optionalFields: FieldDefinition[];
  onMappingComplete: (columnMap: ColumnMap) => void;
  delimiter?: string;
}

export default function ColumnMapper({
  file,
  requiredFields,
  optionalFields,
  onMappingComplete,
  delimiter = ','
}: ColumnMapperProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<ColumnMap>({});
  const [autoMapResult, setAutoMapResult] = useState<AutoMapResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHeadersAndAutoMap();
  }, [file]);

  async function loadHeadersAndAutoMap() {
    setLoading(true);
    try {
      const csvHeaders = await readCSVHeaders(file, delimiter);
      setHeaders(csvHeaders);

      const result = autoMapColumns(csvHeaders, requiredFields, optionalFields);
      setAutoMapResult(result);
      setColumnMap(result.mapping);
      
      // If all required fields mapped with high confidence, auto-complete
      if (result.unmapped.length === 0) {
        onMappingComplete(result.mapping);
      }
    } catch (error) {
      console.error('Failed to read CSV headers:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleFieldMapping(fieldId: string, header: string) {
    const newMap = { ...columnMap };
    if (header === '') {
      delete newMap[fieldId as keyof ColumnMap];
    } else {
      newMap[fieldId as keyof ColumnMap] = header;
    }
    setColumnMap(newMap);
  }

  function handleApplyMapping() {
    const validation = validateMapping(columnMap, requiredFields);
    if (validation.valid) {
      onMappingComplete(columnMap);
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
        <div className="text-[#999] text-sm">Reading CSV headers...</div>
      </div>
    );
  }

  const validation = validateMapping(columnMap, requiredFields);

  return (
    <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h3 className="text-[#e8e8e8] text-sm font-medium">Map CSV Columns</h3>
          <p className="text-[#666] text-xs mt-1">
            {validation.valid 
              ? `All required fields mapped (${Object.keys(columnMap).length} fields)`
              : `${validation.missing.length} required field${validation.missing.length > 1 ? 's' : ''} missing`
            }
          </p>
        </div>
        
        <button
          onClick={handleApplyMapping}
          disabled={!validation.valid}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            validation.valid
              ? 'bg-white text-black hover:bg-[#e8e8e8]'
              : 'bg-[#1a1a1a] text-[#666] cursor-not-allowed'
          }`}
        >
          Apply Mapping
        </button>
      </div>

      {/* Field Mappings */}
      <div className="p-4 space-y-3">
        {/* Required Fields */}
        {requiredFields.map((field) => (
          <FieldMappingRow
            key={field.id}
            field={field}
            headers={headers}
            selectedHeader={columnMap[field.id] || ''}
            confidence={autoMapResult?.confidence[field.id]}
            suggestions={autoMapResult?.suggestions[field.id] || []}
            onChange={(header) => handleFieldMapping(field.id, header)}
          />
        ))}

        {/* Optional Fields */}
        {optionalFields.length > 0 && (
          <div className="pt-3 border-t border-[#1a1a1a]">
            <div className="text-[#666] text-xs uppercase tracking-wide mb-3">
              Optional Fields
            </div>
            {optionalFields.map((field) => (
              <FieldMappingRow
                key={field.id}
                field={field}
                headers={headers}
                selectedHeader={columnMap[field.id] || ''}
                confidence={autoMapResult?.confidence[field.id]}
                suggestions={autoMapResult?.suggestions[field.id] || []}
                onChange={(header) => handleFieldMapping(field.id, header)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {!validation.valid && (
        <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
          <div className="text-[#ff4444] text-xs">
            Missing required fields: {validation.missing.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldMappingRow({
  field,
  headers,
  selectedHeader,
  confidence,
  suggestions,
  onChange
}: {
  field: FieldDefinition;
  headers: string[];
  selectedHeader: string;
  confidence?: number;
  suggestions: Array<{ header: string; confidence: number }>;
  onChange: (header: string) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <label className="text-[#e8e8e8] text-sm font-medium">
            {field.label}
            {field.required && <span className="text-[#ff4444] ml-1">*</span>}
          </label>
          {confidence !== undefined && (
            <span className={`text-xs ${
              confidence >= 90 ? 'text-[#00D4A3]' : 
              confidence >= 70 ? 'text-[#ffaa00]' : 
              'text-[#666]'
            }`}>
              {confidence.toFixed(0)}% match
            </span>
          )}
        </div>
        <p className="text-[#666] text-xs">{field.description}</p>
      </div>

      <select
        value={selectedHeader}
        onChange={(e) => onChange(e.target.value)}
        className="bg-[#0a0a0a] border border-[#1a1a1a] rounded px-3 py-2 text-sm text-[#e8e8e8] w-64 focus:outline-none focus:border-[#0099FF]"
      >
        <option value="">Not mapped</option>
        {headers.map((header) => (
          <option key={header} value={header}>
            {header}
          </option>
        ))}
      </select>
    </div>
  );
}

