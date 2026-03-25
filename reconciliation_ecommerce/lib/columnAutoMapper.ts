import { CanonicalField, ColumnMap, AutoMapResult, FieldDefinition } from './types';

/**
 * Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  // Exact match
  if (s1 === s2) return 100;
  
  // Contains match
  if (s1.includes(s2) || s2.includes(s1)) return 90;
  
  // Levenshtein distance
  const maxLen = Math.max(s1.length, s2.length);
  const distance = levenshteinDistance(s1, s2);
  const similarity = ((maxLen - distance) / maxLen) * 100;
  
  return Math.max(0, similarity);
}

/**
 * Find best match for a canonical field among CSV headers
 */
function findBestMatch(
  field: FieldDefinition,
  headers: string[],
  threshold: number = 70
): { header: string; confidence: number } | null {
  let bestMatch: { header: string; confidence: number } | null = null;
  
  for (const header of headers) {
    for (const variation of field.variations) {
      const confidence = calculateSimilarity(header, variation);
      
      if (confidence >= threshold && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { header, confidence };
      }
    }
  }
  
  return bestMatch;
}

/**
 * Auto-map CSV headers to canonical fields
 */
export function autoMapColumns(
  headers: string[],
  requiredFields: FieldDefinition[],
  optionalFields: FieldDefinition[] = []
): AutoMapResult {
  const mapping: ColumnMap = {};
  const confidence: Record<string, number> = {};
  const unmapped: CanonicalField[] = [];
  const suggestions: Record<string, Array<{ header: string; confidence: number }>> = {};
  
  const allFields = [...requiredFields, ...optionalFields];
  const usedHeaders = new Set<string>();
  
  // High confidence pass (>= 85%)
  for (const field of allFields) {
    const match = findBestMatch(field, headers, 85);
    
    if (match && !usedHeaders.has(match.header)) {
      mapping[field.id] = match.header;
      confidence[field.id] = match.confidence;
      usedHeaders.add(match.header);
    }
  }
  
  // Medium confidence pass (70-84%)
  for (const field of allFields) {
    if (mapping[field.id]) continue;
    
    const match = findBestMatch(
      field,
      headers.filter(h => !usedHeaders.has(h)),
      70
    );
    
    if (match && !usedHeaders.has(match.header)) {
      mapping[field.id] = match.header;
      confidence[field.id] = match.confidence;
      usedHeaders.add(match.header);
    }
  }
  
  // Collect unmapped required fields
  for (const field of requiredFields) {
    if (!mapping[field.id]) {
      unmapped.push(field.id);
      
      // Generate suggestions
      const candidates: Array<{ header: string; confidence: number }> = [];
      for (const header of headers) {
        if (usedHeaders.has(header)) continue;
        
        for (const variation of field.variations) {
          const conf = calculateSimilarity(header, variation);
          if (conf >= 50) {
            candidates.push({ header, confidence: conf });
          }
        }
      }
      
      suggestions[field.id] = candidates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
    }
  }
  
  return {
    mapping,
    confidence,
    unmapped,
    suggestions
  };
}

/**
 * Validate that all required fields are mapped
 */
export function validateMapping(
  mapping: ColumnMap,
  requiredFields: FieldDefinition[]
): { valid: boolean; missing: CanonicalField[] } {
  const missing: CanonicalField[] = [];
  
  for (const field of requiredFields) {
    if (!mapping[field.id]) {
      missing.push(field.id);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Get required fields for a file type
 */
export function getRequiredFields(platform: string, fileType: string): FieldDefinition[] {
  // This will be populated from platformConfigs
  return [];
}

/**
 * Get optional fields for a file type
 */
export function getOptionalFields(platform: string, fileType: string): FieldDefinition[] {
  // This will be populated from platformConfigs
  return [];
}
