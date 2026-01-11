import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Stack,
  Snackbar,
  Alert,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  AlertColor,
} from '@mui/material';
import { useGridEditor } from './hooks/useGridEditor';
import { GridControls } from './components/GridEditor/GridControls';
import { GridDisplay } from './components/GridEditor/GridDisplay';
import { GridImportExport } from './components/GridEditor/GridImportExport';
import { generateInitialGrid, bresenhamLine, rotateGrid } from './utils/gridUtils';

type Cell = { row: number; col: number };

export default function GridEditor() {
  const {
    grid, setGrid,
    height, setHeight,
    width, setWidth,
    currentHistoryIndex, history,
    pushToHistory, undo, redo
  } = useGridEditor();

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
        undo();
      } else if (isRedo) {
        e.preventDefault();
        redo();
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
  }, [undo, redo, handleDrawingEnd]);

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
    const newGrid = generateInitialGrid(h, w, grid);
    setGrid(newGrid);
    pushToHistory(newGrid, height, width);
  };

  const handleClearGrid = () => {
    const h = parseInt(height, 10);
    const w = parseInt(width, 10);
    const newGrid = generateInitialGrid(h, w);
    setGrid(newGrid);
    pushToHistory(newGrid, height, width);
  };

  const handleRotate = () => {
    const { grid: newGrid, h: newH, w: newW } = rotateGrid(grid);
    const newHeightStr = newH.toString();
    const newWidthStr = newW.toString();
    setHeight(newHeightStr);
    setWidth(newWidthStr);
    setGrid(newGrid);
    pushToHistory(newGrid, newHeightStr, newWidthStr);
  };

  const blurInputs = () => {
    if (document.activeElement === heightInputRef.current || document.activeElement === widthInputRef.current) {
      (document.activeElement as HTMLElement).blur();
    }
  };

  const handleMouseDown = (rowIndex: number, colIndex: number, e: React.MouseEvent<HTMLElement>) => {
    blurInputs();
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
    blurInputs();
    e.preventDefault();
    setIsDrawing(true);
    setMouseButton(0);
    setLastDrawnCell({ row: rowIndex, col: colIndex });
    const newGrid = grid.map((row, rIdx) =>
      row.map((cell, cIdx) =>
        (rIdx === rowIndex && cIdx === colIndex) ? selectedChar : cell
      )
    );
    setGrid(newGrid);
  };

  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (!isDrawing || !lastDrawnCell) return;
    const charToSet = mouseButton === 2 ? '.' : selectedChar;
    const newGrid = bresenhamLine(grid, lastDrawnCell.row, lastDrawnCell.col, rowIndex, colIndex, charToSet);
    setGrid(newGrid);
    setLastDrawnCell({ row: rowIndex, col: colIndex });
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

  const handleLoadGridInput = () => {
    try {
      const lines = loadInput.trim().split('\n');
      if (lines.length < 1) throw new Error('入力が空か、形式が正しくありません。');
      const [hStr, wStr] = lines[0].split(' ');
      const h = parseInt(hStr, 10);
      const w = parseInt(wStr, 10);
      if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) throw new Error('1行目には高さと幅を数値で入力してください。');
      const gridLines = lines.slice(1);
      if (gridLines.length !== h) throw new Error(`行数が一致しません。`);
      const newGrid = gridLines.map(line => line.split(''));
      setHeight(h.toString());
      setWidth(w.toString());
      setGrid(newGrid);
      pushToHistory(newGrid, h.toString(), w.toString());
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

      <GridControls
        height={height} setHeight={setHeight} width={width} setWidth={setWidth}
        onGenerate={handleGenerateGrid} onClear={handleClearGrid} onRotate={handleRotate}
        onUndo={undo} onRedo={redo} canUndo={currentHistoryIndex > 0} canRedo={currentHistoryIndex < history.length - 1}
        onHelpOpen={() => setHelpOpen(true)}
        heightInputRef={heightInputRef} widthInputRef={widthInputRef}
      />

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <Typography variant="subtitle1">選択中の文字:</Typography>
        <Tooltip title="描画する文字を変更します。キーボードの1文字キーでも変更できます。">
          <TextField value={selectedChar} onChange={(e) => setSelectedChar(e.target.value.slice(0, 1))} size="small" sx={{ width: 50 }} inputProps={{ maxLength: 1 }} />
        </Tooltip>
      </Stack>

      <GridDisplay
        grid={grid}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()}
      />

      <GridImportExport
        height={height} width={width} grid={grid}
        loadInput={loadInput} setLoadInput={setLoadInput}
        onCopyClick={handleCopyClick} onLoadGrid={handleLoadGridInput} onShareToX={handleShareToXClick}
      />

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

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}