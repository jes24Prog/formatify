import { XMLBuilder, XMLParser } from "fast-xml-parser";
import YAML from "yaml";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(
  value: unknown
): value is null | boolean | number | string {
  return (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

function typeRank(value: unknown): number {
  if (value === null) return 0;
  if (typeof value === "boolean") return 1;
  if (typeof value === "number") return 2;
  return 3;
}

function compareValues(a: unknown, b: unknown): number {
  const rankA = typeRank(a);
  const rankB = typeRank(b);
  if (rankA !== rankB) return rankA - rankB;
  switch (rankA) {
    case 0:
      return 0;
    case 1:
      return a === b ? 0 : a ? 1 : -1;
    case 2:
      return (a as number) - (b as number);
    default:
      return String(a).localeCompare(String(b));
  }
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    const sorted = value.map(sortValue);
    if (sorted.every(isPrimitive)) {
      sorted.sort(compareValues);
    }
    return sorted;
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, child]) => [key, sortValue(child)] as const)
        .sort((a, b) => a[0].localeCompare(b[0]))
    );
  }
  return value;
}

export function sortJson(code: string): string {
  const parsed = JSON.parse(code);
  return JSON.stringify(sortValue(parsed), null, 2);
}

export function sortYaml(code: string): string {
  const parsed = YAML.parse(code);
  return YAML.stringify(sortValue(parsed));
}

type XmlNode = Record<string, unknown>;

function isNonElementNodeKey(key: string): boolean {
  return key.startsWith("#") || key.startsWith(":") || key.startsWith("?");
}

function sortXmlNodes(nodes: unknown[]): unknown[] {
  const others: unknown[] = [];
  const elements: XmlNode[] = [];

  for (const node of nodes) {
    if (!isPlainObject(node)) {
      others.push(node);
      continue;
    }
    const keys = Object.keys(node);
    if (keys.length !== 1 || isNonElementNodeKey(keys[0])) {
      if (keys.length === 1 && keys[0] === "#text") {
        const text = node["#text"];
        if (typeof text === "string" && text.trim() === "") {
          continue;
        }
      }
      others.push(node);
      continue;
    }
    elements.push(node);
  }

  const sortedElements = elements
    .map((node) => sortXmlNode(node))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => entry.node);

  return [...others, ...sortedElements];
}

function sortXmlNode(node: XmlNode): { name: string; node: XmlNode } {
  const name = Object.keys(node)[0];
  const children = node[name];
  if (Array.isArray(children)) {
    node[name] = sortXmlNodes(children);
  }
  return { name, node };
}

export function sortXml(xml: string): string {
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
  });
  const tree = parser.parse(xml) as unknown[];
  const sortedTree = sortXmlNodes(tree);
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    preserveOrder: true,
    format: true,
    indentBy: "  ",
    suppressEmptyNode: true,
  });
  return builder.build(sortedTree);
}
