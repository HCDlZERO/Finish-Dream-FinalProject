// src/services/apiService.ts

// ฟังก์ชันสำหรับการลงทะเบียนผู้ใช้
export const registerUser = async (formData: any) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/bregister001/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to register');
    }
  } catch (error) {
    console.error('Registration API Error:', error);
    throw error;
  }
};

export const loginUser = async (formData: any) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/login/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      return await response.json(); // ถ้าคำขอสำเร็จ จะส่งข้อมูลจาก API กลับ
    } else {
      throw new Error('Failed to login');
    }
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลเจ้าหน้าที่
export const fetchOfficerData = async (officerId: string) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/officerMainB003/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ officerId }),
    });

    if (response.ok) {
      return await response.json(); // ถ้าคำขอสำเร็จ จะส่งข้อมูลจาก API กลับ
    } else {
      throw new Error('Failed to fetch officer data');
    }
  } catch (error) {
    console.error('Officer Data Fetch Error:', error);
    throw error;
  }
};


// 🔵 ฟังก์ชันสำหรับสร้างบิลใหม่
export const createBill = async (billData: any) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/officerMainB003/bills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(billData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Failed to create bill');
    }
  } catch (error) {
    console.error('Create Bill API Error:', error);
    throw error;
  }
};

// 🔵 ฟังก์ชันสำหรับดึงข้อมูลบิลของผู้ใช้งาน
export const fetchBillInfo = async (numberId: string) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/officerMainB003/Usersbills?numberId=${numberId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch bill information: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Fetch Bill Info API Error:', error);
    throw error;
  }

};

export const cancelService = async (numberId: string) => {
    const response = await fetch(`http://10.0.2.2:8082/api/officerMainB003/Cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ numberId }),
    });

    if (!response.ok) {
      throw new Error('Cancel service failed');
    }

    return await response.text(); // หรือ .json() แล้วแต่ API ส่งกลับมา
  };

  // ดึงข้อมูลยืนยันการชำระเงิน
  export const fetchConfirmInfo = async (firstName: string, lastName: string) => {
    const response = await fetch(`http://10.0.2.2:8082/api/officerMainB003/infoConfrim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch confirm info');
    }

    return await response.json();
  };

  // ยืนยันการชำระเงิน (API นี้จะสร้างทีหลัง)
  export const confirmPayment = async (data: { firstName: string, lastName: string }) => {
    const response = await fetch(`http://10.0.2.2:8082/api/officerMainB003/Confrim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Confirm payment failed');
    }

    return await response.text(); // หรือ .json() แล้วแต่ backend
  };

export const addUser = async (userData: any) => {
  const response = await fetch('http://10.0.2.2:8082/api/officerMainB003/Addusers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to add user');
  }

  return await response.text(); // หรือ response.json() ถ้า backend ส่งแบบ JSON
};

export const fetchRedAndCancelledBills = async () => {
  const response = await fetch('http://10.0.2.2:8082/api/technicianB004/bills/red-cancelled', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch red and cancelled bills');
  }

  return await response.json();
};

export const fetchMemberInfoByNumberId = async (numberId: string) => {
  const response = await fetch(`http://10.0.2.2:8082/api/technicianB004/member-info?numberId=${numberId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch member info');
  }

  return await response.json();
};

export const addHeadOfficer = async (officer: any) => {
  const response = await fetch('http://10.0.2.2:8082/api/headMainB005/addOfficer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(officer),
  });
  if (!response.ok) throw new Error('เพิ่มเจ้าหน้าที่ไม่สำเร็จ');
  return await response.text();
};

// 🔵 ดึงรายชื่อ Officer และ Technician
export const fetchAllHeadOfficers = async () => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/headMainB005/officers', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch officers list');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch Officers Error:', error);
    throw error;
  }
};

// 🔴 ลบพนักงานผ่าน numberId
export const deleteHeadOfficer = async (numberId: string) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/headMainB005/deleteOfficer?numberId=${numberId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to delete officer');
    }

    return await response.text(); // หรือ response.json() ถ้า backend ส่ง JSON
  } catch (error) {
    console.error('Delete Officer Error:', error);
    throw error;
  }
};
// 🔄 ดึงรายการ pending จากทั้ง request_members และ delete_members
export const fetchPendingUsers = async () => {
  const response = await fetch('http://10.0.2.2:8082/api/headMainB005/pendingUsers');
  if (!response.ok) throw new Error('Failed to fetch pending users');
  return await response.json();
};

// ✅ Approve request สมาชิกใหม่
export const approveRequestAPI = async (numberId: string, tag: 'Yes' | 'No') => {
  const response = await fetch(`http://10.0.2.2:8082/api/headMainB005/approveRequest?numberId=${numberId}&tag=${tag}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to send approve request');
  return await response.text();
};

// 🗑 จัดการลบผู้ใช้
export const processDeleteAPI = async (numberId: string, tag: 'Yes' | 'No') => {
  const response = await fetch(`http://10.0.2.2:8082/api/headMainB005/processDelete?numberId=${numberId}&tag=${tag}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to send delete request');
  return await response.text();
};

export const updateOfficerInfo = async (payload: any) => {
  const response = await fetch('http://10.0.2.2:8082/api/officerMainB003/updateOfficerInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Server Response:', errorText);
    throw new Error(errorText || 'Update failed');
  }

  return await response.text();
};


// ฟังก์ชันสำหรับดึงบิลล่าสุดตาม id (แบบใช้งานจริง)
export const fetchLatestBillById = async (id: number) => {
  const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getLatestBill?id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // ✅ ตามตัวอย่างที่คุณส่งมา
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch latest bill');
  }

  const result = await response.json();
  return result.data; // ✅ ดึงเฉพาะ data
};

// ✅ 1. ดึง QR Code จาก officerId
export const fetchQrCodeByOfficerId = async (officerId: number) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getQrCode?officerId=${officerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data; // ✅ return ทั้ง response
    } else {
      throw new Error('Failed to fetch QR Code');
    }
  } catch (error) {
    console.error('Fetch QR Code API Error:', error);
    throw error;
  }
};

// ✅ 2. ดึงข้อมูลธนาคารจาก officerId
export const fetchBankInfoByOfficerId = async (officerId: number) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getBankInfo?officerId=${officerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data; // ✅ return ทั้ง response
    } else {
      throw new Error('Failed to fetch Bank Info');
    }
  } catch (error) {
    console.error('Fetch Bank Info API Error:', error);
    throw error;
  }
};

// ✅ 3. อัปเดตสถานะบิล (หลังจากชำระเงิน)
export const updateBillStatus = async (numberId: string, paymentStatus: string, cashTime: number) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/userMain006/updateBill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numberId,
        paymentStatus,
        cashTime,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data; // ✅ return ผลลัพธ์หลัง update
    } else {
      throw new Error('Failed to update Bill');
    }
  } catch (error) {
    console.error('Update Bill API Error:', error);
    throw error;
  }
};

export const submitConfirmPayment = async (payload: {
  firstName: string;
  lastName: string;
  amountDue: number;
  confirmDate: string;
  confirmTime: string;
  officerName: string;
  confirmImage: string;
}) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/userMain006/confirmBill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), // ✅ ส่ง payload ตรง ๆ
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data;
    } catch (e) {
      console.warn('Response is not JSON:', text);
      return { message: text };
    }
  } catch (error) {
    console.error('Submit Confirm Payment API Error:', error);
    throw error;
  }
};


export const fetchBillHistory = async (numberId: string) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getBillHistory?numberId=${numberId}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
    const result = await response.json();

    if (result.message === 'success') {
      return result.data; // ✅ ดึง .data ออกมาเลยตรง ๆ
    } else {
      return []; // ✅ ถ้าไม่ success คืน array เปล่า
    }
  } catch (error) {
    console.error('Error fetching bill history:', error);
    return []; // ✅ ถ้า error คืน array เปล่า
  }
};


// ✅ ดึงรายละเอียดบิลจาก billId
export const fetchBillDetail = async (billId: string | number) => {
  try {
    const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getBillDetail?billId=${billId}`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      return data.data; // ✅ คืนเฉพาะ data object
    } else {
      throw new Error('Failed to fetch bill detail');
    }
  } catch (error) {
    console.error('Fetch Bill Detail API Error:', error);
    throw error;
  }
};

// ✅ ดึงข้อมูลเจ้าหน้าที่จาก officerId
export const fetchOfficerContact = async (officerId: number) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/userMain006/getOfficerContact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ officerId }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.data; // ✅ คืนเฉพาะ data object
    } else {
      throw new Error('Failed to fetch officer contact');
    }
  } catch (error) {
    console.error('Fetch Officer Contact API Error:', error);
    throw error;
  }
};
export const fetchUserDetail = async (numberId: string) => {
  const response = await fetch(`http://10.0.2.2:8082/api/userMain006/getUserDetail?numberId=${numberId}`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
  });
  const json = await response.json();
  if (json.message === 'success' && json.data) {
    return json.data; // ✅ return เฉพาะข้อมูล
  } else {
    throw new Error('Failed to fetch user detail');
  }
};


// อัปเดตข้อมูล user
export const updateUserInfo = async (data: any) => {
  const response = await fetch('http://10.0.2.2:8082/api/userMain006/updateUserInfo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
};
// ✅ ฟังก์ชันลบลูกบ้าน

export const deleteUser = async ({ numberId, firstName, lastName }: { numberId: string; firstName: string; lastName: string }) => {
  try {
    const response = await fetch('http://10.0.2.2:8082/api/officerMainB003/Deleteusers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numberId, firstName, lastName }),
    });

    const text = await response.text(); // เพราะ server ตอบเป็นข้อความปกติ
    console.log('🌐 Server response:', text);

    if (response.status >= 200 && response.status < 300) {
      return true; // สำเร็จ
    } else {
      throw new Error(`Delete failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    throw error;
  }
};




















