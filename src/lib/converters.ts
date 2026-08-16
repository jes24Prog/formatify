import { XMLParser, XMLBuilder } from "fast-xml-parser";
import YAML from "yaml";

const parserOptions = {
  ignoreAttributes: false,
  parseTagValue: false,
  parseAttributeValue: false,
};

const builderOptions = {
  ignoreAttributes: false,
  format: true,
  indentBy: "  ",
  suppressEmptyNode: true,
};

export function convertXmlToJson(xml: string): object {
  const parser = new XMLParser(parserOptions);
  return parser.parse(xml);
}

export function convertJsonToXml(json: string): string {
  const jsonObj = JSON.parse(json);
  const builder = new XMLBuilder(builderOptions);
  return builder.build(jsonObj);
}

export function convertJsonToYaml(json: string): string {
  const jsonObj = JSON.parse(json);
  return YAML.stringify(jsonObj);
}

export function convertYamlToJson(yaml: string): object {
  return YAML.parse(yaml);
}

export function convertXmlToYaml(xml: string): string {
  const jsonObj = convertXmlToJson(xml);
  return YAML.stringify(jsonObj);
}

export function convertYamlToXml(yaml: string): string {
  const jsonObj = convertYamlToJson(yaml);
  return convertJsonToXml(JSON.stringify(jsonObj));
}
