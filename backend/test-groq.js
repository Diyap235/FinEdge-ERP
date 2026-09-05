import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing Groq API Connection...\n');

// Check if API key exists
if (!process.env.GROQ_API_KEY) {
  console.error('❌ ERROR: GROQ_API_KEY not found in .env file');
  console.error('   Please add your API key to backend/.env');
  process.exit(1);
}

console.log('✅ API key found in .env');
console.log(`   Key starts with: ${process.env.GROQ_API_KEY.substring(0, 7)}...`);
console.log();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    console.log('📡 Attempting to connect to Groq API...');
    const model = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    console.log(`   Model: ${model}`);
    console.log('   Message: "Say hello"');
    console.log();

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: 'Say hello in one sentence',
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log('✅ SUCCESS! Groq API is working!\n');
    console.log('📨 Response from AI:');
    console.log('   ' + completion.choices[0].message.content);
    console.log();
    console.log('🎉 Your AI chatbot integration is ready to use!');
    console.log('   Start the backend with: npm run dev');
    
  } catch (error) {
    console.error('❌ ERROR: Failed to connect to Groq API\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    console.error('  Status:', error.status || 'N/A');
    console.error('  Code:', error.code || 'N/A');
    console.error('  Type:', error.type || 'N/A');
    console.error();

    // Provide specific guidance
    if (error.status === 401 || error.message?.includes('API key')) {
      console.error('💡 Solution:');
      console.error('   Your API key is invalid or expired.');
      console.error('   Get a new key from: https://console.groq.com/keys');
      console.error('   Update backend/.env with: GROQ_API_KEY=your_new_key');
    } else if (error.status === 429) {
      console.error('💡 Solution:');
      console.error('   Rate limit exceeded. Wait 1-2 minutes and try again.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('💡 Solution:');
      console.error('   Cannot reach Groq API. Check your internet connection.');
      console.error('   Try opening https://api.groq.com in your browser.');
    } else if (error.message?.includes('model') || error.status === 404) {
      console.error('💡 Solution:');
      console.error('   Model "llama-3.3-70b-versatile" may not be available.');
      console.error('   Try a different model:');
      console.error('   - llama3-70b-8192');
      console.error('   - mixtral-8x7b-32768');
      console.error('   - llama3-8b-8192');
      console.error();
      console.error('   Edit backend/src/services/ai.service.js and change the model name.');
    } else {
      console.error('💡 Solution:');
      console.error('   Check TROUBLESHOOT_AI.md for more help.');
    }
    
    process.exit(1);
  }
}

test();
