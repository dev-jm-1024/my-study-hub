export function triggerDownload(pdfUrl: string, title: string) {
  if (!pdfUrl) return;
  const a = document.createElement('a');
  a.href = pdfUrl;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  if (!pdfUrl.startsWith('http')) {
    a.download = `${title}.pdf`;
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
