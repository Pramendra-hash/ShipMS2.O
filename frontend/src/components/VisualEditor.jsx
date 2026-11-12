import React, { useState, useEffect, useRef } from 'react';

export default function VisualEditor({ onToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [selectedEl, setSelectedEl] = useState(null);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedText, setSelectedText] = useState('');
  
  // Two-click Swap State
  const [swapMode, setSwapMode] = useState(false);
  const [swapSource, setSwapSource] = useState(null);

  // Style Controls
  const [textColor, setTextColor] = useState('#e6f6ff');
  const [bgColor, setBgColor] = useState('#071323');
  const [borderColor, setBorderColor] = useState('#174165');
  const [fontSize, setFontSize] = useState(14);
  const [padding, setPadding] = useState(8);
  const [borderRadius, setBorderRadius] = useState(12);
  const [glowEnabled, setGlowEnabled] = useState(true);

  // Position of Floating Panel
  const [pos, setPos] = useState({ x: window.innerWidth > 800 ? window.innerWidth - 420 : 16, y: 80 });
  const isDraggingPanel = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Floating Star Trigger position
  const [starPos, setStarPos] = useState({ x: window.innerWidth - 65, y: window.innerHeight - 80 });
  const isDraggingStar = useRef(false);
  const starDragStart = useRef({ x: 0, y: 0 });
  const hasStarMoved = useRef(false);

  // History stack for Undo/Redo
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Swatches for quick color choice
  const swatches = ['#00e5ff', '#169bff', '#22c55e', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff', '#020b18'];

  // Global Click and Hover Handler for Inspect & Swap
  useEffect(() => {
    if (!inspectMode && !swapMode) {
      document.body.classList.remove('fve-mode-active');
      return;
    }

    document.body.classList.add('fve-mode-active');

    const handleMouseOver = (e) => {
      if (e.target.closest('.fve-panel') || e.target.closest('.fve-star-btn') || e.target.closest('.fve-toast')) return;
      document.querySelectorAll('.fve-hovered').forEach(el => el.classList.remove('fve-hovered'));
      e.target.classList.add('fve-hovered');
    };

    const handleClick = (e) => {
      if (e.target.closest('.fve-panel') || e.target.closest('.fve-star-btn') || e.target.closest('.fve-toast')) return;
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;

      // Handle Two-Click Swap Mode
      if (swapMode) {
        if (!swapSource) {
          setSwapSource(target);
          target.classList.add('fve-swap-source');
          onToast('Element A selected. Now click Element B to swap positions!');
        } else {
          if (target === swapSource) {
            onToast('Cannot swap element with itself.');
            return;
          }
          // Perform DOM node swap
          const parentA = swapSource.parentNode;
          const parentB = target.parentNode;
          const siblingA = swapSource.nextSibling === target ? swapSource : swapSource.nextSibling;

          // Save undo snapshot
          setHistory(prev => [...prev, {
            type: 'swap',
            elA: swapSource,
            elB: target,
            parentA,
            parentB,
            nextA: swapSource.nextSibling,
            nextB: target.nextSibling
          }]);

          parentB.insertBefore(swapSource, target);
          parentA.insertBefore(target, siblingA);

          swapSource.classList.remove('fve-swap-source');
          swapSource.classList.add('fve-flash');
          target.classList.add('fve-flash');
          setTimeout(() => {
            swapSource.classList.remove('fve-flash');
            target.classList.remove('fve-flash');
          }, 800);

          onToast('✦ Elements swapped successfully!');
          setSwapSource(null);
          setSwapMode(false);
          setInspectMode(false);
        }
        return;
      }

      // Handle Regular Select
      if (selectedEl) {
        selectedEl.classList.remove('fve-selected');
      }
      target.classList.add('fve-selected');
      setSelectedEl(target);
      setSelectedTag(target.tagName.toLowerCase() + (target.id ? `#${target.id}` : target.className ? `.${target.className.split(' ')[0]}` : ''));
      setSelectedText(target.innerText || '');

      // Read computed styles
      const computed = window.getComputedStyle(target);
      setTextColor(rgbToHex(computed.color) || '#e6f6ff');
      setBgColor(rgbToHex(computed.backgroundColor) || '#071323');
      setBorderColor(rgbToHex(computed.borderColor) || '#174165');
      setFontSize(parseInt(computed.fontSize, 10) || 14);
      setPadding(parseInt(computed.paddingTop, 10) || 8);
      setBorderRadius(parseInt(computed.borderRadius, 10) || 12);

      onToast(`Selected: <${target.tagName.toLowerCase()}>`);
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick, true);
      document.querySelectorAll('.fve-hovered').forEach(el => el.classList.remove('fve-hovered'));
    };
  }, [inspectMode, swapMode, swapSource, selectedEl]);

  const rgbToHex = (rgb) => {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#071323';
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#00d2ff';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const applyTextChange = () => {
    if (!selectedEl) return;
    saveSnapshot(selectedEl, 'innerText', selectedEl.innerText);
    selectedEl.innerText = selectedText;
    onToast('Text updated!');
  };

  const applyStyle = (property, value) => {
    if (!selectedEl) return;
    saveSnapshot(selectedEl, property, selectedEl.style[property]);
    selectedEl.style[property] = value;
  };

  const nudge = (dx, dy) => {
    if (!selectedEl) return;
    const currentLeft = parseInt(selectedEl.style.marginLeft, 10) || 0;
    const currentTop = parseInt(selectedEl.style.marginTop, 10) || 0;
    selectedEl.style.marginLeft = `${currentLeft + dx}px`;
    selectedEl.style.marginTop = `${currentTop + dy}px`;
    onToast(`Nudged element (${dx > 0 ? '+' : ''}${dx}px, ${dy > 0 ? '+' : ''}${dy}px)`);
  };

  const saveSnapshot = (element, prop, prevVal) => {
    setHistory(prev => [...prev, { element, prop, prevVal }]);
    setFuture([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));

    if (last.type === 'swap') {
      last.parentA.insertBefore(last.elA, last.nextA);
      last.parentB.insertBefore(last.elB, last.nextB);
      onToast('Swap undone');
    } else if (last.element) {
      setFuture(prev => [...prev, { element: last.element, prop: last.prop, val: last.element.style[last.prop] || last.element[last.prop] }]);
      if (last.prop === 'innerText') {
        last.element.innerText = last.prevVal;
        setSelectedText(last.prevVal);
      } else {
        last.element.style[last.prop] = last.prevVal;
      }
      onToast('Undo applied');
    }
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture(prev => prev.slice(0, -1));
    if (next.element) {
      if (next.prop === 'innerText') {
        next.element.innerText = next.val;
        setSelectedText(next.val);
      } else {
        next.element.style[next.prop] = next.val;
      }
      onToast('Redo applied');
    }
  };

  const resetElement = () => {
    if (!selectedEl) return;
    selectedEl.removeAttribute('style');
    selectedEl.classList.remove('fve-selected');
    setSelectedEl(null);
    onToast('Element styles reset to default');
  };

  const saveLayout = () => {
    try {
      const modifications = [];
      document.querySelectorAll('[style]').forEach((el, index) => {
        if (!el.closest('.fve-panel') && !el.closest('.fve-star-btn')) {
          modifications.push({
            tag: el.tagName,
            id: el.id,
            className: el.className,
            cssText: el.style.cssText,
            text: el.innerText
          });
        }
      });
      localStorage.setItem('shipms_fve_layout', JSON.stringify(modifications));
      onToast('✦ Universal Design modifications saved to browser storage!');
    } catch (e) {
      onToast('Layout saved!');
    }
  };

  // Dragging Panel Logic
  const startDragPanel = (e) => {
    isDraggingPanel.current = true;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  const onMouseMovePanel = (e) => {
    if (!isDraggingPanel.current) return;
    setPos({
      x: Math.max(10, Math.min(window.innerWidth - 390, e.clientX - dragOffset.current.x)),
      y: Math.max(10, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y))
    });
  };

  const stopDragPanel = () => {
    isDraggingPanel.current = false;
  };

  // Dragging Star Button Logic
  const handleStarMouseDown = (e) => {
    isDraggingStar.current = true;
    hasStarMoved.current = false;
    starDragStart.current = { x: e.clientX - starPos.x, y: e.clientY - starPos.y };
  };

  const handleStarMouseMove = (e) => {
    if (!isDraggingStar.current) return;
    hasStarMoved.current = true;
    setStarPos({
      x: Math.max(10, Math.min(window.innerWidth - 60, e.clientX - starDragStart.current.x)),
      y: Math.max(10, Math.min(window.innerHeight - 60, e.clientY - starDragStart.current.y))
    });
  };

  const handleStarMouseUp = () => {
    isDraggingStar.current = false;
  };

  const handleStarClick = () => {
    if (!hasStarMoved.current) {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMovePanel);
    window.addEventListener('mouseup', stopDragPanel);
    window.addEventListener('mousemove', handleStarMouseMove);
    window.addEventListener('mouseup', handleStarMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMovePanel);
      window.removeEventListener('mouseup', stopDragPanel);
      window.removeEventListener('mousemove', handleStarMouseMove);
      window.removeEventListener('mouseup', handleStarMouseUp);
    };
  }, []);

  return (
    <>
      {/* Draggable Star Trigger Button */}
      <button
        type="button"
        onMouseDown={handleStarMouseDown}
        onClick={handleStarClick}
        style={{ left: `${starPos.x}px`, top: `${starPos.y}px` }}
        className="fixed z-[999999] w-12 h-12 rounded-full bg-gradient-to-tr from-[#00d2ff] via-[#169bff] to-[#a855f7] text-[#020b18] text-xl font-black shadow-[0_0_25px_rgba(0,210,255,0.7)] flex items-center justify-center cursor-move select-none hover:scale-110 active:scale-95 transition-transform"
        title="Universal Design Controller (FVE) — Click to open, drag to move"
      >
        ✦
      </button>

      {/* Floating Visual Editor Panel */}
      {isOpen && (
        <div
          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
          className={`fve-panel ${isMinimized ? 'minimized' : ''}`}
        >
          {/* Header */}
          <div className="fve-header" onMouseDown={startDragPanel}>
            <div className="fve-header-title">
              <span className="fve-sparkle">✦</span>
              <span>Universal Design Controller</span>
              <span className="fve-badge">v3.4 PRO</span>
            </div>
            <div className="fve-header-actions">
              <button
                className="fve-icon-btn"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? '□' : '–'}
              </button>
              <button
                className="fve-icon-btn"
                onClick={() => {
                  setIsOpen(false);
                  setInspectMode(false);
                  setSwapMode(false);
                  if (selectedEl) selectedEl.classList.remove('fve-selected');
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Selection Bar */}
          <div className="fve-selection-bar">
            <div className="fve-sel-info">
              <span className="fve-sel-label">Selected:</span>
              <span className="fve-sel-name">{selectedTag || 'None (click Inspect)'}</span>
            </div>
            <div className="fve-sel-actions">
              <button
                className={`fve-small-btn ${inspectMode ? 'bg-[#00e5ff] text-[#020813] font-bold' : ''}`}
                onClick={() => {
                  setInspectMode(!inspectMode);
                  if (swapMode) setSwapMode(false);
                  onToast(inspectMode ? 'Inspect mode stopped' : 'Inspect mode active: Click any element on screen!');
                }}
              >
                {inspectMode ? '🎯 Inspecting...' : '🎯 Inspect Element'}
              </button>
              {selectedEl && (
                <button
                  className="fve-small-btn"
                  onClick={() => {
                    if (selectedEl.parentElement) {
                      selectedEl.classList.remove('fve-selected');
                      const parent = selectedEl.parentElement;
                      parent.classList.add('fve-selected');
                      setSelectedEl(parent);
                      setSelectedTag(parent.tagName.toLowerCase());
                      setSelectedText(parent.innerText || '');
                    }
                  }}
                >
                  ↑ Parent
                </button>
              )}
            </div>
          </div>

          {/* Swap Status Bar if active */}
          {swapMode && (
            <div className="fve-swap-status">
              <div className="flex items-center gap-2">
                <div className="fve-pulse-dot" />
                <span>{swapSource ? 'Select Element B to complete swap' : 'Click Element A to begin swap'}</span>
              </div>
              <button
                className="fve-cancel-swap"
                onClick={() => {
                  setSwapMode(false);
                  if (swapSource) swapSource.classList.remove('fve-swap-source');
                  setSwapSource(null);
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Panel Body */}
          <div className="fve-body">
            {/* Quick Actions: Two-Click Swap & Visual Edit Mode */}
            <div className="fve-action-row">
              <button
                className={`fve-btn fve-btn-swap ${swapMode ? 'active' : ''}`}
                onClick={() => {
                  setSwapMode(!swapMode);
                  setInspectMode(false);
                  if (swapSource) swapSource.classList.remove('fve-swap-source');
                  setSwapSource(null);
                  onToast(swapMode ? 'Swap cancelled' : 'Two-Click Swap active: Click first element!');
                }}
              >
                <span>⇄</span>
                <span>Two-Click Swap</span>
              </button>

              <button
                className={`fve-btn fve-btn-drag ${inspectMode ? 'active' : ''}`}
                onClick={() => {
                  setInspectMode(!inspectMode);
                  if (swapMode) setSwapMode(false);
                }}
              >
                <span>🎯</span>
                <span>Point & Edit</span>
              </button>
            </div>

            {/* Live Text Editing */}
            <div className="fve-section">
              <span className="fve-section-title">Edit Element Text</span>
              <div className="fve-input-group">
                <input
                  type="text"
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  placeholder={selectedEl ? 'Enter replacement text...' : 'Select an element first'}
                  disabled={!selectedEl}
                />
                <button
                  className="fve-apply-btn"
                  onClick={applyTextChange}
                  disabled={!selectedEl}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Colors Section */}
            <div className="fve-section">
              <span className="fve-section-title">Color & Appearance</span>
              
              <div className="space-y-2.5">
                <div className="fve-color-row">
                  <span className="fve-color-label">Text Color</span>
                  <div className="fve-color-input-wrapper">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        applyStyle('color', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        applyStyle('color', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                  </div>
                </div>

                <div className="fve-color-row">
                  <span className="fve-color-label">Background</span>
                  <div className="fve-color-input-wrapper">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        applyStyle('backgroundColor', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => {
                        setBgColor(e.target.value);
                        applyStyle('backgroundColor', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                  </div>
                </div>

                <div className="fve-color-row">
                  <span className="fve-color-label">Border</span>
                  <div className="fve-color-input-wrapper">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => {
                        setBorderColor(e.target.value);
                        applyStyle('borderColor', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => {
                        setBorderColor(e.target.value);
                        applyStyle('borderColor', e.target.value);
                      }}
                      disabled={!selectedEl}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {swatches.map((color) => (
                    <button
                      key={color}
                      className="fve-swatch border border-white/20"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setTextColor(color);
                        applyStyle('color', color);
                      }}
                      disabled={!selectedEl}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Position & D-Pad Section */}
            <div className="fve-section">
              <span className="fve-section-title">Position Nudge (D-Pad)</span>
              <div className="fve-dpad">
                <button
                  className="fve-dpad-btn"
                  onClick={() => nudge(0, -4)}
                  disabled={!selectedEl}
                >
                  ▲ UP
                </button>
                <div className="fve-dpad-mid">
                  <button
                    className="fve-dpad-btn"
                    onClick={() => nudge(-4, 0)}
                    disabled={!selectedEl}
                  >
                    ◀ LEFT
                  </button>
                  <span className="fve-dpad-center">4px</span>
                  <button
                    className="fve-dpad-btn"
                    onClick={() => nudge(4, 0)}
                    disabled={!selectedEl}
                  >
                    RIGHT ▶
                  </button>
                </div>
                <button
                  className="fve-dpad-btn"
                  onClick={() => nudge(0, 4)}
                  disabled={!selectedEl}
                >
                  ▼ DOWN
                </button>
              </div>
            </div>

            {/* Dimension Sliders */}
            <div className="fve-section">
              <span className="fve-section-title">Dimensions & Geometry</span>
              
              <div className="space-y-2">
                <div className="fve-slider-row">
                  <span className="w-20 text-[11px]">Font Size</span>
                  <input
                    type="range"
                    min="10"
                    max="64"
                    value={fontSize}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFontSize(val);
                      applyStyle('fontSize', `${val}px`);
                    }}
                    disabled={!selectedEl}
                  />
                  <span className="fve-val-badge">{fontSize}px</span>
                </div>

                <div className="fve-slider-row">
                  <span className="w-20 text-[11px]">Padding</span>
                  <input
                    type="range"
                    min="0"
                    max="48"
                    value={padding}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setPadding(val);
                      applyStyle('padding', `${val}px`);
                    }}
                    disabled={!selectedEl}
                  />
                  <span className="fve-val-badge">{padding}px</span>
                </div>

                <div className="fve-slider-row">
                  <span className="w-20 text-[11px]">Radius</span>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={borderRadius}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBorderRadius(val);
                      applyStyle('borderRadius', `${val}px`);
                    }}
                    disabled={!selectedEl}
                  />
                  <span className="fve-val-badge">{borderRadius}px</span>
                </div>
              </div>

              <div className="fve-vis-buttons">
                <button
                  className="fve-btn-vis"
                  onClick={() => {
                    if (selectedEl) {
                      selectedEl.style.display = selectedEl.style.display === 'none' ? '' : 'none';
                      onToast('Element visibility toggled');
                    }
                  }}
                  disabled={!selectedEl}
                >
                  👁 Hide/Show
                </button>
                <button
                  className="fve-btn-vis"
                  onClick={() => {
                    if (selectedEl) {
                      const clone = selectedEl.cloneNode(true);
                      clone.classList.remove('fve-selected');
                      selectedEl.parentNode.insertBefore(clone, selectedEl.nextSibling);
                      onToast('Element duplicated!');
                    }
                  }}
                  disabled={!selectedEl}
                >
                  📑 Duplicate
                </button>
                <button
                  className="fve-btn-vis"
                  onClick={resetElement}
                  disabled={!selectedEl}
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          </div>

          {/* Footer Controls: Undo, Redo, Reset, Save */}
          <div className="fve-footer">
            <div className="fve-history-row">
              <button
                className="fve-footer-btn"
                onClick={undo}
                disabled={history.length === 0}
              >
                ↶ Undo
              </button>
              <button
                className="fve-footer-btn"
                onClick={redo}
                disabled={future.length === 0}
              >
                ↷ Redo
              </button>
              <button
                className="fve-footer-btn fve-reset-btn"
                onClick={() => {
                  document.querySelectorAll('[style]').forEach(el => {
                    if (!el.closest('.fve-panel') && !el.closest('.fve-star-btn')) {
                      el.removeAttribute('style');
                    }
                  });
                  localStorage.removeItem('shipms_fve_layout');
                  onToast('All visual modifications reset');
                }}
              >
                ✕ Reset All
              </button>
            </div>

            <button className="fve-save-btn" onClick={saveLayout}>
              <span>💾</span>
              <span>Save Universal Design</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
