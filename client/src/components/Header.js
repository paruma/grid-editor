import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AtCoder Test Editor
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">
            テストケース編集
          </Button>
          <Button color="inherit" component={Link} to="/grid-editor">
            グリッドエディタ
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
