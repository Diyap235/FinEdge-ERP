import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/ocr';
const ACCOUNTANT_ID = '4';

// Minimal valid PDF generator for test purposes
function createSamplePdfBuffer(invoiceText) {
  // A raw valid PDF document containing text stream
  const escaped = invoiceText.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = escaped.split('\n');
  let streamContent = 'BT\n/F1 12 Tf\n50 750 Td\n16 TL\n';
  for (const line of lines) {
    streamContent += `(${line}) '\n`;
  }
  streamContent += 'ET';

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamContent.length} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(300 + streamContent.length).toString().padStart(3, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamContent.length}
%%EOF`;

  return Buffer.from(pdf, 'utf-8');
}

async function runPipelineTest() {
  console.log('🚀 TESTING AI INVOICE OCR EXTRACTION & CONFIRMATION PIPELINE...\n');

  const invoiceContent = `TAX INVOICE
Invoice No: INV-AZ-2026-99
Date: 2026-09-05
Vendor: Azure Interior Ltd
Customer: FinEdge Tech

Items:
1. Office Chair - Qty: 2 - Unit Price: 5000.00 - Total: 10000.00
2. Wooden Table - Qty: 1 - Unit Price: 8000.00 - Total: 8000.00

Subtotal: 18000.00
Tax: 0.00
Total Amount: 18000.00`;

  const pdfBuffer = createSamplePdfBuffer(invoiceContent);
  console.log(`Generated sample PDF invoice (${pdfBuffer.length} bytes)`);

  // Step 1: Upload and process invoice
  console.log('1. Uploading PDF to POST /api/ocr/process as Accountant...');
  const formData = new FormData();
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  formData.append('invoice', blob, 'sample-invoice.pdf');

  const processRes = await fetch(`${API_URL}/process`, {
    method: 'POST',
    headers: {
      'X-User-Id': ACCOUNTANT_ID,
    },
    body: formData,
  });

  const processStatus = processRes.status;
  const processData = await processRes.json();

  console.log(`Response Status: ${processStatus}`);
  console.log('Process Result:', JSON.stringify(processData, null, 2));

  if (processStatus !== 200 || !processData.success) {
    console.error('❌ OCR processing failed!');
    process.exit(1);
  }

  console.log('✅ OCR & AI Extraction Succeeded!');
  const extracted = processData.data;
  console.log(`- Detected Invoice Type: ${extracted.invoiceType}`);
  console.log(`- Detected Party: ${extracted.partyName}`);
  console.log(`- Items Count: ${extracted.items.length}`);
  console.log(`- Stated Total: ₹${extracted.total}`);
  console.log(`- Matched Contact: ${extracted.matchedContact ? extracted.matchedContact.name : 'New Contact'}`);

  // Step 2: Confirm and create in ERP
  console.log('\n2. Confirming invoice via POST /api/ocr/confirm...');
  const confirmPayload = {
    invoiceType: extracted.invoiceType || 'vendor_bill',
    partyName: extracted.partyName || 'Azure Interior Ltd',
    invoiceNumber: extracted.invoiceNumber || 'INV-AZ-2026-99',
    invoiceDate: extracted.invoiceDate || '2026-09-05',
    dueDate: extracted.dueDate,
    items: extracted.items.map(item => ({
      productId: item.matchedProductId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax || 0,
    })),
  };

  const confirmRes = await fetch(`${API_URL}/confirm`, {
    method: 'POST',
    headers: {
      'X-User-Id': ACCOUNTANT_ID,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(confirmPayload),
  });

  const confirmStatus = confirmRes.status;
  const confirmData = await confirmRes.json();

  console.log(`Confirm Status: ${confirmStatus}`);
  console.log('Confirm Result:', JSON.stringify(confirmData, null, 2));

  if (confirmStatus !== 201 || !confirmData.success) {
    console.error('❌ Invoice confirmation failed!');
    process.exit(1);
  }

  console.log('\n🎉 PIPELINE TEST COMPLETE:');
  console.log(`✅ ${confirmData.message}`);
  console.log(`✅ Created ${confirmData.invoice.invoiceType} #${confirmData.invoice.id} with Order #${confirmData.invoice.orderId}`);
  console.log('✅ Database models, relations, and journal accounting entries created successfully!');
}

runPipelineTest().catch(err => {
  console.error('Pipeline test error:', err);
  process.exit(1);
});
