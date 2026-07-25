import type { JobScanRecord } from '@qaddem/shared';

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function joinList(values: string[]): string {
  return Array.isArray(values) ? values.filter(Boolean).join(' | ') : '';
}

function cell(value: unknown, styleId?: string): string {
  const style = styleId ? ` ss:StyleID="${styleId}"` : '';
  return `<Cell${style}><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;
}

function reviewLabel(value: JobScanRecord['reviewStatus']): string {
  switch (value) {
    case 'confirmed':
      return 'واضحة';
    case 'potential':
      return 'محتملة';
    case 'needs_ocr':
      return 'تحتاج OCR';
    case 'incomplete':
      return 'غير مكتملة';
    default:
      return 'تحتاج مراجعة';
  }
}

export function buildJobsExcelXml(jobs: JobScanRecord[]): string {
  const headers = [
    'حالة المراجعة',
    'درجة الثقة',
    'المسمى الوظيفي',
    'الشركة',
    'المدينة',
    'الناشر',
    'معرف الناشر',
    'تاريخ النشر',
    'الوصف المنظم',
    'النص الخام الكامل',
    'البريد الإلكتروني',
    'الجوال',
    'نماذج التقديم',
    'رابط التقديم',
    'رابط المصدر',
    'معرف المنشور',
    'المنصة',
    'عدد الصور',
    'حالة OCR',
    'نص OCR',
    'تاريخ الاكتشاف',
  ];

  const rows = (jobs ?? []).map((job) => [
    reviewLabel(job.reviewStatus),
    `${Math.round(Number(job.confidence ?? 0) * 100)}%`,
    job.title ?? '',
    job.company ?? '',
    job.location ?? '',
    job.authorName ?? '',
    job.authorHandle ?? '',
    job.publishedAt ?? '',
    job.description ?? '',
    job.rawText ?? '',
    joinList(job.emails),
    joinList(job.phones),
    joinList(job.forms),
    job.applyUrl ?? '',
    job.sourceUrl ?? '',
    job.sourceItemId ?? '',
    job.sourcePlatform ?? '',
    String(job.imageUrls?.length ?? 0),
    job.ocrStatus ?? '',
    job.ocrText ?? '',
    job.detectedAt ?? '',
  ]);

  const headerRow = `<Row>${headers.map((header) => cell(header, 'Header')).join('')}</Row>`;
  const dataRows = rows
    .map((row) => `<Row>${row.map((value) => cell(value)).join('')}</Row>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
  <Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#D1FAE5" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>
 </Styles>
 <Worksheet ss:Name="جميع النتائج">
  <Table ss:DefaultColumnWidth="140">
   ${headerRow}
   ${dataRows}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <DisplayRightToLeft/>
   <FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
</Workbook>`;
}

export function downloadJobsExcel(jobs: JobScanRecord[]): void {
  const xml = buildJobsExcelXml(jobs);
  const blob = new Blob([`\uFEFF${xml}`], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `qaddem-jobs-${new Date().toISOString().slice(0, 10)}.xls`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
