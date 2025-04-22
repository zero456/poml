import * as vscode from 'vscode';

export function isPomlFile(document: vscode.TextDocument) {
  return document.languageId === 'spml';
}
