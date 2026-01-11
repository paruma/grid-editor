import React from 'react';
import {
  Stack,
  Typography,
  Tooltip,
  Button,
  Box,
  TextField,
  IconButton,
  Grid,
} from '@mui/material';
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
  const commonHeight = 180;
  const commonFontSize = '13px';
  const gridTextStyle = {
    fontFamily: '"Roboto Mono", "Courier New", monospace',
    fontSize: commonFontSize,
    lineHeight: 1.5,
  };

  const gridText = height + ' ' + width + '\n' + grid.map((row) => row.join('')).join('\n');

  return (
    <Box mt={4} sx={{ width: '100%' }}>
      <Grid container spacing={4}>
        {/* 左側: 表示・コピー */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack direction="row" spacing={2} mb={1} alignItems="center">
            <Typography variant="h6">競プロ入力形式:</Typography>
            <Tooltip title="現在のグリッドを競プロ形式でクリップボードにコピーします">
              <Button variant="outlined" size="small" onClick={onCopyClick}>
                コピー
              </Button>
            </Tooltip>
          </Stack>
          <Box
            sx={{
              ...gridTextStyle,
              border: '1px solid #ccc',
              p: 2,
              height: commonHeight,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#fafafa',
              borderRadius: 1,
              boxSizing: 'border-box',
            }}
          >
            {gridText}
          </Box>
        </Grid>

        {/* 右側: 読み込み・共有 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ height: 31, display: 'flex', alignItems: 'center' }}
          >
            競プロ入力形式から読み込み:
          </Typography>
          <TextField
            placeholder={'入力例:\n2 4\n####\n.#.#\n'}
            multiline
            fullWidth
            variant="outlined"
            value={loadInput}
            onChange={(e) => setLoadInput(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                height: commonHeight,
                alignItems: 'flex-start',
                padding: 0,
                backgroundColor: '#ffffff',
              },
              '& .MuiInputBase-input': {
                ...gridTextStyle,
                height: '100% !important',
                overflow: 'auto !important',
                padding: '16px !important',
                boxSizing: 'border-box',
              },
            }}
          />
          <Stack
            direction="row"
            spacing={1}
            mt={1}
            justifyContent="space-between"
            alignItems="center"
          >
            <Tooltip title="入力されたテキストを解釈してグリッドに反映します">
              <Button variant="contained" onClick={onLoadGrid}>
                読み込み
              </Button>
            </Tooltip>
            <Tooltip title="現在のグリッドをXでシェアします">
              <IconButton onClick={onShareToX}>
                <XIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};
