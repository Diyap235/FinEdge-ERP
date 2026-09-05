const API_URL = 'http://localhost:3000/api/ocr';

const USERS = {
  ADMIN: 3,
  ACCOUNTANT: 4,
  USER: 5,
};

const EXPECTED_FORBIDDEN_MSG = "I don't have access to show you this information.";

async function runRoleTests() {
  console.log('🚀 TESTING AI INVOICE SCANNER ROLE PERMISSIONS & SECURITY...\n');
  let passed = 0;
  let total = 0;

  async function check(name, testFn) {
    total++;
    process.stdout.write(`TEST ${total}: ${name} ... `);
    try {
      const ok = await testFn();
      if (ok) {
        passed++;
        console.log('✅ PASS');
      } else {
        console.log('❌ FAIL');
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
    }
  }

  // 1. Unauthenticated to /process
  await check('Unauthenticated request to /api/ocr/process is rejected (401)', async () => {
    const res = await fetch(`${API_URL}/process`, { method: 'POST' });
    const data = await res.json();
    return res.status === 401 && data.error === 'Authentication required';
  });

  // 2. Unauthenticated to /confirm
  await check('Unauthenticated request to /api/ocr/confirm is rejected (401)', async () => {
    const res = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return res.status === 401 && data.error === 'Authentication required';
  });

  // 3. User role to /process -> 403 with exact error message
  await check('User (Contact) role to /api/ocr/process is forbidden (403) with exact message', async () => {
    const res = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: { 'X-User-Id': String(USERS.USER) },
    });
    const data = await res.json();
    return (
      res.status === 403 &&
      data.error === EXPECTED_FORBIDDEN_MSG
    );
  });

  // 4. User role to /confirm -> 403 with exact error message
  await check('User (Contact) role to /api/ocr/confirm is forbidden (403) with exact message', async () => {
    const res = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: {
        'X-User-Id': String(USERS.USER),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partyName: 'Forbidden Test',
        items: [{ productName: 'Chair', quantity: 1, unitPrice: 100 }],
      }),
    });
    const data = await res.json();
    return (
      res.status === 403 &&
      data.error === EXPECTED_FORBIDDEN_MSG
    );
  });

  // 5. Accountant role to /process -> allowed (reaches file validation, returns 400 for no file, NOT 403)
  await check('Accountant role has access to /api/ocr/process (returns 400 for empty file, NOT 403)', async () => {
    const res = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: { 'X-User-Id': String(USERS.ACCOUNTANT) },
    });
    const data = await res.json();
    return res.status === 400 && data.error.includes('No invoice file uploaded');
  });

  // 6. Admin role to /process -> allowed (returns 400 for empty file, NOT 403)
  await check('Admin role has access to /api/ocr/process (returns 400 for empty file, NOT 403)', async () => {
    const res = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: { 'X-User-Id': String(USERS.ADMIN) },
    });
    const data = await res.json();
    return res.status === 400 && data.error.includes('No invoice file uploaded');
  });

  console.log(`\n📋 ROLE SECURITY SUMMARY: ${passed}/${total} PASSED (${Math.round((passed/total)*100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runRoleTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
