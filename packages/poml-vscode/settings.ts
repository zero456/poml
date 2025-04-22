import * as vscode from 'vscode';

export type LanguageModelProvider = 'openai' | 'microsoft' | 'anthropic' | 'google';

export interface LanguageModelSetting {
  provider: LanguageModelProvider;
  model: string;
  temperature?: number;
  apiKey?: string;
  apiUrl?: string;
  apiVersion?: string;
  maxTokens?: number;
}

/**
 * Settings for the extension.
 */
export class Settings {
  public static getForResource(resource: vscode.Uri) {
    return new Settings(resource);
  }

  public readonly scrollBeyondLastLine: boolean;
  public readonly wordWrap: boolean;
  public readonly previewFrontMatter: string;
  public readonly lineBreaks: boolean;
  public readonly doubleClickToSwitchToEditor: boolean;
  public readonly scrollEditorWithPreview: boolean;
  public readonly scrollPreviewWithEditor: boolean;
  public readonly markEditorSelection: boolean;
  public readonly languageModel: LanguageModelSetting;

  public readonly styles: string[];

  private constructor(resource: vscode.Uri) {
    const editorSettings = vscode.workspace.getConfiguration('editor', resource);
    const pomlSettings = vscode.workspace.getConfiguration('poml', resource);
    const pomlEditorSettings = vscode.workspace.getConfiguration('[poml]', resource);

    this.scrollBeyondLastLine = editorSettings.get<boolean>('scrollBeyondLastLine', false);

    this.wordWrap = editorSettings.get<string>('wordWrap', 'off') !== 'off';
    if (pomlEditorSettings && pomlEditorSettings['editor.wordWrap']) {
      this.wordWrap = pomlEditorSettings['editor.wordWrap'] !== 'off';
    }

    this.previewFrontMatter = pomlSettings.get<string>('previewFrontMatter', 'hide');
    this.scrollPreviewWithEditor = !!pomlSettings.get<boolean>('preview.scrollPreviewWithEditor', true);
    this.scrollEditorWithPreview = !!pomlSettings.get<boolean>('preview.scrollEditorWithPreview', true);
    this.lineBreaks = !!pomlSettings.get<boolean>('preview.breaks', false);
    this.doubleClickToSwitchToEditor = !!pomlSettings.get<boolean>('preview.doubleClickToSwitchToEditor', true);
    this.markEditorSelection = !!pomlSettings.get<boolean>('preview.markEditorSelection', true);

    this.languageModel = {
      provider: pomlSettings.get<LanguageModelProvider>('languageModel.provider', 'openai'),
      model: pomlSettings.get<string>('languageModel.model', ''),
      temperature: pomlSettings.get<number>('languageModel.temperature', 0.5),
      apiKey: pomlSettings.get<string>('languageModel.apiKey', '') || undefined,
      apiUrl: pomlSettings.get<string>('languageModel.apiUrl', '') || undefined,
      apiVersion: pomlSettings.get<string>('languageModel.apiVersion', '') || undefined,
      maxTokens: pomlSettings.get<number>('languageModel.maxTokens', 0) || undefined,
    }

    this.styles = pomlSettings.get<string[]>('styles', []);
  }

  public isEqualTo(otherSettings: Settings) {
    for (let key in this) {
      if (this.hasOwnProperty(key) && key !== 'styles' && key !== 'languageModel') {
        if (this[key] !== otherSettings[key]) {
          return false;
        }
      }
    }

    // Check styles
    if (this.styles.length !== otherSettings.styles.length) {
      return false;
    }
    for (let i = 0; i < this.styles.length; ++i) {
      if (this.styles[i] !== otherSettings.styles[i]) {
        return false;
      }
    }

    // Check language model properties
    if (!otherSettings.languageModel) {
      return false;
    }
    for (const prop in this.languageModel) {
      if ((this.languageModel as any)[prop] !== (otherSettings.languageModel as any)[prop]) {
        return false;
      }
    }

    return true;
  }

  [key: string]: any;
}

export class SettingsManager {
  private readonly previewSettingsForWorkspaces = new Map<string, Settings>();

  public loadAndCacheSettings(
    resource: vscode.Uri
  ): Settings {
    const config = Settings.getForResource(resource);
    this.previewSettingsForWorkspaces.set(this.getKey(resource), config);
    return config;
  }

  public hasSettingsChanged(
    resource: vscode.Uri
  ): boolean {
    const key = this.getKey(resource);
    const currentSettings = this.previewSettingsForWorkspaces.get(key);
    const newSettings = Settings.getForResource(resource);
    return (!currentSettings || !currentSettings.isEqualTo(newSettings));
  }

  private getKey(
    resource: vscode.Uri
  ): string {
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    return folder ? folder.uri.toString() : '';
  }
}
