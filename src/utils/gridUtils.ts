export type GridType = string[][];

export const generateInitialGrid = (h: number, w: number, currentGrid?: GridType): GridType => {
  return Array(h).fill(null).map((_, rIdx) =>
    Array(w).fill(null).map((_, cIdx) => {
      if (currentGrid && rIdx < currentGrid.length && cIdx < (currentGrid[0]?.length || 0)) {
        return currentGrid[rIdx][cIdx];
      }
      return '.';
    })
  );
};

export const rotateGrid = (grid: GridType): { grid: GridType; h: number; w: number } => {
  const currentHeight = grid.length;
  const currentWidth = grid[0]?.length || 0;
  const newHeight = currentWidth;
  const newWidth = currentHeight;
  const newGrid: GridType = Array(newHeight).fill(null).map(() => Array(newWidth).fill('.'));

  for (let r = 0; r < currentHeight; r++) {
    for (let c = 0; c < currentWidth; c++) {
      newGrid[c][newWidth - 1 - r] = grid[r][c];
    }
  }
  return { grid: newGrid, h: newHeight, w: newWidth };
};

export const bresenhamLine = (
  grid: GridType,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  char: string
): GridType => {
  const newGrid = grid.map(r => [...r]);
  const dx = Math.abs(endCol - startCol);
  const dy = Math.abs(endRow - startRow);
  const sx = (startCol < endCol) ? 1 : -1;
  const sy = (startRow < endRow) ? 1 : -1;
  let err = dx - dy;
  let x = startCol;
  let y = startRow;

  while (true) {
    if (y >= 0 && y < newGrid.length && x >= 0 && x < newGrid[0].length) {
      newGrid[y][x] = char;
    }
    if (x === endCol && y === endRow) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return newGrid;
};

export const encodeGrid = (grid: GridType): string => {
  const data = grid.map(row => row.join('')).join('');
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_');
};

export const decodeGrid = (h: number, w: number, encodedData: string): GridType => {
  let data = encodedData.replace(/-/g, '+').replace(/_/g, '/');
  const decodedData = atob(data);
  const newGrid: GridType = [];
  for (let i = 0; i < h; i++) {
    newGrid.push(decodedData.substring(i * w, (i + 1) * w).split(''));
  }
  return newGrid;
};
