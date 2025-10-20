import { FileText, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function PatientAdmissionForm() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const sendFileToWebhook = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', file.name);
      formData.append('filesize', file.size.toString());
      formData.append('filetype', file.type);
      formData.append('uploadTimestamp', new Date().toISOString());

      const response = await fetch('http://localhost:5678/webhook-test/upload-patient-form', {
        method: 'POST',
        body: formData,
      });

      if (response.status >= 200 && response.status < 400) {
        console.log(`File ${file.name} uploaded successfully (Status: ${response.status})`);
      } else {
        throw new Error(`Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAndExtract = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    try {
      setUploading(true);

      for (const file of uploadedFiles) {
        await sendFileToWebhook(file);
      }

      alert(`Successfully uploaded ${uploadedFiles.length} file(s) to n8n!`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          {/* Header */}
          <div className="bg-slate-800 text-white px-8 py-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <FileText className="w-7 h-7" />
              <div>
                <h1 className="text-2xl font-semibold">Patient Admission Form</h1>
                <p className="text-slate-300 text-sm mt-1">Hospital Data Entry Template</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form className="space-y-8">
              {/* Admission Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Admission Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 890004778 DAY-IP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Patient Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Patient Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., MST KWILI. ASANDE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ID Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 2003046809087"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date of Birth (DOB)
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Age
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 5 Years"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sex
                    </label>
                    <select className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <textarea
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors resize-none"
                      placeholder="e.g., PO Box 143 Ugie"
                    />
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Work Contact (WK)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0833182776"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Home Contact (HM)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0833182776"
                    />
                  </div>
                </div>
              </section>

              {/* Medical Staff Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Medical Staff Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Doctor's Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Dr Kathree, Dr M Kathree"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Doctor Practice Number (DR Pr No)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 0351937"
                    />
                  </div>
                </div>
              </section>

              {/* Insurance Information */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Insurance & Medical Aid Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Medical Aid Scheme (MED)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Gems Dental - Emerald Vat001081294"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Member Name (MEM)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., Mrs Muumvu, MN"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Member ID
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 6309160792080"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Authorization Number (AUTH)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 491511"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dependent Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-colors"
                      placeholder="e.g., 11"
                    />
                  </div>
                </div>
              </section>

              {/* Document Upload Section */}
              <section>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                  Document & Image Upload
                </h2>
                <div className="space-y-4">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${uploading ? 'border-slate-500 bg-slate-50' : 'border-slate-300 hover:border-slate-400'}`}>
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${uploading ? 'text-slate-600 animate-pulse' : 'text-slate-400'}`} />
                    <label className="cursor-pointer">
                      <span className="text-slate-600 font-medium">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </span>
                      {!uploading && <span className="text-slate-500"> or drag and drop</span>}
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-sm text-slate-500 mt-2">
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
                            className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-md px-4 py-3"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-slate-500 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-700 truncate">
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
                              className="ml-3 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              disabled={uploading}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleUploadAndExtract}
                        disabled={uploading}
                        className="w-full px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        {uploading ? 'Uploading & Extracting...' : 'UPLOAD & EXTRACT'}
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-slate-800 text-white font-medium rounded-md hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 bg-white text-slate-700 font-medium rounded-md border border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
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
