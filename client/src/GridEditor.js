import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';

export default function GridEditor() {
  const [height, setHeight] = useState('6');
  const [width, setWidth] = useState('8');
  const [initialGrid] = useState(() => {
    const initialHeight = parseInt('6', 10);
    const initialWidth = parseInt('8', 10);
    return Array(initialHeight).fill(null).map(() => Array(initialWidth).fill('.'));
  });

  const [grid, setGrid] = useState(initialGrid);
  const [selectedChar, setSelectedChar] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [lastDrawnCell, setLastDrawnCell] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loadInput, setLoadInput] = useState('');

  const [history, setHistory] = useState([initialGrid]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newGridState) => {
    if (JSON.stringify(newGridState) === JSON.stringify(history[currentHistoryIndex])) {
      return;
    }
    const newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(newGridState);
    setHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  }, [history, currentHistoryIndex]);

  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      setGrid(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      setGrid(history[newIndex]);
    }
  }, [currentHistoryIndex, history]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      pushToHistory(grid);
    }
    setIsDrawing(false);
    setMouseButton(null);
    setLastDrawnCell(null);
  }, [isDrawing, grid, pushToHistory]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isUndo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'z';
      const isRedo = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'y';

      if (isUndo) {
        e.preventDefault();
        handleUndo();
      } else if (isRedo) {
        e.preventDefault();
        handleRedo();
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        setSelectedChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleUndo, handleRedo, handleMouseUp]);

  useEffect(() => {
    const handleCopy = (event) => {
      if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        const atcoderFormat = `${height} ${width}\n` + grid.map(row => row.join('')).join('\n') + '\n';
        event.clipboardData.setData('text/plain', atcoderFormat);
        event.preventDefault();
        setSnackbarMessage('コピーしました！');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };

    window.addEventListener('copy', handleCopy);
    return () => window.removeEventListener('copy', handleCopy);
  }, [grid, height, width]);

  const handleGenerateGrid = () => {
    const h = parseInt(height, 10);
    const w = parseInt(width, 10);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('高さと幅は正の整数で入力してください。');
      return;
    }
    const newGrid = Array(h).fill(null).map((_, rIdx) =>
      Array(w).fill(null).map((_, cIdx) => {
        if (rIdx < grid.length && cIdx < (grid[0]?.length || 0)) {
          return grid[rIdx][cIdx];
        } else {
          return '.';
        }
      })
    );
    setGrid(newGrid);
    pushToHistory(newGrid);
  };

  const handleClearGrid = () => {
    const h = parseInt(height, 10);
    const w = parseInt(width, 10);
    const newGrid = Array(h).fill(null).map(() => Array(w).fill('.'));
    setGrid(newGrid);
    pushToHistory(newGrid);
  };

  const handleMouseDown = (rowIndex, colIndex, e) => {
    e.preventDefault();
    setIsDrawing(true);
    setMouseButton(e.button);
    setLastDrawnCell({ row: rowIndex, col: colIndex });
    const charToSet = e.button === 2 ? '.' : selectedChar;
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        (rIdx === rowIndex && cIdx === colIndex) ? charToSet : cell
      )
    );
    setGrid(newGrid);
  };

  const handleMouseEnter = (rowIndex, colIndex) => {
    if (!isDrawing || !lastDrawnCell) return;

    const startRow = lastDrawnCell.row;
    const startCol = lastDrawnCell.col;
    const endRow = rowIndex;
    const endCol = colIndex;
    const charToSet = mouseButton === 2 ? '.' : selectedChar;

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
        newGrid[y][x] = charToSet;
      }
      if (x === endCol && y === endRow) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 < dx) { err += dx; y += sy; }
    }

    setGrid(newGrid);
    setLastDrawnCell({ row: rowIndex, col: colIndex });
  };

  const handleContextMenu = (e) => e.preventDefault();

  const handleCopyClick = () => {
    const textToCopy = `${height} ${width}\n${grid.map(row => row.join('')).join('\n')}\n`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setSnackbarMessage('コピーしました！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }).catch(err => {
      console.error('コピーに失敗しました: ', err);
      setSnackbarMessage('コピーに失敗しました。');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleLoadGridInput = () => {
    try {
      const lines = loadInput.trim().split('\n');
      if (lines.length < 1) throw new Error('Invalid input format');
      const [hStr, wStr] = lines[0].split(' ');
      const h = parseInt(hStr, 10);
      const w = parseInt(wStr, 10);
      if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) throw new Error('Invalid height/width');
      const gridLines = lines.slice(1);
      if (gridLines.length !== h) throw new Error('Grid height mismatch');
      const newGrid = gridLines.map((line, rIdx) => {
        if (line.length !== w) throw new Error(`Row ${rIdx + 1} width mismatch`);
        return line.split('');
      });
      setHeight(h.toString());
      setWidth(w.toString());
      setGrid(newGrid);
      pushToHistory(newGrid);
      setSnackbarMessage('グリッドを読み込みました！');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`エラー: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>グリッドエディタ</Typography>

      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <TextField label="高さ (h)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}}/>
        <TextField label="幅 (w)" type="number" value={width} onChange={(e) => setWidth(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}}/>
        <Button variant="contained" onClick={handleGenerateGrid} sx={{flexShrink: 0}}>サイズ設定</Button>
        <Button variant="outlined" onClick={handleClearGrid} sx={{flexShrink: 0}}>クリア</Button>
        <Box sx={{flexGrow: 1}} />
        <IconButton onClick={handleUndo} disabled={currentHistoryIndex <= 0}><UndoIcon /></IconButton>
        <IconButton onClick={handleRedo} disabled={currentHistoryIndex >= history.length - 1}><RedoIcon /></IconButton>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="subtitle1">選択中の文字:</Typography>
        <TextField value={selectedChar} onChange={(e) => setSelectedChar(e.target.value.slice(0, 1))} size="small" sx={{ width: 50 }} inputProps={{ maxLength: 1 }} />
      </Stack>

      <Box onContextMenu={handleContextMenu}>
        <Grid container spacing={0} direction="column" sx={{ cursor: 'cell' }}>
          {grid.map((row, rowIndex) => (
            <Grid item key={rowIndex}>
              <Grid container spacing={0}>
                {row.map((cell, colIndex) => (
                  <Grid item key={`${rowIndex}-${colIndex}`}>
                    <Box
                      sx={{
                        width: 24, height: 24, border: '1px solid #eee', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem',
                        fontWeight: 'bold', userSelect: 'none',
                        backgroundColor: cell === '#' ? '#e0e0e0' : '#ffffff',
                      }}
                      onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
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

      <Stack direction="row" spacing={2} mt={4} alignItems="center">
        <Typography variant="h6" gutterBottom>競プロ入力形式:</Typography>
        <Button variant="outlined" onClick={handleCopyClick}>コピー</Button>
      </Stack>
      <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
        {`${height} ${width}\n${grid.map(row => row.join('')).join('\n')}`}
      </Box>
      <Stack direction="column" spacing={2} mt={4}>
        <Typography variant="h6" gutterBottom>競プロ入力形式から読み込み:</Typography>
        <TextField
          placeholder={`入力例:\n2 4\n####\n.#.#\n`}
          multiline rows={4} fullWidth variant="outlined" value={loadInput}
          onChange={(e) => setLoadInput(e.target.value)}
          inputProps={{ style: { fontFamily: 'monospace' } }}
        />
        <Button variant="contained" onClick={handleLoadGridInput}>読み込み</Button>
      </Stack>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}