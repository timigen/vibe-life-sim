export let CANVAS_WIDTH = window.innerWidth;
export let CANVAS_HEIGHT = window.innerHeight;

export function updateCanvasSize(width: number, height: number): void {
  CANVAS_WIDTH = width;
  CANVAS_HEIGHT = height;
}
