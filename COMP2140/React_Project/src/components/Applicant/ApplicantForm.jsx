import { useState, useEffect } from "react";
import { getInterviews } from "../../services/api";

/**
 * ApplicantForm Component
 *
 * Modal form for creating or editing an applicant.
 * Allows the user to:
 * - Select an interview
 * - Enter applicant details (title, name, phone, email)
 * - Set the applicant's interview status
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility
 * - onClose (function): Called when modal is closed
 * - onSave (function): Called with formData on submit
 * - initialData (object): Optional, pre-fills form for editing
*/
export default function ApplicantForm({ isOpen, onClose, onSave, initialData }) {
  // Applicant form state
  const [formData, setFormData] = useState({
    title: "Mr",
    firstname: "",
    surname: "",
    phone_number: "",
    email_address: "",
    interview_id: "",
    interview_status: "Not Started",
  });

  // List of available interviews for dropdown
  const [interviews, setInterviews] = useState([]);

  /**
   * Populate form if editing an existing applicant
  */
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Fetch interviews for dropdown
  useEffect(() => {
    getInterviews()
      .then(setInterviews)
      .catch(() => console.error("Failed to load Interviews"));
  }, []);

  if (!isOpen) return null;

  /**
   * Handle form input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Submit form → calls onSave with current formData
  */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Applicant" : "Add Applicant"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Dropdown */}
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
            <option value="Other">Other</option>
          </select>

          {/* Interview Dropdown */}
          <select
            name="interview_id"
            value={formData.interview_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Interview --</option>
            {interviews.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>

          {/* Firstname */}
          <input
            type="text"
            name="firstname"
            placeholder="Enter Applicant Firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          {/* Surname */}
          <input
            type="text"
            name="surname"
            placeholder="Enter Applicant Surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          {/* Phone Number */}
          <input
            type="text"
            name="phone_number"
            placeholder="Enter Applicant Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          {/* Email */}
          <input
            type="email"
            name="email_address"
            placeholder="Enter Applicant Email"
            value={formData.email_address}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          {/* Status */}
          <select
            name="interview_status"
            value={formData.interview_status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Not Started">Not Started</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
