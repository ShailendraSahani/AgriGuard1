import { NextResponse } from 'next/server';
import { testEmailConnection, sendSignupCongrats } from '@/lib/email';

export async function GET() {
  try {
    console.log('Testing email connection...');

    // Test email server connection
    const connectionTest = await testEmailConnection();

    if (!connectionTest) {
      return NextResponse.json({
        success: false,
        message: 'Email server connection failed. Check your SMTP settings.',
        env: {
          EMAIL_HOST: process.env.EMAIL_HOST,
          EMAIL_PORT: process.env.EMAIL_PORT,
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
          EMAIL_FROM: process.env.EMAIL_FROM,
        }
      }, { status: 500 });
    }

    // Test sending an actual email
    const testEmail = process.env.EMAIL_USER || 'test@example.com';
    await sendSignupCongrats(testEmail, 'Test User', 'farmer');

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully!',
      testEmail: testEmail,
      env: {
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
        EMAIL_FROM: process.env.EMAIL_FROM,
      }
    });
  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        EMAIL_HOST: process.env.EMAIL_HOST,
        EMAIL_PORT: process.env.EMAIL_PORT,
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
        EMAIL_FROM: process.env.EMAIL_FROM,
      }
    }, { status: 500 });
  }
}
