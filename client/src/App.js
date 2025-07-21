import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function App() {
  const [contest, setContest] = useState('abc408');
  const [contestInput, setContestInput] = useState('abc408');
  const [problem, setProblem] = useState('a');
  const [problemInput, setProblemInput] = useState('a');
  const [samples, setSamples] = useState([]);
  const [newSampleName, setNewSampleName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSample, setActiveSample] = useState(null);
  const [editingSample, setEditingSample] = useState(null);
  const [editingSampleName, setEditingSampleName] = useState('');
  const [deletingSample, setDeletingSample] = useState(null);

  const textAreaRefs = useRef({});
  const renameInputRef = useRef(null);

  const autoResize = (el) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  const fetchSamples = useCallback(() => {
    setLoading(true);
    fetch(`http://localhost:3001/api/tests?contest=${contest}&problem=${problem}`)
      .then(res => {
        if (!res.ok) {
          setSamples([]);
          return null;
        }
        return res.json();
      })
      .then(async (data) => {
        if (data) {
          const samplesWithContent = await Promise.all(
            data.map(async (sample) => {
              const [inputRes, outputRes] = await Promise.all([
                fetch(`http://localhost:3001/api/test/${sample.inFile}`),
                fetch(`http://localhost:3001/api/test/${sample.outFile}`),
              ]);
              const inputContent = await inputRes.text();
              const outputContent = await outputRes.text();
              return {
                ...sample,
                inputContent,
                outputContent,
                originalInputContent: inputContent,
                originalOutputContent: outputContent,
              };
            })
          );
          setSamples(samplesWithContent);
        }
      })
      .catch(() => {
        setSamples([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [contest, problem]);

  useEffect(() => {
    fetchSamples();
  }, [fetchSamples]);

  useEffect(() => {
    setContestInput(contest);
  }, [contest]);

  useEffect(() => {
    samples.forEach(sample => {
      if (textAreaRefs.current[sample.name]) {
        autoResize(textAreaRefs.current[sample.name].input);
        autoResize(textAreaRefs.current[sample.name].output);
      }
    });
  }, [samples]);

  useEffect(() => {
    if (editingSample && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [editingSample]);

  const handleSave = useCallback(async (sampleName) => {
    const sample = samples.find(s => s.name === sampleName);
    if (!sample) return;

    const { inputContent, outputContent, originalInputContent, originalOutputContent } = sample;

    const finalInputContent = inputContent && !inputContent.endsWith('\n') ? `${inputContent}\n` : inputContent;
    const finalOutputContent = outputContent && !outputContent.endsWith('\n') ? `${outputContent}\n` : outputContent;

    const isChanged = finalInputContent !== originalInputContent || finalOutputContent !== originalOutputContent;
    if (!isChanged) return;

    const base = sample.name.trim();
    const inFilename = `${contest}/${problem}/test/${base}.in`;
    const outFilename = `${contest}/${problem}/test/${base}.out`;

    try {
      await Promise.all([
        fetch(`http://localhost:3001/api/test/${inFilename}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: finalInputContent }),
        }),
        fetch(`http://localhost:3001/api/test/${outFilename}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: finalOutputContent }),
        })
      ]);
      setSnackbarMessage(`${sampleName} を保存しました！`);
      setSaveSuccess(true);

      setSamples(prevSamples =>
        prevSamples.map(s =>
          s.name === sampleName
            ? {
              ...s,
              inputContent: finalInputContent,
              outputContent: finalOutputContent,
              originalInputContent: finalInputContent,
              originalOutputContent: finalOutputContent,
            }
            : s
        )
      );
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, [contest, problem, samples]);

  const handleSaveAllModified = useCallback(async () => {
    const modifiedSamples = samples.filter(s =>
      (s.inputContent && !s.inputContent.endsWith('\n') ? `${s.inputContent}\n` : s.inputContent) !== s.originalInputContent ||
      (s.outputContent && !s.outputContent.endsWith('\n') ? `${s.outputContent}\n` : s.outputContent) !== s.originalOutputContent
    );
    await Promise.all(modifiedSamples.map(s => handleSave(s.name)));
  }, [samples, handleSave]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeSample) {
          handleSave(activeSample);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, activeSample]);

  const handleCreate = async () => {
    const base = newSampleName.trim();
    if (!base || samples.find(s => s.name === base)) return;

    await handleSaveAllModified();

    const inFilename = `${contest}/${problem}/test/${base}.in`;
    const outFilename = `${contest}/${problem}/test/${base}.out`;

    await Promise.all([
      fetch(`http://localhost:3001/api/test/${inFilename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      }),
      fetch(`http://localhost:3001/api/test/${outFilename}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }),
      }),
    ]);

    const newSample = {
      name: base,
      inFile: `${contest}/${problem}/test/${base}.in`,
      outFile: `${contest}/${problem}/test/${base}.out`,
      commentFile: null,
      inputContent: '',
      outputContent: '',
      originalInputContent: '',
      originalOutputContent: '',
    };

    setSamples(prevSamples => [...prevSamples, newSample].sort((a, b) => a.name.localeCompare(b.name)));
    setNewSampleName('');
  };

  const handleRename = async (oldName, newName) => {
    if (!newName || oldName === newName) {
      setEditingSample(null);
      return;
    }

    await fetch('http://localhost:3001/api/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contest, problem, oldName, newName }),
    });

    setSamples(prevSamples =>
      prevSamples.map(s =>
        s.name === oldName
          ? { ...s, name: newName, inFile: s.inFile.replace(oldName, newName), outFile: s.outFile.replace(oldName, newName) }
          : s
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingSample(null);
  };

  const handleDelete = async (name) => {
    setDeletingSample(null);
    await fetch(`http://localhost:3001/api/sample?contest=${contest}&problem=${problem}&name=${name}`, {
      method: 'DELETE',
    });
    setSamples(prevSamples => prevSamples.filter(s => s.name !== name));
  };

  const handleContentChange = (sampleName, field, value) => {
    setSamples(prevSamples =>
      prevSamples.map(s =>
        s.name === sampleName ? { ...s, [field]: value } : s
      )
    );
  };

  const handleProblemKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setProblem(problemInput);
    }
  };

  const handleContestKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setContest(contestInput);
    }
  };

  const handleCloseSnackbar = () => {
    setSaveSuccess(false);
    setSnackbarMessage('');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>サンプル一覧</Typography>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <TextField
          label="Contest"
          value={contestInput}
          onChange={e => setContestInput(e.target.value)}
          onKeyDown={handleContestKeyDown}
          onBlur={() => setContest(contestInput)}
          size="small"
        />
        <TextField
          label="Problem"
          value={problemInput}
          onChange={e => setProblemInput(e.target.value)}
          onKeyDown={handleProblemKeyDown}
          onBlur={() => setProblem(problemInput)}
          size="small"
          sx={{ width: 100 }}
        />
      </Stack>

      <Stack direction="row" spacing={1} mb={2} alignItems="center">
        <TextField
          value={newSampleName}
          onChange={e => setNewSampleName(e.target.value)}
          placeholder="新しいサンプル名"
          size="small"
        />
        <Button variant="outlined" onClick={handleCreate}>作成</Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={4}>
          {samples.map(sample => (
            <Box key={sample.name}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                {editingSample === sample.name ? (
                  <TextField
                    value={editingSampleName}
                    onChange={(e) => setEditingSampleName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(sample.name, editingSampleName);
                      }
                    }}
                    onBlur={() => handleRename(sample.name, editingSampleName)}
                    size="small"
                    inputRef={renameInputRef}
                  />
                ) : (
                  <Stack direction="row" alignItems="center">
                    <Typography variant="h5">{sample.name}</Typography>
                    <IconButton size="small" onClick={() => {
                      setEditingSample(sample.name);
                      setEditingSampleName(sample.name);
                    }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" size="small" onClick={() => handleSave(sample.name)}>保存</Button>
                  <IconButton size="small" onClick={() => setDeletingSample(sample.name)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Box flex={1}>
                  <Typography variant="subtitle1">入力ファイル</Typography>
                  <TextField
                    inputRef={el => {
                      if (!textAreaRefs.current[sample.name]) textAreaRefs.current[sample.name] = {};
                      textAreaRefs.current[sample.name].input = el;
                    }}
                    value={sample.inputContent}
                    onChange={e => handleContentChange(sample.name, 'inputContent', e.target.value)}
                    onFocus={() => setActiveSample(sample.name)}
                    onInput={e => autoResize(e.target)}
                    multiline
                    fullWidth
                    minRows={1}
                    InputProps={{ sx: { fontFamily: 'monospace' } }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1">出力ファイル</Typography>
                  <TextField
                    inputRef={el => {
                      if (!textAreaRefs.current[sample.name]) textAreaRefs.current[sample.name] = {};
                      textAreaRefs.current[sample.name].output = el;
                    }}
                    value={sample.outputContent}
                    onChange={e => handleContentChange(sample.name, 'outputContent', e.target.value)}
                    onFocus={() => setActiveSample(sample.name)}
                    onInput={e => autoResize(e.target)}
                    multiline
                    fullWidth
                    minRows={1}
                    InputProps={{ sx: { fontFamily: 'monospace' } }}
                  />
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog
        open={!!deletingSample}
        onClose={() => setDeletingSample(null)}
      >
        <DialogTitle>サンプルの削除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            本当に「{deletingSample}」を削除しますか？この操作は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingSample(null)}>キャンセル</Button>
          <Button onClick={() => handleDelete(deletingSample)} color="error">削除</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={saveSuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
