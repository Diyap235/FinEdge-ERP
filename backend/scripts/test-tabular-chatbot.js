const API_URL = 'http://localhost:3000/api/ai/chat';

// User IDs from DB:
// 3: Admin (admin@finedge.com)
// 4: Accountant (accountant@finedge.com)
// 5: User (nimesh@example.com)

async function testScenario(name, { userId, message }, expected) {
  console.log('\n============================================================');
  console.log(`TEST: ${name}`);
  console.log(`User ID: ${userId ?? 'None'} | Message: "${message}"`);

  const headers = { 'Content-Type': 'application/json' };
  if (userId !== undefined) {
    headers['X-User-Id'] = String(userId);
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message }),
    });

    const status = res.status;
    const body = await res.json();

    console.log(`Status: ${status} (Expected: ${expected.status})`);
    console.log(`Response:`, JSON.stringify(body, null, 2));

    let pass = true;

    // 1. Status code check
    if (status !== expected.status) {
      console.log(`❌ FAIL: Expected status ${expected.status}, got ${status}`);
      pass = false;
    }

    // 2. Asterisk check (No ** or * anywhere)
    const rawJson = JSON.stringify(body);
    if (rawJson.includes('**') || rawJson.includes('\\*')) {
      console.log(`❌ FAIL: Response contains markdown asterisks!`);
      pass = false;
    }

    // 3. Table expectation check
    if (expected.shouldBeTable) {
      if (!body.table || !Array.isArray(body.table.columns) || !Array.isArray(body.table.rows)) {
        console.log(`❌ FAIL: Expected a table with columns and rows, but body.table was:`, body.table);
        pass = false;
      } else if (body.table.rows.length < 2) {
        console.log(`❌ FAIL: Expected at least 2 rows for table, got: ${body.table.rows.length}`);
        pass = false;
      } else {
        console.log(`✅ Table verified: ${body.table.columns.length} columns, ${body.table.rows.length} rows`);
      }
    } else if (expected.shouldNotBeTable) {
      if (body.table && body.table.rows && body.table.rows.length >= 2) {
        console.log(`❌ FAIL: Expected NON-table response, but got table:`, body.table);
        pass = false;
      } else {
        console.log(`✅ Confirmed NON-table response`);
      }
    }

    // 4. Permission denied check
    if (expected.permissionDenied) {
      if (body.error !== "I don't have access to show you this information.") {
        console.log(`❌ FAIL: Expected exact error "I don't have access to show you this information.", got: "${body.error}"`);
        pass = false;
      } else {
        console.log(`✅ Exact permission denied message confirmed`);
      }
    }

    if (pass) {
      console.log(`✅ PASS: ${name}`);
    } else {
      console.log(`❌ FAILED: ${name}`);
    }

    // 2.5s delay to avoid Groq rate limits
    await new Promise(r => setTimeout(r, 2500));
    return { name, pass };
  } catch (err) {
    console.error(`❌ ERROR:`, err.message);
    return { name, pass: false, error: err.message };
  }
}

async function run() {
  console.log('🚀 TESTING TABULAR CHATBOT CAPABILITIES ACROSS 7 SCENARIOS...\n');

  const results = [];

  // 1. Multiple Users (Admin role) -> Should be a table
  results.push(await testScenario(
    '1. Multiple users query (Admin)',
    { userId: 3, message: 'Show me all users' },
    { status: 200, shouldBeTable: true }
  ));

  // 2. Multiple Products (Admin role) -> Should be a table
  results.push(await testScenario(
    '2. Multiple products query (Admin)',
    { userId: 3, message: 'Show me products' },
    { status: 200, shouldBeTable: true }
  ));

  // 3. Multiple Invoices (Accountant role) -> Should be a table
  results.push(await testScenario(
    '3. Multiple invoices query (Accountant)',
    { userId: 4, message: 'Show me customer invoices' },
    { status: 200, shouldBeTable: true }
  ));

  // 4. Multiple Orders (Admin role) -> Should be a table
  results.push(await testScenario(
    '4. Multiple orders query (Admin)',
    { userId: 3, message: 'Show me sales orders' },
    { status: 200, shouldBeTable: true }
  ));

  // 5. Single-record response (User role asking about their specific latest order) -> Should NOT be a table
  results.push(await testScenario(
    '5. Single-record response (User latest order)',
    { userId: 5, message: 'What is the status of my latest order?' },
    { status: 200, shouldNotBeTable: true }
  ));

  // 6. Normal conversational response -> Should NOT be a table
  results.push(await testScenario(
    '6. Normal conversational response',
    { userId: 3, message: 'Hello, what can you do?' },
    { status: 200, shouldNotBeTable: true }
  ));

  // 7. Permission-denied response -> Should return 403 and no table
  results.push(await testScenario(
    '7. Permission-denied response (User asking company revenue)',
    { userId: 5, message: 'Show me company revenue' },
    { status: 403, permissionDenied: true, shouldNotBeTable: true }
  ));

  console.log('\n============================================================');
  console.log('📋 SUMMARY OF TABULAR CHATBOT TESTS:');
  const allPassed = results.every(r => r.pass);
  results.forEach(r => console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}`));
  console.log(`\nOVERALL: ${allPassed ? '🎉 ALL 7 SCENARIOS PASSED!' : '⚠️ SOME SCENARIOS FAILED'}`);

  process.exit(allPassed ? 0 : 1);
}

run();
