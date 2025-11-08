import * as admin from 'firebase-admin';
import { canModifyAppointment } from '../appointments/validateModification';

/**
 * Unit tests for the 24-hour validation rule
 * Run with: ts-node src/tests/validateModification.test.ts
 */

// Mock Timestamp for testing
function createMockTimestamp(date: Date): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(date);
}

function testCanModifyAppointment() {
  console.log('🧪 Running tests for canModifyAppointment...\n');

  const now = new Date();
  
  // Test 1: Regular user - more than 24 hours (should allow)
  {
    const appointmentDate = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 1: Regular user with 25 hours ahead: ${result ? 'PASS (can modify)' : 'FAIL (should allow)'}`);
    if (!result) throw new Error('Test 1 failed');
  }

  // Test 2: Regular user - exactly 24 hours (should NOT allow)
  {
    const appointmentDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Exactly 24 hours from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 2: Regular user with exactly 24 hours: ${!result ? 'PASS (cannot modify)' : 'FAIL (should not allow)'}`);
    if (result) throw new Error('Test 2 failed');
  }

  // Test 3: Regular user - less than 24 hours (should NOT allow)
  {
    const appointmentDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 3: Regular user with 12 hours ahead: ${!result ? 'PASS (cannot modify)' : 'FAIL (should not allow)'}`);
    if (result) throw new Error('Test 3 failed');
  }

  // Test 4: Regular user - appointment in the past (should NOT allow)
  {
    const appointmentDate = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 4: Regular user with past appointment: ${!result ? 'PASS (cannot modify)' : 'FAIL (should not allow)'}`);
    if (result) throw new Error('Test 4 failed');
  }

  // Test 5: Admin - less than 24 hours (should allow)
  {
    const appointmentDate = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'admin');
    console.log(`✓ Test 5: Admin with 1 hour ahead: ${result ? 'PASS (can modify)' : 'FAIL (should allow)'}`);
    if (!result) throw new Error('Test 5 failed');
  }

  // Test 6: AgendaManager - less than 24 hours (should allow)
  {
    const appointmentDate = new Date(now.getTime() + 0.5 * 60 * 60 * 1000); // 30 minutes from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'agendaManager');
    console.log(`✓ Test 6: AgendaManager with 30 minutes ahead: ${result ? 'PASS (can modify)' : 'FAIL (should allow)'}`);
    if (!result) throw new Error('Test 6 failed');
  }

  // Test 7: Admin - appointment in the past (should allow)
  {
    const appointmentDate = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'admin');
    console.log(`✓ Test 7: Admin with past appointment: ${result ? 'PASS (can modify)' : 'FAIL (should allow)'}`);
    if (!result) throw new Error('Test 7 failed');
  }

  // Test 8: Edge case - Regular user exactly at the boundary (24.0001 hours)
  {
    const appointmentDate = new Date(now.getTime() + (24 * 60 * 60 * 1000) + 1000); // 24 hours + 1 second
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 8: Regular user with 24h + 1s: ${result ? 'PASS (can modify)' : 'FAIL (should allow)'}`);
    if (!result) throw new Error('Test 8 failed');
  }

  // Test 9: Edge case - Regular user just under the boundary (23.9999 hours)
  {
    const appointmentDate = new Date(now.getTime() + (24 * 60 * 60 * 1000) - 1000); // 24 hours - 1 second
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'user');
    console.log(`✓ Test 9: Regular user with 24h - 1s: ${!result ? 'PASS (cannot modify)' : 'FAIL (should not allow)'}`);
    if (result) throw new Error('Test 9 failed');
  }

  // Test 10: Unknown role (should be treated as regular user)
  {
    const appointmentDate = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now
    const result = canModifyAppointment(createMockTimestamp(appointmentDate), 'unknownRole');
    console.log(`✓ Test 10: Unknown role with 12 hours ahead: ${!result ? 'PASS (cannot modify)' : 'FAIL (should not allow)'}`);
    if (result) throw new Error('Test 10 failed');
  }

  console.log('\n✅ All tests passed!\n');
}

// Run tests if this file is executed directly
if (require.main === module) {
  try {
    testCanModifyAppointment();
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  }
}

export { testCanModifyAppointment };
