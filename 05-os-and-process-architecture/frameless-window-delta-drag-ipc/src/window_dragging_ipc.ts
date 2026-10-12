// Custom window dragging without forcing OS cursor / disabling web events
let dragStartPos = null;
let windowStartPos = null;

ipcMain.on("window-drag-start", (_event, { screenX, screenY }) => {
  if (!mainWindow) return;
  dragStartPos = { x: screenX, y: screenY };
  const [wx, wy] = mainWindow.getPosition();
  windowStartPos = { x: wx, y: wy };
});

ipcMain.on("window-drag-move", (_event, { screenX, screenY }) => {
  if (!mainWindow || !dragStartPos || !windowStartPos) return;

  // 1. If dragging while maximized, unmaximize and re-center on mouse
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
    const [wx, wy] = mainWindow.getPosition();
    windowStartPos = { x: wx, y: wy };
    dragStartPos = { x: screenX, y: screenY };
    return;
  }

  // 2. Compute delta movement offset and update window position
  const newX = windowStartPos.x + (screenX - dragStartPos.x);
  const newY = windowStartPos.y + (screenY - dragStartPos.y);
  mainWindow.setPosition(newX, newY);
});

ipcMain.on("window-drag-end", () => {
  dragStartPos = null;
  windowStartPos = null;
});