// Simple verification script to check setup
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

console.log('🔍 VERIFICATION SCRIPT\n');
console.log('=' .repeat(60));

// Check 1: Environment Variables
console.log('\n1️⃣  CHECKING ENVIRONMENT VARIABLES...\n');

if (process.env.DATABASE_URL) {
  console.log('   ✅ DATABASE_URL is set');
  console.log(`      ${process.env.DATABASE_URL.substring(0, 50)}...`);
} else {
  console.log('   ❌ DATABASE_URL is missing!');
}

if (process.env.GROQ_API_KEY) {
  console.log('   ✅ GROQ_API_KEY is set');
  console.log(`      Key starts with: ${process.env.GROQ_API_KEY.substring(0, 7)}...`);
} else {
  console.log('   ❌ GROQ_API_KEY is missing!');
}

if (process.env.PORT) {
  console.log(`   ✅ PORT is set to: ${process.env.PORT}`);
} else {
  console.log('   ⚠️  PORT not set (will default to 3000)');
}

// Check 2: Database Connection
console.log('\n2️⃣  CHECKING DATABASE CONNECTION...\n');

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  console.log('   ✅ Connected to database successfully!');
  
  // Try to query
  try {
    const userCount = await prisma.user.count();
    console.log(`   ✅ Can query database (found ${userCount} users)`);
  } catch (queryError) {
    if (queryError.message.includes('does not exist')) {
      console.log('   ⚠️  Database connected but tables do not exist');
      console.log('   📝 Run: npx prisma db push');
    } else {
      console.log('   ❌ Query failed:', queryError.message);
    }
  }
} catch (error) {
  console.log('   ❌ Cannot connect to database!');
  console.log('   Error:', error.message);
} finally {
  await prisma.$disconnect();
}

// Check 3: Groq SDK
console.log('\n3️⃣  CHECKING GROQ SDK...\n');

try {
  const { default: Groq } = await import('groq-sdk');
  console.log('   ✅ groq-sdk is installed');
  
  if (process.env.GROQ_API_KEY) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log('   ✅ Groq client initialized');
      
      // Test actual API call
      console.log('   🧪 Testing API call...');
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Say hi' }],
        max_tokens: 20,
      });
      
      console.log('   ✅ Groq API is working!');
      console.log(`   Response: ${completion.choices[0].message.content}`);
    } catch (apiError) {
      console.log('   ❌ Groq API call failed!');
      console.log('   Error:', apiError.message);
      
      if (apiError.status === 400 && apiError.message.includes('decommissioned')) {
        console.log('\n   💡 The model "llama-3.3-70b-versatile" may not be available.');
        console.log('      Try updating to a current model.');
      } else if (apiError.status === 401) {
        console.log('\n   💡 Your API key may be invalid or expired.');
        console.log('      Get a new one from: https://console.groq.com/keys');
      }
    }
  }
} catch (error) {
  console.log('   ❌ groq-sdk is not installed!');
  console.log('   📝 Run: npm install groq-sdk');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('\n📋 SUMMARY\n');
console.log('If all checks passed (✅), your setup is correct!');
console.log('If any failed (❌), follow the suggestions above.\n');
console.log('Next steps:');
console.log('  1. If database tables missing: npx prisma db push');
console.log('  2. Start backend: npm run dev');
console.log('  3. Test: curl http://localhost:3000/health\n');

process.exit(0);
