import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { generateQuestions } from "../Ai/AiHelper";

/**
 * QuestionForm Component
 *
 * A modal form used to create or edit a question belonging to an interview.
 * Features:
 * - Select an interview for the question
 * - Enter the question text and difficulty
 * - Generate AI-based suggestions using interview role
 * - Apply AI suggestion with a single click
 *
 * Props:
 * - isOpen: boolean → whether the modal is visible
 * - onClose: () => void → callback to close modal
 * - onSave: (formData) => void → callback when form is submitted
 * - initialData: object | null → existing question data when editing
 * - interviews: object → map of interviews by id (for selection)
*/
const QuestionForm = ({ isOpen, onClose, onSave, initialData, interviews }) => {
  const [formData, setFormData] = useState(
    initialData || { question: "", difficulty: "Intermediate", interview_id: "" }
  );
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  /**
   * Reset state whenever modal opens/closes or initialData changes.
   * - Resets formData when opening or editing
   * - Clears AI suggestions when closing
  */
  useEffect(() => {
  if (isOpen) {
    setFormData(initialData || { question: "", difficulty: "Intermediate", interview_id: "" });
  } else {
    setAiSuggestions([]);
  }
}, [isOpen, initialData]);


  if (!isOpen) return null;

  /**
   * Handle input changes for controlled fields.
  */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Generate AI question suggestions for the selected interview.
   * - Requires `interview_id` to be selected first
   * - Uses interview role as context
  */
  const handleGenerate = async () => {
    if (!formData.interview_id) {
      toast.error("Please select an interview before using AI generation.");
      return;
    }

    try {
      setLoadingAI(true);

      const interview = interviews[formData.interview_id];
      const role = interview?.job_role || "Software Engineer";

      const aiResult = await generateQuestions(role);

      if (aiResult.questions?.length > 0) {
        setAiSuggestions(aiResult.questions); // { text, difficulty }
        toast.success("AI suggestions generated!");
      }
    } catch (err) {
      console.error("AI generation failed", err);
      toast.error("AI generation failed. Try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  /**
  * Apply selected AI suggestion to form.
  */
  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      question: suggestion.text,
      difficulty: suggestion.difficulty,
    }));
    toast.success("Suggestion applied");
  };

  /**
   * Validate and submit form.
   * Ensures interview is selected and question is filled.
  */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.interview_id || !formData.question.trim()) {
      toast.error("Please select an interview and enter a question.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50" >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Question" : "Add Question"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Interview selection */}
          <select
            name="interview_id"
            value={formData.interview_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">-- Select Interview --</option>
            {Object.values(interviews).map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>

          {/* Question input */}
          <textarea
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter question"
            rows={3}
          />

          {/* Difficulty */}
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option>Easy</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>

          {/* AI Suggestions */}
          <div className="space-y-2">
            <motion.button
              type="button"
              onClick={handleGenerate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loadingAI}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 w-full cursor-pointer"
            >
              {loadingAI ? "Generating..." : "🤖 Generate Questions"}
            </motion.button>

            {aiSuggestions.length > 0 && (
              <div className="grid gap-2 mt-3">
                {aiSuggestions.map((s, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSuggestionClick(s)}
                    className="p-3 border rounded cursor-pointer bg-gray-50 hover:bg-indigo-50"
                  >
                    <p className="text-sm text-gray-800">{s.text}</p>
                    <p
                      className={`text-xs font-medium mt-1 ${
                        s.difficulty === "Easy"
                          ? "text-green-600"
                          : s.difficulty === "Intermediate"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {s.difficulty}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons row */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionForm;
