import { expect, test, describe } from "bun:test";
import { findDefinition } from "./ts-def";
import * as path from "path";

describe("findDefinition", () => {
  const testFilePath = path.join(process.cwd(), "src/ts-def.ts");

  test("should find definition of findDefinition function", () => {
    const result = findDefinition(
      testFilePath,
      "findDefinition",
      "export function findDefinition(filePath: string, symbol: string, line_content?: string) {"
    );

    expect(result).toBeDefined();
    expect(result).toBeArray();
    expect(result![0]).toMatchObject({
      file: testFilePath,
      type: "Definition",
    });
    expect(result![0].location).toContain("Line");
    expect(result![0].codeSnippet).toContain("findDefinition");
  });

  test("should find definition of imported ts namespace", () => {
    const result = findDefinition(
      testFilePath,
      "ts",
      "import * as ts from 'typescript';"
    );

    expect(result).toBeDefined();
    expect(result).toBeArray();
    // The actual file location might vary depending on node_modules location
    expect(result![0].file).toContain("typescript");
    expect(result![0].type).toContain("Definition");
  });

  test("should handle non-existent symbol", () => {
    expect(() => findDefinition(
      testFilePath,
      "nonExistentSymbol",
      "some line content"
    )).toThrow("Symbol \"nonExistentSymbol\" not found in line_content");
  });

  test("should handle invalid file path", () => {
    expect(() => findDefinition(
      "non-existent-file.ts",
      "someSymbol",
      "some content"
    )).toThrow();
  });

  test("should handle missing line_content", () => {
    expect(() => findDefinition(
      testFilePath,
      "someSymbol",
      undefined
    )).toThrow("line_content is required to find the symbol");
  });

  ///    Test external examples ///
  test("should find definition of external namespace", () => {
    const result = findDefinition(
      '/Users/rossz/workspace/rubii/frontend/frontend-order/src/app/mapping/item-detail/item-detail.component.ts',
      "share",
      "this.dateTime = share.helpers.timezone.format(moment.tz(post.created_time).unix() * 1000, this.user.user.tenant.timezone, 'DD/MM/YYYY HH:mm:ss');"
    );

    console.log(result);
  });
}); 