import { FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';

interface FormData {
  admissionNumber?: string;
  admissionDate?: string;
  admissionTime?: string;
  patientName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  age?: string;
  sex?: string;
  address?: string;
  workContact?: string;
  homeContact?: string;
  doctorName?: string;
  doctorPracticeNumber?: string;
  medicalAid?: string;
  memberName?: string;
  memberId?: string;
  authorizationNumber?: string;
  dependentCode?: string;
}

export default function PatientAdmissionForm() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const sendFileToWebhook = async (file: File) => {
    const formDataPayload = new FormData();
    formDataPayload.append('file', file);
    formDataPayload.append('filename', file.name);
    formDataPayload.append('filesize', file.size.toString());
    formDataPayload.append('filetype', file.type);
    formDataPayload.append('uploadTimestamp', new Date().toISOString());

    console.log('Sending file to webhook:', file.name);

    const webhookUrl = 'https://primary-production-9ca0.up.railway.app/webhook/upload-patient-form';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: formDataPayload,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const jsonResponse = await response.json();
    console.log('Webhook response:', jsonResponse);

    return jsonResponse;
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndExtract = async () => {
    if (uploadedFiles.length === 0) {
      setUploadError('Please select at least one file to upload.');
      setTimeout(() => setUploadError(null), 3000);
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setUploadError(null);

    try {
      console.log(`Starting upload of ${uploadedFiles.length} file(s) to webhook...`);

      for (const file of uploadedFiles) {
        const webhookResponse = await sendFileToWebhook(file);

        if (webhookResponse && Array.isArray(webhookResponse) && webhookResponse.length > 0) {
          const extractedData = webhookResponse[0];
          console.log('Extracted data from webhook:', extractedData);

          const mappedData: FormData = {
            admissionNumber: extractedData['Admission Number'],
            admissionDate: extractedData['Admission Date'],
            admissionTime: extractedData['Time'],
            patientName: extractedData['Patient Name'],
            idNumber: extractedData['ID Number'],
            dateOfBirth: extractedData['Date of Birth (DOB)'],
            age: extractedData['Age']?.toString(),
            sex: extractedData['Sex'],
            address: extractedData['Address'],
            workContact: extractedData['Work Contact (WK)'],
            homeContact: extractedData['Home Contact (HM)'],
            doctorName: extractedData["Doctor's Name"],
            doctorPracticeNumber: extractedData['Doctor Practice Number (DR Pr No)'],
            medicalAid: extractedData['Medical Aid Scheme (MED)'],
            memberName: extractedData['Member Name (MEM)'],
            memberId: extractedData['Member ID'],
            authorizationNumber: extractedData['Authorization Number (AUTH)'],
            dependentCode: extractedData['Dependent Code']
          };

          setFormData(mappedData);
        } else {
          console.warn('Unexpected webhook response format');
        }
      }

      console.log('Files uploaded and data extracted successfully!');
      setUploadSuccess(true);

      setTimeout(() => {
        setUploadSuccess(false);
        setUploadedFiles([]);
      }, 5000);
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please check your webhook is running.';
      setUploadError(errorMessage);

      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {/* Header */}
          <div className="bg-slate-800 text-white px-4 sm:px-8 py-4 sm:py-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold">Patient Admission Form</h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1">Hospital Data Entry Template</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-8">
            <form className="space-y-6 sm:space-y-8">
              {/* Document Upload Section - Moved to Top */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Document & Image Upload
                </h2>
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center transition-colors ${uploading ? 'border-slate-500 bg-slate-50' : 'border-slate-300 hover:border-slate-400'}`}>
                    <Upload className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 ${uploading ? 'text-slate-600 animate-pulse' : 'text-slate-400'}`} />
                    <label className="cursor-pointer">
                      <span className="text-slate-600 font-medium text-sm sm:text-base">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span>
                      {!uploading && <span className="text-slate-500 text-sm sm:text-base"> or drag and drop</span>}
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">
                      Supports: Images (JPG, PNG, etc.), PDF, Word, and text documents
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-700">Selected Files:</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-3 sm:px-4 py-3"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {(file.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="ml-2 sm:ml-3 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              disabled={uploading}
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadAndExtract}
                        disabled={uploading}
                        className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-emerald-600 text-white text-sm sm:text-base font-medium rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                        {uploading ? 'Uploading & Extracting...' : 'UPLOAD & EXTRACT'}
                      </button>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-fadeIn">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-emerald-800">Data Extracted Successfully!</h3>
                        <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                          Your file has been processed and the extracted data has been automatically populated in the form fields below.
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-2 sm:gap-3 animate-fadeIn">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xs sm:text-sm font-semibold text-red-800">Upload Failed</h3>
                        <p className="text-xs sm:text-sm text-red-700 mt-1">{uploadError}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Admission Information */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Admission Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={formData.admissionNumber || ''}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 890004778 DAY-IP"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={formData.admissionDate || ''}
                      onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.admissionTime || ''}
                      onChange={(e) => setFormData({ ...formData, admissionTime: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Patient Information */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={formData.patientName || ''}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., MST KWILI. ASANDE"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      ID Number
                    </label>
                    <input
                      type="text"
                      value={formData.idNumber || ''}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 2003046809087"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Age
                    </label>
                    <input
                      type="text"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 5 Years"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Sex
                    </label>
                    <select
                      value={formData.sex || ''}
                      onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors resize-none"
                      placeholder="e.g., PO Box 143 Ugie"
                    />
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Work Contact (WK)
                    </label>
                    <input
                      type="tel"
                      value={formData.workContact || ''}
                      onChange={(e) => setFormData({ ...formData, workContact: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0833182776"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Home Contact (HM)
                    </label>
                    <input
                      type="tel"
                      value={formData.homeContact || ''}
                      onChange={(e) => setFormData({ ...formData, homeContact: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0833182776"
                    />
                  </div>
                </div>
              </section>

              {/* Medical Staff Information */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Medical Staff Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Doctor's Name
                    </label>
                    <input
                      type="text"
                      value={formData.doctorName || ''}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Dr Kathree, Dr M Kathree"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Doctor Practice Number (DR Pr No)
                    </label>
                    <input
                      type="text"
                      value={formData.doctorPracticeNumber || ''}
                      onChange={(e) => setFormData({ ...formData, doctorPracticeNumber: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0351937"
                    />
                  </div>
                </div>
              </section>

              {/* Insurance Information */}
              <section>
                <h2 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4 pb-2 border-b border-slate-200">
                  Insurance & Medical Aid Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Medical Aid Scheme (MED)
                    </label>
                    <input
                      type="text"
                      value={formData.medicalAid || ''}
                      onChange={(e) => setFormData({ ...formData, medicalAid: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Gems Dental - Emerald Vat001081294"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Member Name (MEM)
                    </label>
                    <input
                      type="text"
                      value={formData.memberName || ''}
                      onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Mrs Muumvu, MN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Member ID
                    </label>
                    <input
                      type="text"
                      value={formData.memberId || ''}
                      onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 6309160792080"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Authorization Number (AUTH)
                    </label>
                    <input
                      type="text"
                      value={formData.authorizationNumber || ''}
                      onChange={(e) => setFormData({ ...formData, authorizationNumber: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 491511"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                      Dependent Code
                    </label>
                    <input
                      type="text"
                      value={formData.dependentCode || ''}
                      onChange={(e) => setFormData({ ...formData, dependentCode: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 11"
                    />
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 text-sm sm:text-base bg-white text-slate-700 font-medium rounded-md border border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
