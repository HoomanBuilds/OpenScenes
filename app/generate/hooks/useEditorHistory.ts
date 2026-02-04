import { useEffect } from 'react';
import { Slide } from '../types';

type Params = {
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  setHistory: React.Dispatch<React.SetStateAction<Slide[][]>>;
  history: Slide[][];
  selectedSlideId: string | null;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export function useEditorHistory({
  slides,
  setSlides,
  history,
  setHistory,
  selectedSlideId,
  selectedElementIds,
  setSelectedElementIds,
}: Params) {
  const saveToHistory = () => {
    setHistory(prev => [...prev.slice(-19), JSON.parse(JSON.stringify(slides))]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setSlides(prev);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (document.activeElement as HTMLElement)?.isContentEditable) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSlideId && selectedElementIds.length) {
        e.preventDefault();
        saveToHistory();
        setSlides(prev =>
          prev.map(s =>
            s.id !== selectedSlideId
              ? s
              : { ...s, elements: s.elements?.filter(el => !selectedElementIds.includes(el.id)) }
          )
        );
        setSelectedElementIds([]);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slides, history, selectedSlideId, selectedElementIds]);

  return { saveToHistory, undo };
}
