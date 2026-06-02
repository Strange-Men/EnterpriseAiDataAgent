/**
 * Unified blob download utility.
 * Replaces duplicated Blob → createObjectURL → createElement → click → revokeObjectURL pattern.
 */

export function downloadBlob(filename: string, data: string | Blob, mimeType: string): void {
  if (typeof document === "undefined") return;
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
