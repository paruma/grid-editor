import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [newSampleName, setNewSampleName] = useState('');
  const inputRef = useRef(null);
  const outputRef = useRef(null);
  const commentRef = useRef(null);

  // 高さ自動調整
  const autoResize = (el) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  // サンプル一覧取得
  const fetchSamples = () => {
    fetch('http://localhost:3001/api/tests')
      .then(res => res.json())
      .then(data => setSamples(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSamples();
  }, []);

  // サンプル選択時にファイル読み込み（入力、出力、コメント）
  const handleSampleClick = (sample) => {
    setSelectedSample(sample.name);

    fetch(`http://localhost:3001/api/test/${sample.inFile}`)
      .then(res => res.text())
      .then(text => {
        setInputContent(text);
        setTimeout(() => autoResize(inputRef.current), 0);
      })
      .catch(() => setInputContent('Error loading input file'));

    fetch(`http://localhost:3001/api/test/${sample.outFile}`)
      .then(res => res.text())
      .then(text => {
        setOutputContent(text);
        setTimeout(() => autoResize(outputRef.current), 0);
      })
      .catch(() => setOutputContent('Error loading output file'));

    fetch(`http://localhost:3001/api/test/${sample.name}.comment`)
      .then(res => {
        if (!res.ok) return '';
        return res.text();
      })
      .then(text => {
        setCommentContent(text);
        setTimeout(() => autoResize(commentRef.current), 0);
      })
      .catch(() => setCommentContent(''));
  };

  // 保存処理（入力、出力、コメント）
  const handleSave = useCallback(() => {
    if (!selectedSample) return;
    const sample = samples.find(s => s.name === selectedSample);
    if (!sample) return;

    fetch(`http://localhost:3001/api/test/${sample.inFile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: inputContent }),
    });

    fetch(`http://localhost:3001/api/test/${sample.outFile}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: outputContent }),
    });

    fetch(`http://localhost:3001/api/test/${sample.name}.comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentContent }),
    });
  }, [samples, selectedSample, inputContent, outputContent, commentContent]);

  // Ctrl+S で保存
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

  // 新規サンプル作成
  const handleCreate = () => {
    const base = newSampleName.trim();
    if (!base) return;

    const inFilename = `${base}.in`;
    const outFilename = `${base}.out`;
    const commentFilename = `${base}.comment`;

    fetch(`http://localhost:3001/api/test/${inFilename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });

    fetch(`http://localhost:3001/api/test/${outFilename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    });

    fetch(`http://localhost:3001/api/test/${commentFilename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '' }),
    }).then(() => {
      setNewSampleName('');
      fetchSamples();
    });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>サンプル一覧</h1>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={newSampleName}
          onChange={e => setNewSampleName(e.target.value)}
          placeholder="新しいサンプル名（例: sample4）"
        />
        <button onClick={handleCreate} style={{ marginLeft: '0.5rem' }}>作成</button>
      </div>

      <div>
        {samples.map(sample => (
          <button
            key={sample.name}
            onClick={() => handleSampleClick(sample)}
            style={{
              marginRight: '0.5rem',
              marginBottom: '0.5rem',
              backgroundColor: sample.name === selectedSample ? '#ddd' : '',
            }}
          >
            {sample.name}
          </button>
        ))}
      </div>

      {selectedSample && (
        <>
          <h2>{selectedSample}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h3>入力ファイル</h3>
              <textarea
                ref={inputRef}
                value={inputContent}
                onChange={e => {
                  setInputContent(e.target.value);
                  autoResize(e.target);
                }}
                onInput={e => autoResize(e.target)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  resize: 'none',
                  overflow: 'hidden',
                  padding: '0.5rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h3>出力ファイル</h3>
              <textarea
                ref={outputRef}
                value={outputContent}
                onChange={e => {
                  setOutputContent(e.target.value);
                  autoResize(e.target);
                }}
                onInput={e => autoResize(e.target)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  resize: 'none',
                  overflow: 'hidden',
                  padding: '0.5rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3>コメント</h3>
            <textarea
              ref={commentRef}
              value={commentContent}
              onChange={e => {
                setCommentContent(e.target.value);
                autoResize(e.target);
              }}
              onInput={e => autoResize(e.target)}
              style={{
                width: '100%',
                minHeight: '100px',
                resize: 'none',
                overflow: 'hidden',
                padding: '0.5rem',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <button onClick={handleSave} style={{ marginTop: '1rem' }}>保存</button>
        </>
      )}
    </div>
  );
}
