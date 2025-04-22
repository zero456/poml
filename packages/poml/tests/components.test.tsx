import * as React from 'react';

import { describe, expect, test } from '@jest/globals';

import { poml, read, write } from 'poml';
import { readDocx, readDocxFromPath, readPdfFromPath, Document } from 'poml/components/document';
import { readFileSync } from 'fs';
import { ErrorCollection } from 'poml/base';

describe('document', () => {
  test('pdf', async () => {
    const document = await readPdfFromPath(__dirname + '/assets/pdfLatexImage.pdf');
    expect((document.props as any).children).toMatch(/1 Your Chapter\nLorem ipsum dolor sit amet/g);

    const document2 = await readPdfFromPath(__dirname + '/assets/pdfLatexImage.pdf', {
      selectedPages: '1:'
    });
    expect((document2.props as any).children).toMatch('');

    const document3 = await readPdfFromPath(__dirname + '/assets/pdfLatexImage.pdf', {
      selectedPages: ':1'
    });
    expect((document3.props as any).children).toMatch('1 Your Chapter\nLorem ipsum dolor sit amet');
  });

  test('docx', async () => {
    const document = await readDocxFromPath(__dirname + '/assets/sampleWord.docx');
    expect((document.props as any).children.length).toEqual(26);
  });

  test('txt', async () => {
    const document = await poml(<Document buffer={"123\n456"} />);
    expect(document).toBe('123\n456');

    const documentJson = await poml(<Document src={__dirname + '/assets/peopleList.json'} parser='txt' />);
    expect(documentJson).toBe(readFileSync(__dirname + '/assets/peopleList.json', 'utf-8'));
  });

  test('write result', async () => {
    const result = await poml(<Document src={__dirname + '/assets/sampleWord.docx'} />);
    expect(result.length).toEqual(5);
    expect((result[3] as any).base64).toBeTruthy();
    expect(result[4]).toMatch(/without any merged cells:\n\n\| Screen Reader \| Responses \| Share \|\n/g);
  });
});

describe('message', () => {
  test('msg', async () => {
    const text =
      "<poml><system-msg>start</system-msg><ai-msg>hello</ai-msg><human-msg speaker='human'>yes</human-msg></poml>";
    const element = await read(text);
    expect(write(element, { speaker: true })).toStrictEqual([
      { speaker: 'system', content: 'start' },
      { speaker: 'ai', content: 'hello' },
      { speaker: 'human', content: 'yes' }
    ]);
  });

  test('conversation', async () => {
    const text = `<poml>
      <conversation messages="{{[{ speaker: 'human', content: 'What is the capital of France?' }, { speaker: 'ai', content: 'Paris' }]}}" />
    </poml>`;
    const element = await read(text);
    expect(write(element, { speaker: true })).toStrictEqual([
      { speaker: 'human', content: 'What is the capital of France?' },
      { speaker: 'ai', content: 'Paris' }
    ]);
  });

  test('conversation selected', async () => {
    const text = `<poml>
      <conversation messages="{{[{ speaker: 'system', content: 'Be brief and clear in your responses' }, { speaker: 'human', content: 'What is the capital of France?' }, { speaker: 'ai', content: 'Paris' }]}}" selectedMessages="-1:" />
    </poml>`;
    const element = await read(text);
    expect(write(element, { speaker: true })).toStrictEqual([{ speaker: 'ai', content: 'Paris' }]);
  });

  test('conversation with image', async () => {
    const imagePath = __dirname + '/assets/tomCat.jpg';
    const text = `<poml>
      <let name="imagedata" src="${imagePath}" type="buffer" />
      <conversation messages='{{[{"speaker":"human","content":[{"type":"image/jpg","base64":imagedata.toString("base64")}]}]}}' />
    </poml>`;
    ErrorCollection.clear();
    const element = await read(text);
    expect(ErrorCollection.empty()).toBe(true);
    const result = write(element, { speaker: true });
    expect(result.length).toBe(1);
    expect((result[0].content as any)[0].type).toBe('image/jpg');
    expect((result[0].content as any)[0].base64).toBeTruthy();
  });
});

// test('tree', () => {
//   const tree = (
//     <Tree>
//       <TreeItem name='Data Grid'>
//         <TreeItem name='data-grid' />
//         <TreeItem name='data-grid-pro' />
//         <TreeItem name='data-grid-premium' />
//       </TreeItem>
//       <TreeItem name='Date and Time Pickers'>
//         <TreeItem name='date-pickers' />
//         <TreeItem name='date-pickers-pro' />
//       </TreeItem>
//       <TreeItem name='Charts'>
//         <TreeItem name='charts' />
//       </TreeItem>
//       <TreeItem name='Tree View'>
//         <TreeItem name='tree-view' />
//       </TreeItem>
//     </Tree>
//   );
//   expect(render(tree)).toMatch(
//     /^<list stub="tree"><item stub="tree-item">Data Grid<list stub="tree"><item stub="tree-item">data-grid/g
//   );
// });

// test('tree', () => {
//   const treeData: TreeItemData[] = [
//     {
//       name: 'Data Grid',
//       children: [{ name: 'data-grid' }, { name: 'data-grid-pro' }, { name: 'data-grid-premium' }],
//     },
//     {
//       name: 'Date and Time Pickers',
//       children: [{ name: 'date-pickers' }, { name: 'date-pickers-pro' }],
//     },
//     {
//       name: 'Charts',
//       children: [{ name: 'charts' }],
//     },
//     {
//       name: 'Tree View',
//       children: [{ name: 'tree-view' }],
//     },
//   ];
//   const tree = <SimpleTree items={treeData} />;
//   expect(render(tree)).toMatch(
//     /^<list stub="tree"><item stub="tree-item">Data Grid<list stub="tree"><item stub="tree-item">data-grid/g
//   );
// });
