/** Triggers a browser download of the given rows as a CSV file. */
export function exportToCsv<T extends object>(filename: string, rows: T[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]) as (keyof T)[];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Exports a DOM node (e.g. a chart container) as a PNG using the browser's SVG-to-canvas pipeline. */
export async function exportNodeToPng(node: HTMLElement, filename: string) {
  const svg = node.querySelector("svg");
  if (!svg) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = svg.clientWidth * 2; // 2x for sharper export
    canvas.height = svg.clientHeight * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.fillStyle = "#0F172A";
    ctx.fillRect(0, 0, svg.clientWidth, svg.clientHeight);
    ctx.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `${filename}.png`;
      link.click();
      URL.revokeObjectURL(pngUrl);
    });
  };
  img.src = url;
}
