#!/usr/bin/env node

/**
 * Chatbot Setup Verification Script
 * 
 * This script checks if the chatbot is properly installed and configured.
 * Run with: node verify-chatbot-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🤖 Chatbot Setup Verification\n');
console.log('='.repeat(50));

let allChecks = true;

console.log('\nChecking files...');
const widgetPath = path.join(__dirname, 'src', 'components', 'ChatbotWidget.js');
if (fs.existsSync(widgetPath)) {
  console.log(' ChatbotWidget.js found');
} else {
  console.log(' ChatbotWidget.js NOT found');
  allChecks = false;
}

const cssPath = path.join(__dirname, 'src', 'styles', 'chatbot.css');
if (fs.existsSync(cssPath)) {
  console.log(' chatbot.css found');
} else {
  console.log(' chatbot.css NOT found');
  allChecks = false;
}

console.log('\n Checking configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log(' .env file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('REACT_APP_GEMINI_API_KEY=') && 
      !envContent.includes('REACT_APP_GEMINI_API_KEY=\n') &&
      !envContent.includes('REACT_APP_GEMINI_API_KEY=\r')) {
    console.log(' API key appears to be set');
  } else {
    console.log('  API key not set in .env file');
    console.log('   Add your key: REACT_APP_GEMINI_API_KEY=your_key_here');
  }
} else {
  console.log(' .env file NOT found');
  console.log('   Create it from .env.example');
  allChecks = false;
}

console.log('\n🔗 Checking integration...');
const appPath = path.join(__dirname, 'src', 'App.js');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  if (appContent.includes('ChatbotWidget')) {
    console.log(' ChatbotWidget imported in App.js');
  } else {
    console.log(' ChatbotWidget NOT imported in App.js');
    console.log('   Add: import ChatbotWidget from "./components/ChatbotWidget";');
    allChecks = false;
  }
  
  if (appContent.includes('<ChatbotWidget')) {
    console.log(' ChatbotWidget rendered in App.js');
  } else {
    console.log(' ChatbotWidget NOT rendered in App.js');
    console.log('   Add: <ChatbotWidget />');
    allChecks = false;
  }
} else {
  console.log(' App.js NOT found');
  allChecks = false;
}

console.log('\n Checking documentation...');
const docs = [
  'CHATBOT_README.md',
  'CHATBOT_QUICK_START.md',
  'CHATBOT_SETUP.md',
  'CHATBOT_FEATURES.md',
  'CHATBOT_TROUBLESHOOTING.md'
];

let docsFound = 0;
docs.forEach(doc => {
  if (fs.existsSync(path.join(__dirname, doc))) {
    docsFound++;
  }
});

console.log(` ${docsFound}/${docs.length} documentation files found`);

const testToolPath = path.join(__dirname, 'test-chatbot.html');
if (fs.existsSync(testToolPath)) {
  console.log(' test-chatbot.html found');
} else {
  console.log('  test-chatbot.html NOT found');
}

console.log('\n🔒 Checking security...');
const gitignorePath = path.join(__dirname, '..', '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (gitignoreContent.includes('.env') || gitignoreContent.includes('frontend/.env')) {
    console.log(' .env file is in .gitignore');
  } else {
    console.log('  .env should be added to .gitignore');
    console.log('   Add: frontend/.env');
  }
} else {
  console.log('  .gitignore not found');
}

console.log('\n' + '='.repeat(50));
if (allChecks) {
  console.log('\n All critical checks passed!');
  console.log('\n Next steps:');
  console.log('   1. Add your Gemini API key to .env');
  console.log('   2. Test with: open frontend/test-chatbot.html');
  console.log('   3. Start app: npm start');
  console.log('   4. Look for purple button in bottom-right corner');
} else {
  console.log('\n Some checks failed!');
  console.log('\n Fix the issues above and run this script again.');
}

console.log('\n Documentation:');
console.log('   Quick Start: frontend/CHATBOT_QUICK_START.md');
console.log('   Full Guide:  frontend/CHATBOT_SETUP.md');
console.log('   Help:        frontend/CHATBOT_TROUBLESHOOTING.md');

console.log('\n' + '='.repeat(50) + '\n');

process.exit(allChecks ? 0 : 1);
