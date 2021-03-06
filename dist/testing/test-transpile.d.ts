import * as d from '../declarations';
import ts from 'typescript';
export declare function transpile(input: string, opts?: ts.CompilerOptions, sourceFilePath?: string): d.TranspileResults;
export declare function getCompilerOptions(rootDir: string): ts.CompilerOptions;
export declare function formatDiagnostic(diagnostic: d.Diagnostic): string;
