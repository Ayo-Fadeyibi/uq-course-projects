import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getInterview,
  getInterviews, 
  getQuestions,
  deleteQuestion,
  updateQuestion,
  createQuestion,
} from "../../services/api";
import QuestionForm from "./QuestionForm";

/**
 * QuestionCard Component
 *
 * Displays all questions across interviews with filtering,
 * editing, deletion, and creation capabilities.
 *
 * Features:
 * - Fetches questions and their associated interviews
 * - Allows filtering by interview
 * - Provides add/edit/delete functionality
 * - Animates question cards using Framer Motion
*/
const QuestionCard = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [interviews, setInterviews] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filter, setFilter] = useState("All");

  /**
   * Fetches questions and interviews on mount.
   * Maps interview IDs to interview objects for fast lookup.
  */
  useEffect(() => {
    async function fetchData() {
      try {
        const [qData, iData] = await Promise.all([
          getQuestions(),
          getInterviews(),   // fetch all interviews
        ]);
        setQuestions(qData);

        // Map interviews by ID
        const interviewMap = {};
        iData.forEach((i) => {
          interviewMap[i.id] = i;
        });
        setInterviews(interviewMap);

        setLoading(false);
      } catch (err) {
        toast.error("Failed to load questions or interviews");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /**
   * Deletes a question by ID.
   * Updates local state after successful API call.
   * @param id - ID of the question to delete
  */
  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((i) => i.id !== id));
      toast.success("Question deleted successfully");
    } catch {
      toast.error("Error deleting question");
    }
  };

  /**
   * Opens the edit modal for a selected question.
   * @param question - Question object to edit
  */
  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setFormOpen(true);
  };

  /**
   * Saves a new or updated question.
   * - If editing, updates the existing question.
   * - If creating, adds a new question and fetches its interview if missing.
   * @param data - Form data for the question
  */
  const handleSave = async (data) => {
    try {
      if (editingQuestion) {
        const updated = await updateQuestion(editingQuestion.id, data);
        setQuestions((prev) =>
          prev.map((i) => (i.id === editingQuestion.id ? updated[0] : i))
        );
        toast.success("Question updated");
      } else {
        const created = await createQuestion(data);
        const newQuestion = created[0];
        setQuestions((prev) => [...prev, newQuestion]);

        if (!interviews[newQuestion.interview_id]) {
          const data = await getInterview(newQuestion.interview_id);
          setInterviews((prev) => ({
            ...prev,
            [newQuestion.interview_id]: data[0],
          }));
        }

        toast.success("Question created");
      }
      setFormOpen(false);
      setEditingQuestion(null);
    } catch {
      toast.error("Error saving question");
    }
  };

  // Framer Motion animation configs
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <p className="text-gray-500 text-center mt-8 animate-pulse">
        Loading questions...
      </p>
    );
  }

  //Filtering of data
  const filteredQuestions = questions.filter((q) => {
    const interview = interviews[q.interview_id];
    if (filter === "All") return true;
    if (filter === "Others") return !interview;
    return interview && interview.title === filter;
  });

  return (
    <div className="container mx-auto px-6 py-8 mt-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4"
      >
        <div className="flex gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Questions</h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="All">All</option>
            {Object.values(interviews).map((i) => (
              <option key={i.id} value={i.title}>
                {i.title}
              </option>
            ))}
            <option value="Others">Others</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingQuestion(null);
            setFormOpen(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          Add Question
        </button>
      </motion.div>

      {filteredQuestions.length === 0 ? (
        <p className="text-gray-500">No questions match your filter.</p>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredQuestions.map((q) => {
            const interview = interviews[q.interview_id];
            return (
              <motion.div
                key={q.id}
                variants={item}
                whileHover={{ scale: 1.03 }}
                className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {q.question}
                </h2>

                {/* Difficulty with color coding */}
                <p className="text-sm mt-2 text-gray-600">
                  Difficulty:{" "}
                  <span
                    className={`font-medium ${
                      q.difficulty === "Easy"
                        ? "text-green-600"
                        : q.difficulty === "Intermediate"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </p>

                <p className="text-sm text-indigo-600 mt-2">
                  Interview: {interview ? interview.title : "Unknown"}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(q)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add/Edit Question Form */}
      <QuestionForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSave}
        initialData={editingQuestion}
        interviews={interviews}
      />
    </div>
  );
};

export default QuestionCard;
