// LaTeX compilation service using external API
// This uses LaTeX.Online API (free, no auth required)

export const compileLatexToPdf = async (latexCode: string): Promise<Blob> => {
  try {
    // Create a .tex file blob
    const texBlob = new Blob([latexCode], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('filecontents[]', texBlob, 'resume.tex');
    formData.append('filename[]', 'resume.tex');

    // Use LaTeX.Online API with proper form data
    const response = await fetch('https://latexonline.cc/compile?target=resume.tex', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LaTeX compilation error:', errorText);
      throw new Error('LaTeX compilation failed. Please check your code for syntax errors.');
    }

    // Get the PDF blob
    const pdfBlob = await response.blob();
    
    // Verify it's actually a PDF
    if (pdfBlob.type !== 'application/pdf' && !pdfBlob.type.includes('pdf')) {
      throw new Error('Compilation did not produce a valid PDF. Check your LaTeX syntax.');
    }
    
    return pdfBlob;
  } catch (error) {
    console.error('LaTeX compilation error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to compile LaTeX. Please check your code for syntax errors.');
  }
};

// Estimate page count without compilation (heuristic-based)
export const estimatePageCount = (latexCode: string): number => {
  if (!latexCode.trim()) return 0;
  
  // Count sections, items, and content
  const sections = (latexCode.match(/\\section/g) || []).length;
  const subsections = (latexCode.match(/\\subsection/g) || []).length;
  const items = (latexCode.match(/\\item/g) || []).length;
  const lines = latexCode.split('\n').filter(line => line.trim().length > 0).length;
  
  // Rough heuristic based on typical resume structure:
  // - Each section ~0.15 pages
  // - Each subsection ~0.08 pages
  // - Each item ~0.03 pages
  // - Base content ~0.001 pages per non-empty line
  const estimated = (sections * 0.15) + (subsections * 0.08) + (items * 0.03) + (lines * 0.001);
  
  return Math.max(1, Math.ceil(estimated));
};

