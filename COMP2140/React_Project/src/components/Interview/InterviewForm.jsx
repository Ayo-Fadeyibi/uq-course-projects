import { useState, useEffect } from "react";

/**
 * InterviewForm Component
 *
 * A modal form used to create or edit an interview.
 * Features:
 * - Fields for title, job role, description, and status
 * - Pre-fills fields when editing (via `initialData`)
 * - Calls `onSave` with form data on submit
 *
 * Props:
 * - isOpen: boolean → controls visibility of modal
 * - onClose: () => void → closes modal
 * - onSave: (formData) => void → handles saving interview data
 * - initialData: object | null → existing interview data for editing
*/
export default function InterviewForm({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    job_role: "",
    description: "",
    status: "Draft",
  });

  /**
   * Populate form with initialData when editing.
  */
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

   //Do not render modal if closed
  if (!isOpen) return null;

  /**
   * Handle input changes for controlled fields.
  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Submit form and call onSave with form data.
  */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">
          {initialData ? "Edit Interview" : "Add Interview"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          <input
            type="text"
            name="job_role"
            placeholder="Job Role"
            value={formData.job_role}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>

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
