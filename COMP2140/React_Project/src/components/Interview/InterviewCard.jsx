import {
  getInterviews,
  deleteInterview,
  createInterview,
  updateInterview,
  getQuestions,
  getApplicants,
} from "../../services/api";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import InterviewForm from "./InterviewForm";

/**
 * InterviewCard Component
 *
 * Displays a list of interviews with their stats, allows filtering,
 * and provides CRUD functionality for interviews.
 *
 * Features:
 * - Fetches interviews, questions, and applicants
 * - Counts number of questions and applicants per interview
 * - Tracks applicant statuses (Completed, In Progress, Not Started)
 * - Provides filtering by interview status
 * - Allows creating, editing, and deleting interviews
 * - Uses Framer Motion for animations
*/
const InterviewCard = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({});
  const [applicantCounts, setApplicantCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [filter, setFilter] = useState("All");

  /**
   * Fetches interviews, questions, and applicants on mount.
   * Builds stats (question counts, applicant counts, status counts).
  */
  useEffect(() => {
    async function fetchData() {
      try {
        const [iData, qData, aData] = await Promise.all([
          getInterviews(),
          getQuestions(),
          getApplicants(),
        ]);
        setInterviews(iData);

        // count questions
        const qCounts = {};
        qData.forEach((q) => {
          qCounts[q.interview_id] = (qCounts[q.interview_id] || 0) + 1;
        });
        setQuestionCounts(qCounts);

        // count applicants + statuses
        const aCounts = {};
        const sCounts = {};
        aData.forEach((a) => {
          aCounts[a.interview_id] = (aCounts[a.interview_id] || 0) + 1;

          if (!sCounts[a.interview_id]) {
            sCounts[a.interview_id] = {
              Completed: 0,
              "In Progress": 0,
              "Not Started": 0,
            };
          }
          sCounts[a.interview_id][a.interview_status] =
            (sCounts[a.interview_id][a.interview_status] || 0) + 1;
        });
        setApplicantCounts(aCounts);
        setStatusCounts(sCounts);

        setLoading(false);
      } catch (err) {
        toast.error("Failed to load interviews");
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /**
   * Deletes an interview by ID.
   * Updates local state after successful deletion.
   * @param id - Interview ID
  */
  const handleDelete = async (id) => {
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
      toast.success("Interview deleted successfully");
    } catch {
      toast.error("Error deleting interview");
    }
  };

  /**
   * Saves an interview (create or update).
   * - If editing, updates the existing interview
   * - If creating, adds a new interview
   * @param data - Interview form data
  */
  const handleSave = async (data) => {
    try {
      if (editingInterview) {
        const updated = await updateInterview(editingInterview.id, data);
        setInterviews((prev) =>
          prev.map((i) => (i.id === editingInterview.id ? updated[0] : i))
        );
        toast.success("Interview updated");
      } else {
        const created = await createInterview(data);
        setInterviews((prev) => [...prev, created[0]]);
        toast.success("Interview created");
      }
      setFormOpen(false);
      setEditingInterview(null);
    } catch {
      toast.error("Error saving interview");
    }
  };

  /**
   * Opens the edit modal for a specific interview.
   * @param interview - Interview object
  */
  const handleEditClick = (interview) => {
    setEditingInterview(interview);
    setFormOpen(true);
  };

  if (loading) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-500 text-center mt-8 animate-pulse"
      >
        Loading interviews...
      </motion.p>
    );
  }

  // filter interviews by status
  const filteredInterviews = interviews.filter((i) =>
    filter === "All" ? true : i.status === filter
  );

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const card = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: { opacity: 0, y: 40, scale: 0.9, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-6 py-8 mt-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Interviews</h1>
        <div className="flex gap-4 items-center">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="All">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingInterview(null);
              setFormOpen(true);
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 cursor-pointer"
          >
            Create Interview
          </motion.button>
        </div>
      </div>

      {filteredInterviews.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500"
        >
          No interviews found for this filter.
        </motion.p>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <AnimatePresence>
            {filteredInterviews.map((interview) => (
              <motion.div
                key={interview.id}
                variants={card}
                exit="exit"
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
                className="bg-white rounded-lg shadow p-6"
              >
                {/* Interview info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {interview.title}
                    </h2>
                    <p className="text-sm text-gray-500">{interview.job_role}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {interview.description}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      interview.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {interview.status}
                  </span>
                </div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-6 mt-4 text-sm text-gray-700"
                >
                  <span>💬 {questionCounts[interview.id] || 0} Questions</span>
                  <span>👥 {applicantCounts[interview.id] || 0} Participants</span>
                </motion.div>

                {/* Status breakdown row */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-3 gap-4 mt-4"
                >
                  <div className="bg-green-50 text-green-700 rounded p-3 text-center">
                    <p className="text-lg font-bold">
                      {statusCounts[interview.id]?.Completed || 0}
                    </p>
                    <p className="text-xs">Completed</p>
                  </div>
                  <div className="bg-gray-50 text-gray-700 rounded p-3 text-center">
                    <p className="text-lg font-bold">
                      {statusCounts[interview.id]?.["Not Started"] || 0}
                    </p>
                    <p className="text-xs">Not Started</p>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditClick(interview)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(interview.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interview Form Modal */}

        {formOpen && (   
            <InterviewForm
              isOpen={formOpen}
              onClose={() => {
                setFormOpen(false);
                setEditingInterview(null);
              }}
              onSave={handleSave}
              initialData={editingInterview}
            />
        )}

    </motion.div>
  );
};

export default InterviewCard;
