import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Stack,
} from '@mui/material';

export default function GridEditor() {
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [grid, setGrid] = useState([]);
  const [selectedChar, setSelectedChar] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mouseButton, setMouseButton] = useState(null); // New state to track which mouse button is pressed

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if the event target is an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key.length === 1) { // Allow single character input
        setSelectedChar(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
      setMouseButton(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const createEmptyGrid = () => {
    const h = parseInt(height);
    const w = parseInt(width);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('高さと幅は正の整数で入力してください。');
      return;
    }

    const newGrid = Array(h).fill(null).map(() => Array(w).fill('.'));
    setGrid(newGrid);
  };

  const handleCellClick = (rowIndex, colIndex, charToSet = selectedChar) => {
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        (rIdx === rowIndex && cIdx === colIndex) ? charToSet : cell
      )
    );
    setGrid(newGrid);
  };

  const handleMouseDown = (rowIndex, colIndex, e) => {
    setMouseButton(e.button);
    setIsDrawing(true);
    if (e.button === 2) { // Right click
      handleCellClick(rowIndex, colIndex, '.');
    } else { // Left click
      handleCellClick(rowIndex, colIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setMouseButton(null);
  };

  const handleMouseEnter = (rowIndex, colIndex) => {
    if (isDrawing) {
      if (mouseButton === 2) { // Right click drawing
        handleCellClick(rowIndex, colIndex, '.');
      } else { // Left click drawing
        handleCellClick(rowIndex, colIndex);
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent default context menu
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>グリッドエディタ</Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          label="高さ (h)"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              createEmptyGrid();
            }
          }}
          size="small"
        />
        <TextField
          label="幅 (w)"
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              createEmptyGrid();
            }
          }}
          size="small"
        />
        <Button variant="contained" onClick={createEmptyGrid}>グリッド生成</Button>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="subtitle1">選択中の文字:</Typography>
        <TextField
          value={selectedChar}
          onChange={(e) => setSelectedChar(e.target.value.slice(0, 1))}
          size="small"
          sx={{ width: 50 }}
          inputProps={{ maxLength: 1 }}
        />
      </Stack>

      {grid.length > 0 && (
        <Box sx={{ mt: 4 }} onMouseLeave={handleMouseUp}> {/* Add onMouseLeave to stop drawing when mouse leaves grid area */}
          <Typography variant="h6" gutterBottom>生成されたグリッド:</Typography>
          <Grid container spacing={0} direction="column">
            {grid.map((row, rowIndex) => (
              <Grid item key={rowIndex}>
                <Grid container spacing={0}>
                  {row.map((cell, colIndex) => (
                    <Grid item key={`${rowIndex}-${colIndex}`}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          border: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          userSelect: 'none',
                          backgroundColor: cell === '#' ? '#e0e0e0' : '#ffffff', // Background color for #
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                        onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                        onMouseUp={handleMouseUp}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onContextMenu={handleContextMenu}
                      >
                        {cell}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>AtCoder形式入力:</Typography>
          <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {`${height} ${width}\n${grid.map(row => row.join('')).join('\n')}`}
          </Box>
        </Box>
      )}
    </Container>
  );
}
