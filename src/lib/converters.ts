
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import YAML from 'yaml';

export function convertXmlToJson(xml: string): object {
  const parser = new XMLParser();
  const jsonObj = parser.parse(xml);
  return jsonObj;
}

export function convertJsonToXml(json: string): string {
  const jsonObj = JSON.parse(json);
  const builder = new XMLBuilder({
    format: true,
    indentBy: '  ',
    suppressUnpairedNode: true,
    unpairedTags: [],
  });
  const xmlContent = builder.build(jsonObj);
  return xmlContent;
}

export function convertJsonToYaml(json: string): string {
  const jsonObj = JSON.parse(json);
  return YAML.stringify(jsonObj);
}

export function convertYamlToJson(yaml: string): object {
  return YAML.parse(yaml);
}
