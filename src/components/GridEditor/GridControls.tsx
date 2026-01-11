import React from 'react';
import { Stack, Tooltip, TextField, Button, IconButton, Box } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import Rotate90DegreesCwIcon from '@mui/icons-material/Rotate90DegreesCw';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import GitHubIcon from '@mui/icons-material/GitHub';

interface GridControlsProps {
  height: string;
  setHeight: (h: string) => void;
  width: string;
  setWidth: (w: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  onRotate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onHelpOpen: () => void;
  heightInputRef: React.RefObject<HTMLInputElement | null>;
  widthInputRef: React.RefObject<HTMLInputElement | null>;
}

export const GridControls: React.FC<GridControlsProps> = ({
  height,
  setHeight,
  width,
  setWidth,
  onGenerate,
  onClear,
  onRotate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onHelpOpen,
  heightInputRef,
  widthInputRef,
}) => {
  return (
    <Stack direction="row" spacing={1} mb={2} alignItems="center">
      <Tooltip title="グリッドの高さを設定します">
        <TextField
          label="高さ (h)"
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          size="small"
          sx={{ flexShrink: 0 }}
          inputRef={heightInputRef}
        />
      </Tooltip>
      <Tooltip title="グリッドの幅を設定します">
        <TextField
          label="幅 (w)"
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
          size="small"
          sx={{ flexShrink: 0 }}
          inputRef={widthInputRef}
        />
      </Tooltip>
      <Tooltip title="グリッドを現在の高さと幅にリサイズします">
        <Button variant="contained" onClick={onGenerate} sx={{ flexShrink: 0 }}>
          サイズ設定
        </Button>
      </Tooltip>
      <Tooltip title="グリッドの内容をすべて '.' にリセットします">
        <Button variant="outlined" onClick={onClear} sx={{ flexShrink: 0 }}>
          クリア
        </Button>
      </Tooltip>
      <Tooltip title="グリッドを時計回りに90度回転します">
        <IconButton onClick={onRotate}>
          <Rotate90DegreesCwIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1 }} />
      <Tooltip title="元に戻す (Ctrl+Z)">
        <IconButton onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="やり直す (Ctrl+Y)">
        <IconButton onClick={onRedo} disabled={!canRedo}>
          <RedoIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="ヘルプを表示します">
        <IconButton onClick={onHelpOpen}>
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="GitHubリポジトリを見る">
        <IconButton
          href="https://github.com/paruma/grid-editor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
