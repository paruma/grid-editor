import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

const Editor = ({ value, onChange, language, theme }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });

      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current.getValue());
      });
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
        monaco.editor.setTheme(theme);
    }
  }, [theme]);

  return <div ref={containerRef} style={{ height: '200px', border: '1px solid #ccc' }}></div>;
};

export default Editor;
