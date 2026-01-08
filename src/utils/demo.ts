/**
 * Demo script to test TOTP generation
 * Run with: node --loader tsx src/utils/demo.ts
 */

import { generateTOTP, getTimeRemaining, getProgress } from './totp';

async function demo() {
  // Test with a known secret
  const secret = 'JBSWY3DPEHPK3PXP'; // This is "Hello World!" in Base32
  
  console.log('TOTP Demo');
  console.log('=========');
  console.log(`Secret: ${secret}`);
  console.log('');
  
  // Generate TOTP
  const token = await generateTOTP(secret);
  console.log(`Current TOTP: ${token}`);
  
  // Get time remaining
  const remaining = getTimeRemaining();
  console.log(`Time remaining: ${remaining} seconds`);
  
  // Get progress
  const progress = getProgress();
  console.log(`Progress: ${progress.toFixed(2)}%`);
  
  console.log('');
  console.log('Generating tokens for next 3 windows...');
  
  // Generate tokens for demonstration
  for (let i = 0; i < 3; i++) {
    const token = await generateTOTP(secret);
    const remaining = getTimeRemaining();
    console.log(`Token: ${token} (${remaining}s remaining)`);
    
    // Wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run demo if this file is executed directly (Node.js only)
// This code is not used in the browser build and is excluded from production
// @ts-ignore - process is only available in Node.js
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  demo().catch(console.error);
}
