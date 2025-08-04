
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AlertColor,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GitHubIcon from '@mui/icons-material/GitHub';
import XIcon from '@mui/icons-material/X';

const MAX_HISTORY_COUNT = 100;

type GridType = string[][];
type HistoryState = {
  grid: GridType;
  height: string;
  width: string;
};
type Cell = {
  row: number;
  col: number;
};

export default function GridEditor() {
  const [height, setHeight] = useState('6');
  const [width, setWidth] = useState('8');
  const [grid, setGrid] = useState<GridType>(() => {
    const initialHeight = parseInt('6', 10);
    const initialWidth = parseInt('8', 10);
    return Array(initialHeight).fill(null).map(() => Array(initialWidth).fill('.'));
  });

  const [selectedChar, setSelectedChar] = useState('#');
  const [isDrawing, setIsDrawing] = useState(false);
  const [mouseButton, setMouseButton] = useState<number | null>(null);
  const [lastDrawnCell, setLastDrawnCell] = useState<Cell | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>('success');
  const [loadInput, setLoadInput] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const heightInputRef = useRef<HTMLInputElement>(null);
  const widthInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<HistoryState[]>([{ grid, height, width }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const pushToHistory = useCallback((newGrid: GridType, newHeight: string, newWidth: string) => {
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

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const h = params.get('h');
      const w = params.get('w');
      const encodedData = params.get('data');

      if (h && w && encodedData) {
        const newHeight = parseInt(h, 10);
        const newWidth = parseInt(w, 10);

        let data = encodedData.replace(/-/g, '+').replace(/_/g, '/');
        const decodedData = atob(data);

        if (!isNaN(newHeight) && !isNaN(newWidth) && newHeight > 0 && newWidth > 0 && decodedData.length === newHeight * newWidth) {
          const newGrid: GridType = [];
          for (let i = 0; i < newHeight; i++) {
            newGrid.push(decodedData.substring(i * newWidth, (i + 1) * newWidth).split(''));
          }
          
          setHeight(h);
          setWidth(w);
          setGrid(newGrid);

          const initialState = { grid: newGrid, height: h, width: w };
          setHistory([initialState]);
          setCurrentHistoryIndex(0);
        }
      }
    } catch (error: any) {
      console.error("Failed to decode grid data from URL:", error);
      // エラーが発生した場合は、デフォルトのグリッドでアプリケーションを初期化します。
    }
  }, []);

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

  const handleDrawingEnd = useCallback(() => {
    if (isDrawing) {
      pushToHistory(grid, height, width);
    }
    setIsDrawing(false);
    setMouseButton(null);
    setLastDrawnCell(null);
  }, [isDrawing, grid, height, width, pushToHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
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
    window.addEventListener('mouseup', handleDrawingEnd);
    window.addEventListener('touchend', handleDrawingEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mouseup', handleDrawingEnd);
      window.removeEventListener('touchend', handleDrawingEnd);
    };
  }, [handleUndo, handleRedo, handleDrawingEnd]);

  useEffect(() => {
    const handleCopy = (event: ClipboardEvent) => {
      if ((event.target as HTMLElement).tagName !== 'INPUT' && (event.target as HTMLElement).tagName !== 'TEXTAREA') {
        const atcoderFormat = `${height} ${width}\n` + grid.map(row => row.join('')).join('\n') + '\n';
        event.clipboardData!.setData('text/plain', atcoderFormat);
        event.preventDefault();
        setSnackbarMessage('コピーしました！');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      }
    };

    const listener = (e: Event) => handleCopy(e as ClipboardEvent);

    window.addEventListener('copy', listener);
    return () => window.removeEventListener('copy', listener);
  }, [grid, height, width]);

  const handleGenerateGrid = () => {
    const h = parseInt(height, 10);
    const w = parseInt(width, 10);
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
      alert('高さと幅は正の整数で入力してください。');
      return;
    }
    const newGrid: GridType = Array(h).fill(null).map((_, rIdx) =>
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
    const newGrid: GridType = Array(h).fill(null).map(() => Array(w).fill('.'));
    setGrid(newGrid);
    pushToHistory(newGrid, height, width);
  };

  const handleRotate = () => {
    const currentHeight = parseInt(height, 10);
    const currentWidth = parseInt(width, 10);
    const newHeight = currentWidth;
    const newWidth = currentHeight;

    const newGrid: GridType = Array(newHeight).fill(null).map(() => Array(newWidth).fill('.'));

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

  const handleMouseDown = (rowIndex: number, colIndex: number, e: React.MouseEvent<HTMLElement>) => {
    if (document.activeElement === heightInputRef.current || document.activeElement === widthInputRef.current) {
      (document.activeElement as HTMLElement).blur();
    }
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

  const handleTouchStart = (rowIndex: number, colIndex: number, e: React.TouchEvent<HTMLElement>) => {
    if (document.activeElement === heightInputRef.current || document.activeElement === widthInputRef.current) {
      (document.activeElement as HTMLElement).blur();
    }
    e.preventDefault();
    setIsDrawing(true);
    setMouseButton(0); // Treat all touches as left-click
    setLastDrawnCell({ row: rowIndex, col: colIndex });
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        (rIdx === rowIndex && cIdx === colIndex) ? selectedChar : cell
      )
    );
    setGrid(newGrid);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const rowIndex = parseInt(element.getAttribute('data-row') || '-1', 10);
      const colIndex = parseInt(element.getAttribute('data-col') || '-1', 10);

      if (rowIndex !== -1 && colIndex !== -1) {
        handleMouseEnter(rowIndex, colIndex);
      }
    }
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
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

  const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => e.preventDefault();

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

  const handleShareToXClick = () => {
    const gridData = grid.map(row => row.join('')).join('');
    const encodedData = btoa(gridData).replace(/\+/g, '-').replace(/\//g, '_');

    const params = new URLSearchParams();
    params.set('h', height);
    params.set('w', width);
    params.set('data', encodedData);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    const text = "Grid Editor でグリッドを作ったよ！";
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=GridEditor`;
    window.open(tweetUrl, '_blank');
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const handleLoadGridInput = () => {
    try {
      const lines = loadInput.trim().split('\n');
      if (lines.length < 1) throw new Error('入力が空か、形式が正しくありません。');
      const [hStr, wStr] = lines[0].split(' ');
      const h = parseInt(hStr, 10);
      const w = parseInt(wStr, 10);
      if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) throw new Error('高さと幅の指定が正しくありません。入力の1行目に、2つの正の整数をスペース区切りで指定してください。例: 6 8');
      const gridLines = lines.slice(1);
      if (gridLines.length !== h) throw new Error(`入力で指定された高さ(${h})と、実際のグリッドの行数(${gridLines.length})が異なります。`);
      const newGrid: GridType = gridLines.map((line, rIdx) => {
        if (line.length !== w) throw new Error(`グリッドの${rIdx + 1}行目の文字数(${line.length})が、入力で指定された幅(${w})と一致しません。`);
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
    } catch (error: any) {
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
          <TextField label="高さ (h)" type="number" value={height} onChange={(e) => setHeight(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}} inputRef={heightInputRef}/>
        </Tooltip>
        <Tooltip title="グリッドの幅を設定します">
          <TextField label="幅 (w)" type="number" value={width} onChange={(e) => setWidth(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateGrid()} size="small" sx={{flexShrink: 0}} inputRef={widthInputRef}/>
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
        <Tooltip title="GitHubリポジトリを見る">
          <IconButton href="https://github.com/paruma/grid-editor" target="_blank" rel="noopener noreferrer"><GitHubIcon /></IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="subtitle1">選択中の文字:</Typography>
        <Tooltip title="描画する文字を変更します。キーボードの1文字キーでも変更できます。">
          <TextField value={selectedChar} onChange={(e) => setSelectedChar(e.target.value.slice(0, 1))} size="small" sx={{ width: 50 }} inputProps={{ maxLength: 1 }} />
        </Tooltip>
      </Stack>

      <Box onContextMenu={handleContextMenu} onTouchMove={handleTouchMove} sx={{ touchAction: 'none' }}>
        <Grid container spacing={0} direction="column" sx={{ cursor: 'cell' }}>
          {grid.map((row, rowIndex) => (
            <Grid key={rowIndex}>
              <Grid container spacing={0}>
                {row.map((cell, colIndex) => (
                  <Grid key={`${rowIndex}-${colIndex}`}>
                    <Box
                      data-row={rowIndex}
                      data-col={colIndex}
                      sx={{
                        width: 24, height: 24, border: '1px solid #eee', display: 'flex',
                        justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem',
                        fontWeight: 'bold', userSelect: 'none',
                        backgroundColor: cell === '#' ? '#e0e0e0' : '#ffffff',
                      }}
                      onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                      onTouchStart={(e) => handleTouchStart(rowIndex, colIndex, e)}
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
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="現在のグリッドをXでシェアします">
            <IconButton onClick={handleShareToXClick}><XIcon /></IconButton>
          </Tooltip>
        </Stack>
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
