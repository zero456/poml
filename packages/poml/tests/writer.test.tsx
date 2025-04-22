import * as React from 'react';

import { describe, expect, test } from '@jest/globals';
import { MarkdownWriter, JsonWriter, MultiMediaWriter, YamlWriter, XmlWriter } from 'poml/writer';
import { readFileSync } from 'fs';
import { ErrorCollection } from 'poml/base';

describe('markdown', () => {
  test('markdownSimple', () => {
    const writer = new MarkdownWriter();
    const testIr = `<p><p>hello <b>world</b><nl count="4"/>hahaha</p><h level="3">heading</h><p>new paragraph <code inline="false"> this code </code></p><code lang="ts">console.log("hello world")</code></p>`;
    const result = writer.write(testIr);
    expect(result).toBe(
      'hello **world**\n\n\n\nhahaha\n\n### heading\n\nnew paragraph \n\n```\n this code \n```\n\n`console.log("hello world")`'
    );
  });

  // test('markdownSpace', () => {
  //   const tests = [
  //     {
  //       ir: '<p>hello <!-- comment --> <b>world</b></p>',
  //       result: 'hello **world**'
  //     },
  //     {
  //       ir: '<p>hello <b>world</b>foo</p>',
  //       result: 'hello **world**foo'
  //     },
  //     {
  //       ir: '<p>hello <nl count="2"/> world</p>',
  //       result: 'hello\n\nworld'
  //     },
  //     {
  //       ir: '<p><p>hello <nl count="1"/></p><p>world</p></p>',
  //       result: 'hello\n\nworld'
  //     },
  //     {
  //       ir: '<p><p>hello</p>  <nl count="3"/>  <!-- --> <p> <!-- --> world</p></p>',
  //       result: 'hello\n\n\nworld'
  //     }
  //   ];

  //   for (const test of tests) {
  //     const writer = new MarkdownWriter();
  //     const result = writer.write(test.ir);
  //     // expect(result).toBe(test.result);
  //     console.log(result);
  //   }
  // })

  test('markdownWithEnv', () => {
    const writer = new MarkdownWriter();
    const testEnv = `<p>hello world<code inline="false"><env presentation="serialize"><any name="hello">world</any></p>`;
    const result = writer.write(testEnv);
    expect(result).toBe('hello world\n\n```\n{\n  "hello": "world"\n}\n```');
  });

  test('markdownSourceMapSimple', () => {
    const writer = new MarkdownWriter();
    const simple = `<p>hello world <b>foo</b></p>`;
    const result = writer.writeWithSourceMap(simple);
    expect(result).toStrictEqual({
      input: '<p>hello world <b>foo</b></p>',
      output: 'hello world **foo**',
      mappings: [
        { inputStart: 15, inputEnd: 24, outputStart: 12, outputEnd: 18 },
        { inputStart: 0, inputEnd: 28, outputStart: 0, outputEnd: 18 }
      ],
      speakers: [{ start: 0, end: 18, speaker: 'human' }],
      multimedia: [],
    });
  });

  test('markdownSourceMapWithSpeaker', () => {
    const writer = new MarkdownWriter();
    const withSpeaker = `<p><p speaker="system">hello world</p><p speaker="human">foo bar</p><p>something</p></p>`;
    const result = writer.writeWithSourceMap(withSpeaker);
    expect(result).toStrictEqual({
      input:
        '<p><p speaker="system">hello world</p><p speaker="human">foo bar</p><p>something</p></p>',
      output: 'hello world\n\nfoo bar\n\nsomething',
      mappings: [
        { inputStart: 3, inputEnd: 37, outputStart: 0, outputEnd: 10 },
        { inputStart: 38, inputEnd: 67, outputStart: 13, outputEnd: 19 },
        { inputStart: 68, inputEnd: 83, outputStart: 22, outputEnd: 30 },
        { inputStart: 0, inputEnd: 87, outputStart: 0, outputEnd: 30 }
      ],
      speakers: [
        { start: 0, end: 10, speaker: 'system' },
        { start: 13, end: 30, speaker: 'human' }
      ],
      multimedia: []
    });
  });
});

describe('serialize', () => {
  test('jsonSimple', () => {
    const writer = new JsonWriter();
    const testIr = `<any><any name="hello">world</any><any name="foo"><any type="integer">123</any><any type="boolean">false</any></any></any>`;
    const result = writer.write(testIr);
    expect(result).toBe('{\n  "hello": "world",\n  "foo": [\n    123,\n    false\n  ]\n}');
  });

  test('jsonDataObject', () => {
    const writer = new JsonWriter();
    const testIr = `<obj data="{&quot;hello&quot;:&quot;world&quot;,&quot;foo&quot;:[123,false]}"/>`;
    const result = writer.write(testIr);
    expect(result).toBe('{\n  "hello": "world",\n  "foo": [\n    123,\n    false\n  ]\n}');
  });

  test('yaml', () => {
    const writer = new YamlWriter();
    const testIr = `<any><any name="hello">world</any><any name="foo"><any type="integer">123</any><any type="boolean">false</any></any></any>`;
    const result = writer.write(testIr);
    expect(result).toBe('hello: world\nfoo:\n  - 123\n  - false');
  });

  test('xml', () => {
    const writer = new XmlWriter();
    const testIr = `<any><any name="hello">world</any><any name="foo"><any type="integer">123</any><any type="boolean">false</any></any></any>`;
    const result = writer.write(testIr);
    expect(result).toBe('<hello>world</hello>\n<foo>\n  <item>123</item>\n  <item>false</item>\n</foo>');
  });

  test('xmlNestMultimedia', async () => {
    const writer = new XmlWriter();
    const base64 = readFileSync(__dirname + '/assets/tomCat.jpg').toString('base64');
    const imageIr = `<env presentation="multimedia"><img base64="${base64}" alt="example"/></env>`;
    const testIr = `<env presentation="serialize" serializer="xml"><any>${imageIr}</any></env>`;
    ErrorCollection.clear();
    writer.write(testIr);
    expect(ErrorCollection.first().message).toMatch('Invalid presentation:');
  });
});

describe('free', () => {
  test('freeText', () => {
    const writer = new MarkdownWriter();
    const testIr = `<env presentation="free">hello\nworld</env>`;
    const result = writer.write(testIr);
    expect(result).toBe('hello\nworld');

    const testIr2 = `<env presentation="free">hello\nworld<text>\n\n</text>hahaha</env>`;
    const result2 = writer.write(testIr2);
    expect(result2).toBe('hello\nworld\n\nhahaha');
  });

  test('textWithEnv', () => {
    const writer = new MarkdownWriter();
    const testIr = `<env presentation="free">hello\nworld<env presentation="serialize"><any name="hello">world</any></env></env>`;
    const result = writer.write(testIr);
    expect(result).toBe('hello\nworld{\n  "hello": "world"\n}');
  })
})

describe('multimedia', () => {
  test('image', () => {
    const writer = new MultiMediaWriter();
    const base64 = readFileSync(__dirname + '/assets/tomCat.jpg').toString('base64');
    const testIr = `<env presentation="multimedia"><img base64="${base64}" alt="example"/></env>`;
    ErrorCollection.clear();
    const result = writer.write(testIr);
    expect(ErrorCollection.empty()).toBe(true);
    expect(result).toStrictEqual([
      { type: 'image', base64, alt: 'example' }
    ]);
  });

  test('imageInText', () => {
    const writer = new MarkdownWriter();
    const base64 = readFileSync(__dirname + '/assets/tomCat.jpg').toString('base64');
    const ir1 = `<env presentation="markup" markup-lang="markdown">hello\nworld<env presentation="multimedia"><img base64="${base64}" alt="example1"/><img base64="${base64}" alt="example2"/></env></env>`;
    ErrorCollection.clear();
    const result1 = writer.write(ir1);
    expect(ErrorCollection.empty()).toBe(true);
    expect(result1).toStrictEqual([
      'hello\nworld',
      { type: 'image', base64, alt: 'example1' },
      { type: 'image', base64, alt: 'example2' }
    ]);

    const ir2 = `<env presentation="markup" markup-lang="markdown">hello\nworld<env presentation="multimedia"><img base64="${base64}" alt="example1"/></env><p>hahaha</p><env presentation="multimedia"><img base64="${base64}" alt="example2"/></env></env>`;
    const result2 = writer.write(ir2);
    expect(result2).toStrictEqual([
      'hello\nworld',
      { type: 'image', base64, alt: 'example1' },
      'hahaha',
      { type: 'image', base64, alt: 'example2' }
    ]);

  });

  test('imagePosition', () => {
    const writer = new MarkdownWriter();
    const base64 = readFileSync(__dirname + '/assets/tomCat.jpg').toString('base64');
    const ir = `<env presentation="markup" markup-lang="markdown">hello<env presentation="multimedia"><img base64="${base64}" alt="example1" position="top"/></env>world<p>foo<env presentation="multimedia"><img base64="${base64}" alt="example2" position="bottom"/></env></p></env>`;
    ErrorCollection.clear();
    const result = writer.write(ir);
    expect(ErrorCollection.empty()).toBe(true);
    expect(result).toStrictEqual([
      { type: 'image', base64, alt: 'example1' },
      'helloworld\n\nfoo',
      { type: 'image', base64, alt: 'example2' }
    ]);
  })
})