
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

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
