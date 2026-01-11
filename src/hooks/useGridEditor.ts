import { useState, useCallback } from 'react';
import { GridType, generateInitialGrid, decodeGrid } from '../utils/gridUtils';

const MAX_HISTORY_COUNT = 100;

export type HistoryState = {
  grid: GridType;
  height: string;
  width: string;
};

// URLパラメータから初期状態を取得するユーティリティ
const getInitialState = () => {
  const defaultHeight = '6';
  const defaultWidth = '8';
  const defaultGrid = generateInitialGrid(6, 8);

  try {
    const params = new URLSearchParams(window.location.search);
    const h = params.get('h');
    const w = params.get('w');
    const encodedData = params.get('data');

    if (h && w && encodedData) {
      const newHeight = parseInt(h, 10);
      const newWidth = parseInt(w, 10);

      if (!isNaN(newHeight) && !isNaN(newWidth) && newHeight > 0 && newWidth > 0) {
        const newGrid = decodeGrid(newHeight, newWidth, encodedData);
        if (newGrid) {
          return {
            height: h,
            width: w,
            grid: newGrid,
          };
        }
      }
    }
  } catch (error) {
    console.error('Failed to decode grid data from URL:', error);
  }

  return {
    height: defaultHeight,
    width: defaultWidth,
    grid: defaultGrid,
  };
};

export const useGridEditor = () => {
  // 初期値を一度だけ計算
  const [initialData] = useState(getInitialState);

  const [height, setHeight] = useState(initialData.height);
  const [width, setWidth] = useState(initialData.width);
  const [grid, setGrid] = useState<GridType>(initialData.grid);

  const [history, setHistory] = useState<HistoryState[]>([
    { grid: initialData.grid, height: initialData.height, width: initialData.width },
  ]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);

  const pushToHistory = useCallback(
    (newGrid: GridType, newHeight: string, newWidth: string) => {
      const newState = { grid: newGrid, height: newHeight, width: newWidth };
      const currentSate = history[currentHistoryIndex];

      if (JSON.stringify(newState) === JSON.stringify(currentSate)) {
        return;
      }

      let newHistory = history.slice(0, currentHistoryIndex + 1);
      newHistory.push(newState);

      if (newHistory.length > MAX_HISTORY_COUNT) {
        newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_COUNT);
      }

      const newIndex = newHistory.length - 1;
      setHistory(newHistory);
      setCurrentHistoryIndex(newIndex);
    },
    [history, currentHistoryIndex]
  );

  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const newIndex = currentHistoryIndex - 1;
      setCurrentHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setGrid(previousState.grid);
      setHeight(previousState.height);
      setWidth(previousState.width);
    }
  }, [currentHistoryIndex, history]);

  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const newIndex = currentHistoryIndex + 1;
      setCurrentHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setGrid(nextState.grid);
      setHeight(nextState.height);
      setWidth(nextState.width);
    }
  }, [currentHistoryIndex, history]);

  return {
    grid,
    setGrid,
    height,
    setHeight,
    width,
    setWidth,
    history,
    setHistory,
    currentHistoryIndex,
    setCurrentHistoryIndex,
    pushToHistory,
    undo,
    redo,
  };
};
