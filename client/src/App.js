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
} from '@mui/material';

export default function App() {
  const [contest, setContest] = useState('abc408');
  const [contestInput, setContestInput] = useState('abc408');
  const [problem, setProblem] = useState('a');
  const [problemInput, setProblemInput] = useState('a');
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [newSampleName, setNewSampleName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const autoResize = (el) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  const fetchSamples = useCallback(() => {
    fetch(`http://localhost:3001/api/tests?contest=${contest}&problem=${problem}`)
      .then(res => {
        if (!res.ok) {
          // 存在しないcontest/problemなどでエラーの場合は空配列にしてUI初期化
          setSamples([]);
          setSelectedSample(null);
          setInputContent('');
          setOutputContent('');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setSamples(data);
          setSelectedSample(null);
          setInputContent('');
          setOutputContent('');
        }
      })
      .catch(() => {
        // ネットワークエラーも同様に空初期化
        setSamples([]);
        setSelectedSample(null);
        setInputContent('');
        setOutputContent('');
      });
  }, [contest, problem]);

  useEffect(() => {
    fetchSamples();
  }, [contest, fetchSamples, problem]);

  useEffect(() => {
    setContestInput(contest);
  }, [contest]);

  const handleSave = useCallback(async () => {
    if (!selectedSample) return;
    const sample = samples.find(s => s.name === selectedSample);
    if (!sample) return;

    const base = sample.name.trim();

    const inFilename = `${contest}/${problem}/test/${base}.in`;
    const outFilename = `${contest}/${problem}/test/${base}.out`;

    try {
      await Promise.all([
        fetch(`http://localhost:3001/api/test/${inFilename}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: inputContent }),
        }),
        fetch(`http://localhost:3001/api/test/${outFilename}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: outputContent }),
        })
      ]);
      setSaveSuccess(true);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, [contest, problem, samples, selectedSample, inputContent, outputContent]);

  const handleSampleClick = useCallback(async (sample) => {
    await handleSave();
    setSelectedSample(sample.name);

    fetch(`http://localhost:3001/api/test/${sample.inFile}`)
      .then(res => {
        if (!res.ok) throw new Error('Input file not found');
        return res.text();
      })
      .then(text => {
        setInputContent(text);
        setTimeout(() => autoResize(inputRef.current), 0);
      })
      .catch(() => setInputContent('Error loading input file'));

    fetch(`http://localhost:3001/api/test/${sample.outFile}`)
      .then(res => {
        if (!res.ok) throw new Error('Output file not found');
        return res.text();
      })
      .then(text => {
        setOutputContent(text);
        setTimeout(() => autoResize(outputRef.current), 0);
      })
      .catch(() => setOutputContent('Error loading output file'));
  }, [handleSave]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleCreate = () => {
    const base = newSampleName.trim();
    if (!base) return;

    const inFilename = `${contest}/${problem}/test/${base}.in`;
    const outFilename = `${contest}/${problem}/test/${base}.out`;

    Promise.all([
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
    ]).then(() => {
      setNewSampleName('');
      fetchSamples();
    });
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

      <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>
        {samples.map(sample => (
          <Button
            key={sample.name}
            variant={sample.name === selectedSample ? 'contained' : 'outlined'}
            size="small"
            sx={{ textTransform: "none" }}
            onClick={() => handleSampleClick(sample)}
          >
            {sample.name.toLowerCase()}
          </Button>
        ))}
      </Stack>

      {selectedSample && (
        <>
          <Typography variant="h5" gutterBottom>{selectedSample}</Typography>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="subtitle1">入力ファイル</Typography>
              <TextField
                inputRef={inputRef}
                value={inputContent}
                onChange={e => {
                  setInputContent(e.target.value);
                  autoResize(e.target);
                }}
                onInput={e => autoResize(e.target)}
                multiline
                fullWidth
                minRows={1}
                InputProps={{
                  sx: {
                    fontFamily: 'monospace',
                  }
                }}
              />
            </Box>
            <Box flex={1}>
              <Typography variant="subtitle1">出力ファイル</Typography>
              <TextField
                inputRef={outputRef}
                value={outputContent}
                onChange={e => {
                  setOutputContent(e.target.value);
                  autoResize(e.target);
                }}
                onInput={e => autoResize(e.target)}
                multiline
                fullWidth
                minRows={1}
                InputProps={{
                  sx: {
                    fontFamily: 'monospace',
                  }
                }}
              />
            </Box>
          </Stack>



          <Box mt={2}>
            <Button variant="contained" onClick={handleSave}>保存</Button>
          </Box>
        </>
      )}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={2000}
        onClose={() => setSaveSuccess(false)}
      >
        <Alert onClose={() => setSaveSuccess(false)} severity="success" sx={{ width: '100%' }}>
          保存しました！
        </Alert>
      </Snackbar>
    </Container>
  );
}
