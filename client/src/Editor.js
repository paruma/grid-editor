import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';

// Define a custom theme for the editor
monaco.editor.defineTheme('customLight', {
  base: 'vs', // Inherit from the built-in 'vs' (light) theme
  inherit: true,
  rules: [],
  colors: {
    'editorGutter.background': '#f0f0f0', // Background color for the editor gutter (line numbers)
  }
});

const Editor = ({ value, onChange, language }) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: 'customLight', // Use the custom theme
        minimap: { enabled: false },
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        quickSuggestions: false,
        selectionHighlight: false,
        occurrencesHighlight: false,
        glyphMargin: false,
        folding: false,
        renderLineHighlight: 'none',
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden'
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
      });

      const updateHeight = () => {
        const contentHeight = editorRef.current.getContentHeight();
        setHeight(`${contentHeight}px`);
      };

      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current.getValue());
        updateHeight();
      });

      updateHeight();
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language, onChange, value]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  return <div ref={containerRef} style={{ height, minHeight: '38px', border: '1px solid #ccc', borderRadius: '4px' }}></div>;
};

export default Editor;
