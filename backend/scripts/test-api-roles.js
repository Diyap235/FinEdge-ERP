const API_URL = 'http://localhost:3000/api/ai/chat';

// User IDs from DB:
// 3: Admin (admin@finedge.com)
// 4: Accountant (accountant@finedge.com)
// 5: User (nimesh@example.com)

async function testEndpoint(name, { userId, message, conversation = [] }, expectedStatus = 200) {
  console.log(`\n============================================================`);
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
      body: JSON.stringify({ message, conversation }),
    });

    const status = res.status;
    const body = await res.json();
    console.log(`Status: ${status} (Expected: ${expectedStatus})`);
    console.log(`Response:`, JSON.stringify(body, null, 2));

    let contentOk = true;
    if (expectedStatus === 403) {
      if (body.error !== "I don't have access to show you this information.") {
        console.log(`⚠️ Expected error message "I don't have access to show you this information." but got: "${body.error}"`);
        contentOk = false;
      }
    } else if (expectedStatus === 200) {
      if (typeof body.reply === 'string' && (body.reply.includes('**') || body.reply.includes('*'))) {
        console.log(`⚠️ reply contains markdown asterisks: "${body.reply}"`);
        contentOk = false;
      }
      if (Array.isArray(body.details)) {
        for (const d of body.details) {
          if (typeof d === 'string' && (d.includes('**') || d.includes('*'))) {
            console.log(`⚠️ detail contains markdown asterisks: "${d}"`);
            contentOk = false;
          }
        }
      }
    }

    const statusOk = status === expectedStatus && contentOk;
    if (statusOk) {
      console.log(`✅ PASS: ${name}`);
    } else {
      console.log(`❌ FAIL: Expected status ${expectedStatus} and valid content, got status ${status}`);
    }
    return { name, status, body, pass: statusOk };
  } catch (err) {
    console.error(`❌ ERROR:`, err.message);
    return { name, error: err.message, pass: false };
  }
}

async function runAllTests() {
  console.log('🚀 RUNNING COMPREHENSIVE ROLE-BASED AI COPILOT TESTS...\n');

  const results = [];

  // 1. Missing Auth
  results.push(await testEndpoint('1. Unauthenticated Request (No header)', { message: 'Hello' }, 401));

  // 2. Missing Message
  results.push(await testEndpoint('2. Missing Message Body', { userId: 3, message: '' }, 400));

  // 3. Admin Tests
  results.push(await testEndpoint('3. Admin: Greeting', { userId: 3, message: 'Hello' }, 200));
  results.push(await testEndpoint('4. Admin: Show me today\'s sales', { userId: 3, message: "Show me today's sales" }, 200));
  results.push(await testEndpoint('5. Admin: Show me low stock products', { userId: 3, message: 'Show me low stock products' }, 200));
  results.push(await testEndpoint('6. Admin: Show me total revenue this month', { userId: 3, message: 'Show me total revenue this month' }, 200));

  // 4. Accountant Tests
  results.push(await testEndpoint('7. Accountant: Show me pending invoices', { userId: 4, message: 'Show me pending invoices' }, 200));
  results.push(await testEndpoint('8. Accountant: Show me vendor bills', { userId: 4, message: 'Show me vendor bills' }, 200));
  results.push(await testEndpoint('9. Accountant: Show me all admin users (Forbidden)', { userId: 4, message: 'Show me all admin users' }, 403));

  // 5. User Tests
  results.push(await testEndpoint('10. User: Show me products', { userId: 5, message: 'Show me products' }, 200));
  results.push(await testEndpoint('11. User: Show me my orders', { userId: 5, message: 'Show me my orders' }, 200));
  results.push(await testEndpoint('12. User: Show me company revenue (Forbidden)', { userId: 5, message: 'Show me company revenue' }, 403));
  results.push(await testEndpoint('13. User: Show me all vendor payments (Forbidden)', { userId: 5, message: 'Show me all vendor payments' }, 403));

  console.log('\n============================================================');
  console.log('📋 SUMMARY OF RESULTS:');
  const allPassed = results.every(r => r.pass);
  results.forEach(r => console.log(`  ${r.pass ? '✅' : '❌'} ${r.name}`));
  console.log(`\nOVERALL: ${allPassed ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'}`);
}

runAllTests();
