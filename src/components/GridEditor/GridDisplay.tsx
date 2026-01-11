import React, { memo } from 'react';
import { Box, Grid } from '@mui/material';

interface GridCellProps {
  cell: string;
  rowIndex: number;
  colIndex: number;
  onMouseDown: (r: number, c: number, e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (r: number, c: number) => void;
  onTouchStart: (r: number, c: number, e: React.TouchEvent<HTMLElement>) => void;
}

const GridCell = memo(
  ({ cell, rowIndex, colIndex, onMouseDown, onMouseEnter, onTouchStart }: GridCellProps) => {
    return (
      <Box
        data-row={rowIndex}
        data-col={colIndex}
        sx={{
          width: 24,
          height: 24,
          border: '1px solid #eee',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          userSelect: 'none',
          backgroundColor: cell === '#' ? '#e0e0e0' : '#ffffff',
        }}
        onMouseDown={(e) => onMouseDown(rowIndex, colIndex, e)}
        onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
        onTouchStart={(e) => onTouchStart(rowIndex, colIndex, e)}
      >
        {cell}
      </Box>
    );
  }
);

GridCell.displayName = 'GridCell';

interface GridRowProps {
  row: string[];
  rowIndex: number;
  onMouseDown: (r: number, c: number, e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (r: number, c: number) => void;
  onTouchStart: (r: number, c: number, e: React.TouchEvent<HTMLElement>) => void;
}

const GridRow = memo(({ row, rowIndex, onMouseDown, onMouseEnter, onTouchStart }: GridRowProps) => {
  return (
    <Grid container spacing={0} sx={{ flexWrap: 'nowrap' }}>
      {row.map((cell, colIndex) => (
        <Grid key={`${rowIndex}-${colIndex}`}>
          <GridCell
            cell={cell}
            rowIndex={rowIndex}
            colIndex={colIndex}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onTouchStart={onTouchStart}
          />
        </Grid>
      ))}
    </Grid>
  );
});

GridRow.displayName = 'GridRow';

interface GridDisplayProps {
  grid: string[][];
  onMouseDown: (r: number, c: number, e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (r: number, c: number) => void;
  onTouchStart: (r: number, c: number, e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
}

export const GridDisplay: React.FC<GridDisplayProps> = memo(
  ({ grid, onMouseDown, onMouseEnter, onTouchStart, onTouchMove, onContextMenu }) => {
    return (
      <Box
        onContextMenu={onContextMenu}
        onTouchMove={onTouchMove}
        sx={{ touchAction: 'none', overflowX: 'auto' }}
      >
        <Grid
          container
          spacing={0}
          direction="column"
          sx={{ cursor: 'cell', width: 'fit-content' }}
        >
          {grid.map((row, rowIndex) => (
            <Grid key={rowIndex}>
              <GridRow
                row={row}
                rowIndex={rowIndex}
                onMouseDown={onMouseDown}
                onMouseEnter={onMouseEnter}
                onTouchStart={onTouchStart}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }
);

GridDisplay.displayName = 'GridDisplay';
