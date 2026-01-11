import React from 'react';
import { Stack, Typography, Tooltip, Button, Box, TextField, IconButton } from '@mui/material';
import XIcon from '@mui/icons-material/X';

interface GridImportExportProps {
  height: string;
  width: string;
  grid: string[][];
  loadInput: string;
  setLoadInput: (val: string) => void;
  onCopyClick: () => void;
  onLoadGrid: () => void;
  onShareToX: () => void;
}

export const GridImportExport: React.FC<GridImportExportProps> = ({
  height,
  width,
  grid,
  loadInput,
  setLoadInput,
  onCopyClick,
  onLoadGrid,
  onShareToX,
}) => {
  return (
    <>
      <Stack direction="row" spacing={2} mt={4} alignItems="center">
        <Typography variant="h6" gutterBottom>
          競プロ入力形式:
        </Typography>
        <Tooltip title="現在のグリッドを競プロ形式でクリップボードにコピーします (Ctrl+C)">
          <Button variant="outlined" onClick={onCopyClick}>
            コピー
          </Button>
        </Tooltip>
      </Stack>
      <Box
        sx={{
          border: '1px solid #ccc',
          p: 2,
          mb: 2,
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
        }}
      >
        {`${height} ${width}\n${grid.map((row) => row.join('')).join('\n')}`}
      </Box>
      <Stack direction="column" spacing={2} mt={4}>
        <Typography variant="h6" gutterBottom>
          競プロ入力形式から読み込み:
        </Typography>
        <TextField
          placeholder={`入力例:\n2 4\n####\n.#.#\n`}
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={loadInput}
          onChange={(e) => setLoadInput(e.target.value)}
          inputProps={{ style: { fontFamily: 'monospace' } }}
        />
        <Tooltip title="入力されたテキストを解釈してグリッドに反映します">
          <Button variant="contained" onClick={onLoadGrid}>
            読み込み
          </Button>
        </Tooltip>
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="現在のグリッドをXでシェアします">
            <IconButton onClick={onShareToX}>
              <XIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </>
  );
};
