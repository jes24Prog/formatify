import { XMLParser } from 'fast-xml-parser';
import YAML from 'yaml';

export function validateJson(code: string): { isValid: boolean; error?: string } {
  if (code.trim() === '') {
    return { isValid: false, error: 'Input is empty.' };
  }
  try {
    JSON.parse(code);
    return { isValid: true };
  } catch (e: any) {
    return { isValid: false, error: e.message };
  }
}

export function validateXml(code: string): { isValid: boolean; error?: string } {
  if (code.trim() === '') {
    return { isValid: false, error: 'Input is empty.' };
  }
  const parser = new XMLParser();
  const result = parser.parse(code, true); // The second argument enables validation
  if (result === true) {
    return { isValid: true };
  }
  // The parser returns an error object if validation fails, ensure err and msg exist
  return { isValid: false, error: result?.err?.msg || "Invalid XML" };
}

export function validateYaml(code: string): { isValid: boolean; error?: string } {
  if (code.trim() === '') {
    return { isValid: false, error: 'Input is empty.' };
  }
  try {
    const doc = YAML.parseDocument(code);
    if (doc.errors.length > 0) {
      // Return the first error message
      return { isValid: false, error: doc.errors[0].message };
    }
    return { isValid: true };
  } catch (e: any) {
    return { isValid: false, error: e.message };
  }
}
