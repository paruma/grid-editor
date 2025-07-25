import React from 'react';
import { Container, Typography } from '@mui/material';

export default function GridEditor() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>グリッドエディタ</Typography>
      <Typography variant="body1">ここにグリッドエディタの機能が実装されます。</Typography>
    </Container>
  );
}
