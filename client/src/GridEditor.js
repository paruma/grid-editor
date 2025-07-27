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
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const MAX_HISTORY_COUNT = 100;

export default function GridEditor() {
  const [height, setHeight] = useState('6');
  const [width, setWidth] = useState('8');
  const [grid, setGrid] = useState(() => {
    const initialHeight = parseInt('6', 10);
    const initialWidth = parseInt('8', 10);
    return Array(initialHeight).fill(null).map(() => Array(initialWidth).fill('.'));
  });

  const [selectedChar, setSelectedChar] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mouseButton, setMouseButton] = useState(null);
  const [lastDrawnCell, setLastDrawnCell] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loadInput, setLoadInput] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);

  const [history, setHistory] = useState([{ grid, height, width }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newGrid, newHeight, newWidth) => {
    const newState = { grid: newGrid, height: newHeight, width: newWidth };
    const currentSate = history[currentHistoryIndex];

    if (JSON.stringify(newState) === JSON.stringify(currentSate)) {
      return;
    }

    let newHistory = history.slice(0, currentHistoryIndex + 1);
    newHistory.push(newState);

    if (newHistory.length > MAX_HISTORY_COUNT) {
      newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_COUNT);
    }

    const newIndex = newHistory.length - 1;

    setHistory(newHistory);
    setCurrentHistoryIndex(newIndex);
  }, [history, currentHistoryIndex]);

  const handleUndo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setGrid(previousState.grid);
      setHeight(previousState.height);
      setWidth(previousState.width);
    }
  }, [currentHistoryIndex, history]);

  const handleRedo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setGrid(nextState.grid);
      setHeight(nextState.height);
      setWidth(nextState.width);
    }
  }, [currentHistoryIndex, history]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      pushToHistory(grid, height, width);
    }
    setIsDrawing(false);
    setMouseButton(null);
    setLastDrawnCell(null);
  }, [isDrawing, grid, height, width, pushToHistory]);

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
    pushToHistory(newGrid, height, width);
  };

  const handleClearGrid = () => {
    const h = parseInt(height, 10);
    const w = parseInt(width, 10);
    const newGrid = Array(h).fill(null).map(() => Array(w).fill('.'));
    setGrid(newGrid);
    pushToHistory(newGrid, height, width);
  };

  const handleRotate = () => {
    const currentHeight = parseInt(height, 10);
    const currentWidth = parseInt(width, 10);
    const newHeight = currentWidth;
    const newWidth = currentHeight;

    const newGrid = Array(newHeight).fill(null).map(() => Array(newWidth).fill('.'));

    for (let r = 0; r < currentHeight; r++) {
      for (let c = 0; c < currentWidth; c++) {
        newGrid[c][newWidth - 1 - r] = grid[r][c];
      }
    }

    const newHeightStr = newHeight.toString();
    const newWidthStr = newWidth.toString();

    setHeight(newHeightStr);
    setWidth(newWidthStr);
    setGrid(newGrid);
    pushToHistory(newGrid, newHeightStr, newWidthStr);
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
      const newHeight = h.toString();
      const newWidth = w.toString();
      setHeight(newHeight);
      setWidth(newWidth);
      setGrid(newGrid);
      pushToHistory(newGrid, newHeight, newWidth);
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
        <Tooltip title="グリッドの高さを設定します">
          <TextField label="高さ (h)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}}/>
        </Tooltip>
        <Tooltip title="グリッドの幅を設定します">
          <TextField label="幅 (w)" type="number" value={width} onChange={(e) => setWidth(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}}/>
        </Tooltip>
        <Tooltip title="グリッドを現在の高さと幅にリサイズします">
          <Button variant="contained" onClick={handleGenerateGrid} sx={{flexShrink: 0}}>サイズ設定</Button>
        </Tooltip>
        <Tooltip title="グリッドの内容をすべて '.' にリセットします">
          <Button variant="outlined" onClick={handleClearGrid} sx={{flexShrink: 0}}>クリア</Button>
        </Tooltip>
        <Tooltip title="グリッドを時計回りに90度回転します">
          <IconButton onClick={handleRotate}><Rotate90DegreesCwIcon /></IconButton>
        </Tooltip>
        <Box sx={{flexGrow: 1}} />
        <Tooltip title="元に戻す (Ctrl+Z)">
          <IconButton onClick={handleUndo} disabled={currentHistoryIndex <= 0}><UndoIcon /></IconButton>
        </Tooltip>
        <Tooltip title="やり直す (Ctrl+Y)">
          <IconButton onClick={handleRedo} disabled={currentHistoryIndex >= history.length - 1}><RedoIcon /></IconButton>
        </Tooltip>
        <Tooltip title="ヘルプを表示します">
          <IconButton onClick={() => setHelpOpen(true)}><HelpOutlineIcon /></IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="subtitle1">選択中の文字:</Typography>
        <Tooltip title="描画する文字を変更します。キーボードの1文字キーでも変更できます。">
          <TextField value={selectedChar} onChange={(e) => setSelectedChar(e.target.value.slice(0, 1))} size="small" sx={{ width: 50 }} inputProps={{ maxLength: 1 }} />
        </Tooltip>
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
        <Tooltip title="現在のグリッドを競プロ形式でクリップボードにコピーします (Ctrl+C)">
          <Button variant="outlined" onClick={handleCopyClick}>コピー</Button>
        </Tooltip>
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
        <Tooltip title="入力されたテキストを解釈してグリッドに反映します">
          <Button variant="contained" onClick={handleLoadGridInput}>読み込み</Button>
        </Tooltip>
      </Stack>

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>グリッドエディタの使い方</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <Typography variant="h6" gutterBottom>マウス操作</Typography>
            <ul>
              <li><b>左クリック/ドラッグ:</b> 選択中の文字でグリッドを描画します。</li>
              <li><b>右クリック/ドラッグ:</b> グリッドを「.」で消去します。</li>
            </ul>
            <Typography variant="h6" gutterBottom>キーボードショートカット</Typography>
            <ul>
              <li><b>Ctrl/Cmd + Z:</b> 操作を元に戻します (Undo)。</li>
              <li><b>Ctrl/Cmd + Y:</b> 操作をやり直します (Redo)。</li>
              <li><b>Ctrl/Cmd + C:</b> 表示されている競プロ形式のテキストをコピーします。</li>
              <li><b>任意の1文字キー:</b> 選択中の文字（描画に使う文字）を変更します。</li>
            </ul>
            <Typography variant="h6" gutterBottom>その他</Typography>
            <ul>
              <li><b>サイズ設定:</b> 指定した高さと幅でグリッドをリサイズします。</li>
              <li><b>クリア:</b> グリッド全体を「.」で埋めます。</li>
              <li><b>回転:</b> グリッド全体を時計回りに90度回転します。</li>
              <li><b>読み込み:</b> テキストエリアの入力からグリッドを生成します。</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}