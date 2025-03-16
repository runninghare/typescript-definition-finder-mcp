#!/usr/bin/env node

import * as ts from 'typescript';
import { readFileSync, existsSync } from 'fs';

export function findDefinition(filePath: string, line: number, column: number, projectPath?: string) {
  let results: Record<string, any>[] = []; 
  try {
    const fileContent = readFileSync(filePath, 'utf8');
    
    // Create the language service host
    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => [filePath],
      getScriptVersion: () => '1',
      getScriptSnapshot: (fileName) => {
        if (fileName === filePath) {
          return ts.ScriptSnapshot.fromString(fileContent);
        }
        if (existsSync(fileName)) {
          return ts.ScriptSnapshot.fromString(readFileSync(fileName, 'utf8'));
        }
        return undefined;
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => ({
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      }),
      getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
    };

    // Create the language service
    const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
    
    // Get source file and find position
    const sourceFile = services.getProgram()?.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error('Could not get source file');
    }

    const position = sourceFile.getPositionOfLineAndCharacter(line - 1, column - 1);
    
    // Try to get definition
    const definitions = services.getDefinitionAtPosition(filePath, position);
    
    if (!definitions || definitions.length === 0) {
      // Try to get type definition instead
      const typeDefinitions = services.getTypeDefinitionAtPosition(filePath, position);
      if (!typeDefinitions || typeDefinitions.length === 0) {
        // Get quick info as a fallback
        const quickInfo = services.getQuickInfoAtPosition(filePath, position);
        if (quickInfo) {
          console.log('Quick Info:');
          console.log(`Kind: ${quickInfo.kind}`);
          console.log(`Documentation: ${ts.displayPartsToString(quickInfo.documentation)}`);
          console.log(`Type: ${ts.displayPartsToString(quickInfo.displayParts)}`);
        } else {
          console.log('No definition or information found at the specified position');
        }
        return;
      }
      logDefinitions(typeDefinitions, 'Type Definition', services, results);
      return;
    }

    logDefinitions(definitions, 'Definition', services, results);
    return results;
  } catch (error) {
    console.error('Error finding definition:', error instanceof Error ? error.message : String(error));
  }
}

function logDefinitions(
  definitions: readonly ts.DefinitionInfo[],
  definitionType: string,
  services: ts.LanguageService,
  resultStr: Record<string, any>[]
) {
    // resultStr += `\nFound ${definitions.length} ${definitionType}(s):\n`;

  definitions.forEach((def, index) => {
    // resultStr += `\n${definitionType} ${index + 1}:\n`;
    const result: Record<string, any> = {
        file: def.fileName,
        type: definitionType,
    }
    // resultStr += `File: ${def.fileName}\n`;

    // Read the file content
    const content = existsSync(def.fileName) ? readFileSync(def.fileName, 'utf8') : null;
    if (!content) {
    //   resultStr += 'Could not read file contents\n';
      return;
    }

    // Create a source file for position calculations
    const sourceFile = ts.createSourceFile(
      def.fileName,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Get start and end positions
    const start = sourceFile.getLineAndCharacterOfPosition(def.textSpan.start);
    const end = sourceFile.getLineAndCharacterOfPosition(def.textSpan.start + def.textSpan.length);

    result.location = `Line ${start.line + 1}, Column ${start.character + 1}`;
    // resultStr += `Location: Line ${start.line + 1}, Column ${start.character + 1}\n`;

    // Split content into lines and find the definition
    const lines = content.split('\n');
    const startLine = start.line;
    let endLine = end.line;

    // Try to find the complete definition by looking at structure
    const baseIndent = getIndentation(lines[startLine]);
    for (let i = endLine + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim() === '') continue;
      const indent = getIndentation(line);
      if (indent <= baseIndent) {
        break;
      }
      endLine = i;
    }

    // Add some context
    const contextBefore = 1;
    const contextAfter = 1;
    const displayStartLine = Math.max(0, startLine - contextBefore);
    const displayEndLine = Math.min(lines.length - 1, endLine + contextAfter);

    // resultStr += '\nDefinition:\n';
    let codeSnippet = '';
    for (let i = displayStartLine; i <= displayEndLine; i++) {
      const lineNum = (i + 1).toString().padStart(4);
      const marker = i === startLine ? ' >' : i > startLine && i <= endLine ? ' +' : '  ';
      codeSnippet += `${lineNum}${marker} ${lines[i]}\n`;
    }
    result.codeSnippet = codeSnippet;
    resultStr.push(result);
  });
}

function getIndentation(line: string): number {
  const match = line.match(/^[\s\t]*/);
  return match ? match[0].length : 0;
} 