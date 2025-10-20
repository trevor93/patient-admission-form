async function handleFileUploadAndPopulate() {
  const fileInput = document.getElementById('fileUpload');

  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    alert('Please select a file to upload');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:5678/webhook-test/upload-patient-form', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const patientData = await response.json();

    populateFormFields(patientData);

    alert('Form populated successfully!');
  } catch (error) {
    console.error('Error uploading file:', error);
    alert(`Failed to upload file: ${error.message}`);
  }
}

function populateFormFields(data) {
  const fieldMappings = {
    admissionNumber: ['admission_number', 'admissionNumber', 'admission_no'],
    admissionDate: ['admission_date', 'admissionDate', 'date_of_admission'],
    admissionTime: ['admission_time', 'admissionTime', 'time'],
    patientName: ['patient_name', 'patientName', 'name', 'full_name'],
    idNumber: ['id_number', 'idNumber', 'id', 'identification_number'],
    dateOfBirth: ['date_of_birth', 'dateOfBirth', 'dob', 'birth_date'],
    age: ['age', 'patient_age'],
    sex: ['sex', 'gender'],
    address: ['address', 'patient_address', 'residential_address'],
    workContact: ['work_contact', 'workContact', 'work_phone', 'wk'],
    homeContact: ['home_contact', 'homeContact', 'home_phone', 'hm'],
    doctorName: ['doctor_name', 'doctorName', 'doctor', 'physician'],
    doctorPracticeNumber: ['doctor_practice_number', 'doctorPracticeNumber', 'dr_pr_no', 'practice_number'],
    medicalAidScheme: ['medical_aid_scheme', 'medicalAidScheme', 'medical_aid', 'med'],
    memberName: ['member_name', 'memberName', 'mem'],
    memberId: ['member_id', 'memberId', 'member_number'],
    authorizationNumber: ['authorization_number', 'authorizationNumber', 'auth', 'auth_number'],
    dependentCode: ['dependent_code', 'dependentCode', 'dependent']
  };

  for (const [fieldKey, possibleKeys] of Object.entries(fieldMappings)) {
    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        const element = document.querySelector(`[name="${fieldKey}"], [data-field="${fieldKey}"], #${fieldKey}`);

        if (element) {
          if (element.tagName === 'SELECT') {
            const option = Array.from(element.options).find(
              opt => opt.value.toLowerCase() === String(data[key]).toLowerCase()
            );
            if (option) {
              element.value = option.value;
            }
          } else if (element.tagName === 'TEXTAREA') {
            element.value = data[key];
          } else if (element.type === 'date') {
            element.value = formatDateForInput(data[key]);
          } else if (element.type === 'time') {
            element.value = formatTimeForInput(data[key]);
          } else {
            element.value = data[key];
          }

          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
        break;
      }
    }
  }
}

function formatDateForInput(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

function formatTimeForInput(timeString) {
  if (!timeString) return '';

  try {
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      const hours = String(parts[0]).padStart(2, '0');
      const minutes = String(parts[1]).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    const date = new Date(timeString);
    if (isNaN(date.getTime())) return '';

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleFileUploadAndPopulate, populateFormFields };
}
