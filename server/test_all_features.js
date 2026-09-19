import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const CLIENT_URL = 'http://localhost:5173';

const runTests = async () => {
  console.log('====================================================');
  console.log('🔍 AUTOMATED COMPREHENSIVE ERP SYSTEM TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Client Dev Server Health
    console.log('[1/7] Testing Client Frontend Dev Server...');
    const clientRes = await axios.get(CLIENT_URL);
    assert(clientRes.status === 200 && clientRes.data.includes('<div id="root">'), 'Frontend Vite Server serves index.html');

    // 2. Backend Health
    console.log('\n[2/7] Testing Backend API Health & DB Connection...');
    const healthRes = await axios.get(`${BASE_URL}/health`);
    assert(healthRes.status === 200 && healthRes.data.status === 'online', 'Backend API is Online & Connected to Atlas DB');

    // 3. Indian Phone Validation Logic
    console.log('\n[3/7] Testing 10-Digit Indian Phone Validation Logic...');
    const indianPhoneRegex = /^[6-9]\d{9}$/;
    const testCases = [
      { phone: '9876543210', expected: true },
      { phone: '8123456789', expected: true },
      { phone: '7001234567', expected: true },
      { phone: '6398765432', expected: true },
      { phone: '1234567890', expected: false }, // starts with 1
      { phone: '5123456789', expected: false }, // starts with 5
      { phone: '98765', expected: false },      // only 5 digits
      { phone: '987654321012', expected: false },// 12 digits
      { phone: 'abcdefghij', expected: false }, // alphabets
    ];
    testCases.forEach((tc) => {
      const result = indianPhoneRegex.test(tc.phone);
      assert(result === tc.expected, `Phone '${tc.phone}' validation -> ${result}`);
    });

    // 4. Student Authentication & Profile / Dashboard
    console.log('\n[4/7] Testing Student Auth & Dashboard Data...');
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'rahul@student.edu',
      password: 'Student@123',
    });
    assert(studentLogin.data.success === true && studentLogin.data.token, 'Student Login (rahul@student.edu)');
    const studentToken = studentLogin.data.token;
    const studentId = studentLogin.data.user.profile._id;

    // Student Attendance & Fees
    const attRes = await axios.get(`${BASE_URL}/attendance/student/${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(attRes.data.success === true, 'Fetch Student Attendance Data');

    const feeRes = await axios.get(`${BASE_URL}/fees/student/${studentId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(feeRes.data.success === true, 'Fetch Student Fees Data');

    // 5. Faculty Auth & Marks Roster
    console.log('\n[5/7] Testing Faculty Auth & Attendance/Marks Endpoints...');
    const facultyLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'faculty.sharma@college.edu',
      password: 'Faculty@123',
    });
    assert(facultyLogin.data.success === true && facultyLogin.data.token, 'Faculty Login (faculty.sharma@college.edu)');
    const facultyToken = facultyLogin.data.token;

    const myCourses = await axios.get(`${BASE_URL}/academics/subjects`, {
      headers: { Authorization: `Bearer ${facultyToken}` },
    });
    assert(myCourses.data.success === true && Array.isArray(myCourses.data.data), 'Faculty can access assigned subjects roster');

    // 6. Notices & Circular Attachment Verification
    console.log('\n[6/7] Testing Campus Notices & Attachment Support...');
    const noticesRes = await axios.get(`${BASE_URL}/notices`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(noticesRes.data.success === true && Array.isArray(noticesRes.data.data), 'Notices retrieved successfully');

    // 7. Admin Auth & Faculty Management Endpoint
    console.log('\n[7/7] Testing Admin Auth & Cascade Faculty Control...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@college.edu',
      password: 'Admin@123',
    });
    assert(adminLogin.data.success === true && adminLogin.data.token, 'Admin Login (admin@college.edu)');
    const adminToken = adminLogin.data.token;

    const facultyList = await axios.get(`${BASE_URL}/faculty`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(facultyList.data.success === true && Array.isArray(facultyList.data.data), 'Admin can list faculty members');

    const pendingApprovals = await axios.get(`${BASE_URL}/faculty/pending-approvals`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(pendingApprovals.data.success === true, 'Admin can view pending faculty approvals');

    // 8. OTP Generation & Delivery Flow
    console.log('\n[8/8] Testing Registration OTP Dispatch Flow...');
    const otpRes = await axios.post(`${BASE_URL}/auth/send-register-otp`, {
      email: 'researcherprince99@gmail.com',
    });
    assert(otpRes.data.success === true && (otpRes.data.devOtp || otpRes.data.emailSent), 'Registration OTP Generated & Dispatched');

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Test execution error:', err.response?.data || err.message);
  }
};

runTests();
