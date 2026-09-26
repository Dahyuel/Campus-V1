// Uploads real placeholder files for the demo course materials, so "Open
// Document" works on a fresh install instead of pointing at missing objects.
// Files are generated here rather than committed as binaries.

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { crc32 } from 'node:zlib';
import { s3, MATERIALS_BUCKET } from '../plugins/minio.js';

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/** A minimal single-page PDF with a title and body lines. */
export function makePdf(title: string, lines: string[]): Buffer {
  const content = [
    'BT',
    '/F1 20 Tf',
    '60 760 Td',
    `(${escapePdfText(title)}) Tj`,
    '/F1 12 Tf',
    '0 -36 Td',
    ...lines.flatMap((line) => [`(${escapePdfText(line)}) Tj`, '0 -18 Td']),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ' +
      '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

/** A minimal ZIP archive (stored, no compression). */
export function makeZip(entries: Array<{ name: string; content: string }>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const dataBuf = Buffer.from(entry.content, 'utf8');
    const checksum = crc32(dataBuf);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0); // local file header
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0, 6); // flags
    local.writeUInt16LE(0, 8); // stored
    local.writeUInt16LE(0, 10); // time
    local.writeUInt16LE(0x21, 12); // date (1980-01-01)
    local.writeUInt32LE(checksum, 14);
    local.writeUInt32LE(dataBuf.length, 18);
    local.writeUInt32LE(dataBuf.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    locals.push(local, dataBuf);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0); // central directory header
    central.writeUInt16LE(20, 4); // version made by
    central.writeUInt16LE(20, 6); // version needed
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(checksum, 16);
    central.writeUInt32LE(dataBuf.length, 20);
    central.writeUInt32LE(dataBuf.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length + dataBuf.length;
  }

  const centralDir = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); // end of central directory
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDir.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...locals, centralDir, end]);
}

const CONTENT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
};

export interface DemoFile {
  key: string;
  fileName: string;
  body: Buffer;
}

export function buildDemoFiles(): DemoFile[] {
  return [
    {
      key: 'courses/cs-301/materials/CS301_Lecture08_BinaryTrees_Advanced.pdf',
      fileName: 'CS301_Lecture08_BinaryTrees_Advanced.pdf',
      body: makePdf('CS-301 — Lecture 08: Advanced Binary Trees', [
        'Demo course material for the Campus LMS.',
        '',
        'Topics covered in this lecture:',
        '  1. AVL trees and rotation cases (LL, RR, LR, RL)',
        '  2. Height invariants and why insertion stays O(log n)',
        '  3. Red-black trees compared with AVL',
        '  4. Heapify and priority queue operations',
        '',
        'This placeholder is generated during database seeding.',
      ]),
    },
    {
      key: 'courses/math-201/materials/MATH201_Calculus_Practice_Set_03.pdf',
      fileName: 'MATH201_Calculus_Practice_Set_03.pdf',
      body: makePdf('MATH-201 — Practice Set 03', [
        'Demo course material for the Campus LMS.',
        '',
        'Problems:',
        '  1. Solve the linear system by Gaussian elimination.',
        '  2. Find the eigenvalues of the given 3x3 matrix.',
        '  3. Determine whether the vectors are linearly independent.',
        '  4. Compute the determinant using cofactor expansion.',
        '',
        'This placeholder is generated during database seeding.',
      ]),
    },
    {
      key: 'courses/cs-401/materials/CS401_A*Search_Implementation_Guide.zip',
      fileName: 'CS401_A*Search_Implementation_Guide.zip',
      body: makeZip([
        {
          name: 'README.txt',
          content:
            'CS-401 A* Search Implementation Guide\n' +
            '====================================\n\n' +
            'Demo lab archive for the Campus LMS. Generated during seeding.\n\n' +
            'Contents:\n  astar.py — reference implementation\n',
        },
        {
          name: 'astar.py',
          content:
            'import heapq\n\n\n' +
            'def astar(start, goal, neighbors, heuristic):\n' +
            '    """Return the cheapest path from start to goal, or None."""\n' +
            '    frontier = [(heuristic(start, goal), 0, start, [start])]\n' +
            '    visited = set()\n' +
            '    while frontier:\n' +
            '        _, cost, node, path = heapq.heappop(frontier)\n' +
            '        if node == goal:\n' +
            '            return path\n' +
            '        if node in visited:\n' +
            '            continue\n' +
            '        visited.add(node)\n' +
            '        for next_node, step in neighbors(node):\n' +
            '            if next_node in visited:\n' +
            '                continue\n' +
            '            new_cost = cost + step\n' +
            '            priority = new_cost + heuristic(next_node, goal)\n' +
            '            heapq.heappush(\n' +
            '                frontier, (priority, new_cost, next_node, path + [next_node])\n' +
            '            )\n' +
            '    return None\n',
        },
      ]),
    },
  ];
}

/** Uploads the demo files and returns their real sizes, keyed by file name. */
export async function seedDemoFiles(): Promise<Map<string, string>> {
  const sizes = new Map<string, string>();
  for (const file of buildDemoFiles()) {
    const ext = file.fileName.slice(file.fileName.lastIndexOf('.')).toLowerCase();
    await s3.send(
      new PutObjectCommand({
        Bucket: MATERIALS_BUCKET,
        Key: file.key,
        Body: file.body,
        ContentType: CONTENT_TYPES[ext] ?? 'application/octet-stream',
      })
    );
    const kb = Math.max(1, Math.round(file.body.length / 1024));
    sizes.set(file.fileName, `${kb} KB`);
  }
  return sizes;
}
