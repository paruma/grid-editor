import React from 'react';
import { Box, Grid } from '@mui/material';

interface GridDisplayProps {
  grid: string[][];
  onMouseDown: (r: number, c: number, e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter: (r: number, c: number) => void;
  onTouchStart: (r: number, c: number, e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  onContextMenu: (e: React.MouseEvent<HTMLElement>) => void;
}

export const GridDisplay: React.FC<GridDisplayProps> = ({
  grid, onMouseDown, onMouseEnter, onTouchStart, onTouchMove, onContextMenu
}) => {
  return (
    <Box onContextMenu={onContextMenu} onTouchMove={onTouchMove} sx={{ touchAction: 'none', overflowX: 'auto' }}>
      <Grid container spacing={0} direction="column" sx={{ cursor: 'cell', width: 'fit-content' }}>
        {grid.map((row, rowIndex) => (
          <Grid key={rowIndex} item>
            <Grid container spacing={0} sx={{ flexWrap: 'nowrap' }}>
              {row.map((cell, colIndex) => (
                <Grid key={`${rowIndex}-${colIndex}`} item>
                  <Box
                    data-row={rowIndex}
                    data-col={colIndex}
                    sx={{
                      width: 24, height: 24, border: '1px solid #eee', display: 'flex',
                      justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem',
                      fontWeight: 'bold', userSelect: 'none',
                      backgroundColor: cell === '#' ? '#e0e0e0' : '#ffffff',
                    }}
                    onMouseDown={(e) => onMouseDown(rowIndex, colIndex, e)}
                    onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
                    onTouchStart={(e) => onTouchStart(rowIndex, colIndex, e)}
                  >
                    {cell}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
