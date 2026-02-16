import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  getInterview,
  getApplicants,
  deleteApplicant,
  createApplicant,
  updateApplicant,
} from "../../services/api";
import ApplicantForm from "./ApplicantForm"; 
import TakeInterview from "../TakeInterview/TakeInterview";

/**
 * ApplicantCard Component
 *
 * Displays all applicants and provides functionality to:
 * - Fetch applicants and their associated interview details
 * - Filter applicants by interview
 * - Add, edit, and delete applicants
 * - Copy a unique interview link to clipboard
 * - Start the interview process for a selected applicant
 *
 * State:
 * - loading: whether data is being fetched
 * - applicants: list of applicant objects
 * - interviews: map of interviews by id
 * - formOpen: toggle for applicant modal form
 * - editingApplicant: currently edited applicant
 * - filter: current filter value
 * - selectedApplicant: applicant currently taking interview
*/
const ApplicantCard = () => {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState([]);
  const [interviews, setInterviews] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState(null); // ✅ NEW

  /**
   * Fetch all applicants and their associated interviews.
   * Builds a map of interview_id → interview object for fast lookup.
  */
  useEffect(() => {
    getApplicants()
      .then(async (aData) => {
        setApplicants(aData);

        // Fetch interview titles for each unique interview_id
        const uniqueIds = [...new Set(aData.map((a) => a.interview_id))];
        const interviewMap = {};

        for (const id of uniqueIds) {
          try {
            const data = await getInterview(id);
            interviewMap[id] = data[0];
          } catch {
            toast.error(`Failed to load interview ${id}`);
          }
        }

        setInterviews(interviewMap);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load applicants");
        setLoading(false);
      });
  }, []);

  /**
  * Delete an applicant and update state.
  */
  const handleDelete = async (id) => {
    try {
      await deleteApplicant(id);
      setApplicants((prev) => prev.filter((i) => i.id !== id));
      toast.success("Applicant deleted successfully");
    } catch {
      toast.error("Error deleting applicant");
    }
  };

  /**
  * Open modal to edit a given applicant.
  */
  const handleEditClick = (applicant) => {
    setEditingApplicant(applicant);
    setFormOpen(true);
  };

  /**
  * Save a new or updated applicant.
  * - If editing, updates existing record
  * - If creating, adds new applicant and ensures interview is loaded
  */
  const handleSave = async (data) => {
    try {
      if (editingApplicant) {
        const updated = await updateApplicant(editingApplicant.id, data);
        setApplicants((prev) =>
          prev.map((i) => (i.id === editingApplicant.id ? updated[0] : i))
        );
        toast.success("Applicant updated");
      } else {
        const created = await createApplicant(data);
        const newApplicant = created[0];
        setApplicants((prev) => [...prev, newApplicant]);

        // fetch interview if missing
        if (!interviews[newApplicant.interview_id]) {
          const data = await getInterview(newApplicant.interview_id);
          setInterviews((prev) => ({
            ...prev,
            [newApplicant.interview_id]: data[0],
          }));
        }

        toast.success("Applicant created");
      }
      setFormOpen(false);
      setEditingApplicant(null);
    } catch {
      toast.error("Error saving applicant");
    }
  };

  // Framer Motion animation configs
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <p className="text-gray-500 text-center mt-8 animate-pulse">
        Loading applicants...
      </p>
    );
  }

  // If an applicant is selected → show TakeInterview instead of list
  if (selectedApplicant) {
    return (
      <TakeInterview
        applicant={selectedApplicant}
        onBack={() => setSelectedApplicant(null)} // pass a back callback
      />
    );
  }

  //Apply filter by interview
  const filteredApplicants = applicants.filter((a) => {
    const interview = interviews[a.interview_id];
    if (filter === "All") return true;
    if (filter === "Others") return !interview;
    return interview && interview.title === filter;
  });

  /**
  * Generate and copy unique interview link for applicant.
  * Uses current domain + applicant id.
  */
  const handleCopyLink = (id) => {
  const link = `${window.location.origin}/interview/${id}`;
  navigator.clipboard.writeText(link)
    .then(() => toast.success("Interview link copied!"))
    .catch(() => toast.error("Failed to copy link"));
  };


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
          <h1 className="text-2xl font-bold text-gray-800">Applicants</h1>
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
            setEditingApplicant(null);
            setFormOpen(true);
          }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          Add Applicant
        </button>
      </motion.div>

      {filteredApplicants.length === 0 ? (
        <p className="text-gray-500">No applicants match your filter.</p>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredApplicants.map((a) => {
            const interview = interviews[a.interview_id];
            return (
              <motion.div
                key={a.id}
                variants={item}
                whileHover={{ scale: 1.03 }}
                className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
              >
                <h2 className="text-lg font-semibold text-gray-800">
                  {a.title} {a.firstname} {a.surname}
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Email: {a.email_address}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {a.phone_number}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {a.interview_status}
                </p>
                <p className="text-sm text-indigo-600 mt-2">
                  Interview: {interview ? interview.title : "Unknown"}
                </p>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(a)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  >
                    Delete
                  </button>

                  <button
                      onClick={() => handleCopyLink(a.id)}
                      className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 cursor-pointer"
                    >
                      Copy Link
                  </button>

                  <button
                    onClick={() => setSelectedApplicant(a)} // open interview
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
                  >
                    Take Interview
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Shared Add/Edit Applicant Form Modal */}
      <ApplicantForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingApplicant(null);
        }}
        onSave={handleSave}
        initialData={editingApplicant}
      />
    </div>
  );
};

export default ApplicantCard;
