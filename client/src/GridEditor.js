import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Stack,
  Snackbar,
  Alert,
} from '@mui/material';

export default function GridEditor() {
  const [height, setHeight] = useState('6');
  const [width, setWidth] = useState('8');
  const [grid, setGrid] = useState(() => {
    const initialHeight = parseInt('6');
    const initialWidth = parseInt('8');
    return Array(initialHeight).fill(null).map(() => Array(initialWidth).fill('.'));
  });
  const [selectedChar, setSelectedChar] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [lastDrawnCell, setLastDrawnCell] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isResizing, setIsResizing] = useState(false);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialMouseY, setInitialMouseY] = useState(0);
  const [initialGridHeight, setInitialGridHeight] = useState(0);
  const [initialGridWidth, setInitialGridWidth] = useState(0);



  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if the event target is an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { // Allow single character input, but not if Ctrl or Cmd is pressed
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

  // Add a useEffect for the copy functionality
  useEffect(() => {
    const handleCopy = (event) => {
      // Only proceed if the copy event is not originating from an input or textarea
      if (
        event.target.tagName !== 'INPUT' &&
        event.target.tagName !== 'TEXTAREA'
      ) {
        const atcoderFormat = `${height} ${width}\n` + grid.map(row => row.join('')).join('\n') + '\n';
        event.clipboardData.setData('text/plain', atcoderFormat);
        event.preventDefault(); // Prevent default copy behavior (e.g., copying selected text)

        // Show snackbar
        setSnackbarMessage('コピーしました！');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };

    window.addEventListener('copy', handleCopy);

    return () => {
      window.removeEventListener('copy', handleCopy);
    };
  }, [grid, height, width]);

  const createEmptyGrid = (h, w) => {
    const newGrid = Array(h).fill(null).map(() => Array(w).fill('.'));
    setGrid(newGrid);
  };

  const handleGenerateGrid = () => {
    const h = parseInt(height);
    const w = parseInt(width);

    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('高さと幅は正の整数で入力してください。');
      return;
    }

    const currentGridHeight = grid.length;
    const currentGridWidth = grid[0] ? grid[0].length : 0;

    const newGrid = Array(h).fill(null).map((_, rIdx) =>
      Array(w).fill(null).map((_, cIdx) => {
        if (rIdx < currentGridHeight && cIdx < currentGridWidth) {
          return grid[rIdx][cIdx];
        } else {
          return '.';
        }
      })
    );
    setGrid(newGrid);
  };

  const handleClearGrid = () => {
    const h = parseInt(height);
    const w = parseInt(width);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      // If height or width are invalid, use current grid dimensions to clear
      const currentGridHeight = grid.length;
      const currentGridWidth = grid[0] ? grid[0].length : 0;
      createEmptyGrid(currentGridHeight, currentGridWidth);
    } else {
      createEmptyGrid(h, w);
    }
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
    setLastDrawnCell({ row: rowIndex, col: colIndex });
    if (e.button === 2) { // Right click
      handleCellClick(rowIndex, colIndex, '.');
    } else { // Left click
      handleCellClick(rowIndex, colIndex);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setMouseButton(null);
    setLastDrawnCell(null);
  };

  const handleMouseEnter = (rowIndex, colIndex) => {
    if (isDrawing && lastDrawnCell) {
      const startRow = lastDrawnCell.row;
      const startCol = lastDrawnCell.col;
      const endRow = rowIndex;
      const endCol = colIndex;

      const cellsToDraw = [];

      // Simple line interpolation (Bresenham-like)
      const dx = Math.abs(endCol - startCol);
      const dy = Math.abs(endRow - startRow);
      const sx = (startCol < endCol) ? 1 : -1;
      const sy = (startRow < endRow) ? 1 : -1;
      let err = dx - dy;

      let x = startCol;
      let y = startRow;

      while (true) {
        cellsToDraw.push({ row: y, col: x });

        if (x === endCol && y === endRow) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }

      const charToSet = mouseButton === 2 ? '.' : selectedChar;
      let newGrid = grid;
      cellsToDraw.forEach(cell => {
        newGrid = newGrid.map((row, rIdx) =>
          row.map((c, cIdx) =>
            (rIdx === cell.row && cIdx === cell.col) ? charToSet : c
          )
        );
      });
      setGrid(newGrid);
      setLastDrawnCell({ row: rowIndex, col: colIndex });
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent default context menu
  };

  const handleCopyClick = () => {
    const textToCopy = `${height} ${width}\n${grid.map(row => row.join('')).join('\n')}\n`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setSnackbarMessage('コピーしました！');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('コピーに失敗しました: ', err);
        setSnackbarMessage('コピーに失敗しました。');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleResizeMouseDown = (e) => {
    setIsResizing(true);
    setInitialMouseX(e.clientX);
    setInitialMouseY(e.clientY);
    setInitialGridHeight(parseInt(height));
    setInitialGridWidth(parseInt(width));
  };

  const handleGlobalMouseMove = (e) => {
    if (!isResizing) return;

    const dx = Math.floor((e.clientX - initialMouseX) / 24); // Assuming 24px cell width
    const dy = Math.floor((e.clientY - initialMouseY) / 24); // Assuming 24px cell height

    let newWidth = Math.max(1, initialGridWidth + dx);
    let newHeight = Math.max(1, initialGridHeight + dy);

    // Update grid content based on new dimensions
    const currentGridHeight = grid.length;
    const currentGridWidth = grid[0] ? grid[0].length : 0;

    const updatedGrid = Array(newHeight).fill(null).map((_, rIdx) =>
      Array(newWidth).fill(null).map((_, cIdx) => {
        if (rIdx < currentGridHeight && cIdx < currentGridWidth) {
          return grid[rIdx][cIdx];
        } else {
          return '.';
        }
      })
    );

    setGrid(updatedGrid);
    setHeight(newHeight.toString());
    setWidth(newWidth.toString());
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
              handleGenerateGrid();
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
              handleGenerateGrid();
            }
          }}
          size="small"
        />
        <Button variant="contained" onClick={handleGenerateGrid}>サイズ設定</Button>
        <Button variant="outlined" onClick={handleClearGrid}>クリア</Button>
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
          <Stack direction="row" spacing={2} mt={4} alignItems="center">
            <Typography variant="h6" gutterBottom>AtCoder形式入力:</Typography>
            <Button variant="outlined" onClick={handleCopyClick}>コピー</Button>
          </Stack>
          <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {`${height} ${width}\n${grid.map(row => row.join('')).join('\n')}`}
          </Box>
        </Box>
      )}

      {grid.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            backgroundColor: '#ccc',
            cursor: 'nwse-resize',
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}