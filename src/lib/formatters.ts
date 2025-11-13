import prettier from 'prettier/standalone';
import * as prettierPluginBabel from 'prettier/plugins/babel';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import xmlFormatter from 'xml-formatter';
import YAML from 'yaml';

export async function formatJson(code: string): Promise<string> {
  // Ensure the input is parsed as JSON, this also validates it.
  JSON.parse(code); 
  const formatted = await prettier.format(code, {
    parser: 'json',
    plugins: [prettierPluginBabel, prettierPluginEstree],
    printWidth: 80,
    tabWidth: 2,
  });
  return formatted;
}

export function formatXml(code: string): string {
  const formatted = xmlFormatter(code, {
    indentation: '  ',
    collapseContent: true,
    lineSeparator: '\n',
  });
  return formatted;
}

export function formatYaml(code: string): string {
  // Parsing and re-stringifying with the library effectively formats it.
  const doc = YAML.parse(code);
  return YAML.stringify(doc);
}
