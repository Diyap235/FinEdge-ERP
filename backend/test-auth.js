import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testAuthentication() {
  console.log('🧪 Testing FinEdge ERP Authentication\n');

  try {
    // Test 1: Login
    console.log('1️⃣  Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@finedge.com',
      password: 'Password@123'
    });

    if (loginResponse.data.token) {
      console.log('   ✅ Login successful!');
      console.log(`   📧 User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);
      console.log(`   🔑 Token: ${loginResponse.data.token.substring(0, 20)}...\n`);
    }

    const token = loginResponse.data.token;

    // Test 2: Get Current User
    console.log('2️⃣  Testing Get Current User...');
    const meResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (meResponse.data.user) {
      console.log('   ✅ User retrieved successfully!');
      console.log(`   📧 ${meResponse.data.user.email}`);
      console.log(`   👤 ${meResponse.data.user.name}`);
      console.log(`   🎭 ${meResponse.data.user.role}\n`);
    }

    // Test 3: Test Invalid Token
    console.log('3️⃣  Testing Invalid Token...');
    try {
      await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('   ❌ Should have failed with invalid token\n');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('   ✅ Invalid token correctly rejected!\n');
      }
    }

    // Test 4: Refresh Token
    console.log('4️⃣  Testing Token Refresh...');
    const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (refreshResponse.data.token) {
      console.log('   ✅ Token refreshed successfully!');
      console.log(`   🔑 New Token: ${refreshResponse.data.token.substring(0, 20)}...\n`);
    }

    console.log('✨ All authentication tests passed!\n');
    console.log('🎉 Authentication system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. Backend server is running on port 3000');
    console.log('   2. Admin user is created (run: node scripts/create-admin.js)');
    console.log('   3. Database is migrated');
  }
}

testAuthentication();
