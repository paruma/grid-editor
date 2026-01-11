import { generateInitialGrid, rotateGrid, bresenhamLine, encodeGrid, decodeGrid } from './gridUtils';

describe('gridUtils', () => {
  test('rotateGrid rotates 90 degrees clockwise', () => {
    const grid = [['#', '.'], ['#', '#'], ['.', '.']]; // 3x2
    const result = rotateGrid(grid);
    expect(result.h).toBe(2);
    expect(result.w).toBe(3);
    expect(result.grid).toEqual([['.', '#', '#'], ['.', '#', '.']]);
  });

  test('encode/decode maintains grid data', () => {
    const grid = [['#', '.'], ['.', '#']];
    const encoded = encodeGrid(grid);
    const decoded = decodeGrid(2, 2, encoded);
    expect(decoded).toEqual(grid);
  });

  test('bresenhamLine draws a line', () => {
    const grid = [['.', '.'], ['.', '.']];
    const result = bresenhamLine(grid, 0, 0, 1, 1, '#');
    expect(result).toEqual([['#', '.'], ['.', '#']]);
  });
});
