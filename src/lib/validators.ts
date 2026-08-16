import { SyntaxValidator } from "fast-xml-validator";
import YAML from "yaml";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateJson(code: string): ValidationResult {
  if (code.trim() === "") {
    return { isValid: false, error: "Input is empty." };
  }
  try {
    JSON.parse(code);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: getErrorMessage(error) };
  }
}

export function validateXml(code: string): ValidationResult {
  if (code.trim() === "") {
    return { isValid: false, error: "Input is empty." };
  }
  try {
    SyntaxValidator.validate(code);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: getErrorMessage(error) };
  }
}

export function validateYaml(code: string): ValidationResult {
  if (code.trim() === "") {
    return { isValid: false, error: "Input is empty." };
  }
  try {
    const doc = YAML.parseDocument(code);
    if (doc.errors.length > 0) {
      return { isValid: false, error: doc.errors[0].message };
    }
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: getErrorMessage(error) };
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
