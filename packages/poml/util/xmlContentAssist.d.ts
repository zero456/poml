// Adapted from https://github.com/SAP/xml-tools/blob/master/packages/content-assist/api.d.ts

import { IToken } from "chevrotain";
import { DocumentCstNode } from "@xml-tools/parser";
import {
  XMLElement,
  XMLDocument,
} from "@xml-tools/ast";

import { SuggestionProviders, ProviderOptions, SuggestionProvider } from "@xml-tools/content-assist";

declare function getSuggestions<OUT>(options: {
  cst: DocumentCstNode;
  ast: XMLDocument;
  offset: number;
  tokenVector: IToken[];
  providers: SuggestionProvidersWithClose<OUT>;
}): OUT[];

declare function getSuggestions<OUT, CONTEXT>(options: {
  cst: DocumentCstNode;
  ast: XMLDocument;
  offset: number;
  tokenVector: IToken[];
  providers: SuggestionProvidersWithClose<OUT, CONTEXT>;
  context: CONTEXT;
}): OUT[];

declare type SuggestionProvidersWithClose<OUT, CONTEXT = undefined> = SuggestionProviders<OUT, CONTEXT> & {
  elementNameClose?: ElementNameCloseCompletion<OUT, CONTEXT>[];
};

declare type ProviderOptionsWithClose<CONTEXT = undefined> = ProviderOptions<CONTEXT> | ElementNameCloseCompletion<CONTEXT>;

declare type ElementNameCloseCompletionOptions<CONTEXT = undefined> = {
  element: XMLElement;
  prefix: string | undefined;

  context: CONTEXT;
};

declare type ElementNameCloseCompletion<
  OUT,
  CONTEXT = undefined
> = SuggestionProvider<ElementNameCloseCompletionOptions<CONTEXT>, OUT, CONTEXT>;
