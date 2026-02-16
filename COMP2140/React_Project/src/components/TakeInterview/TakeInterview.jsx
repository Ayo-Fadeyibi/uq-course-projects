import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { HiCheckBadge } from "react-icons/hi2";
import {
  getInterview,
  getQuestions,
  updateApplicant,
  createApplicantAnswer,
  getApplicant
} from "../../services/api";
import toast from "react-hot-toast";

/**
 * TakeInterview Component
 *
 * Provides the interactive flow for applicants to complete their interview:
 * - Loads applicant data either from props or via URL param
 * - Fetches interview details and associated questions
 * - Guides applicant through steps: Welcome → Questions → Review → Complete
 * - Supports voice input using `react-speech-recognition`
 * - Saves answers and updates applicant status when submitted
 *
 * Props:
 * - applicant (optional): applicant object, if passed directly from parent.
 *   If not provided, applicant will be fetched from `useParams()`.
*/
export default function TakeInterview({ applicant: applicantProp }) {
  const { id } = useParams(); //read from URL
  const [applicant, setApplicant] = useState(applicantProp || null);
  const [loading, setLoading] = useState(!applicantProp);

  // Flow states
  const [step, setStep] = useState("welcome"); // current step in interview flow
  const [interview, setInterview] = useState(null); // interview details
  const [questions, setQuestions] = useState([]); // all interview questions
  const [currentIndex, setCurrentIndex] = useState(0); // active question index
  const [answers, setAnswers] = useState({}); // collected answers
  const [submitted, setSubmitted] = useState(false); // whether interview is submitted

  // Voice recognition hook
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  /**
  * Load applicant data if not passed as prop (route mode).
  * Uses applicant id from URL params to fetch applicant info.
  */
  useEffect(() => {
    if (!applicant && id) {
      getApplicant(id)
        .then((data) => {
          setApplicant(data[0]); // assuming API returns [applicant]
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load applicant");
          setLoading(false);
        });
    }
  }, [id, applicant]);

  // Load interview + questions
  useEffect(() => {
    if (applicant) {
      getInterview(applicant.interview_id)
        .then((data) => setInterview(data[0]))
        .catch(() => toast.error("Failed to load interview"));

      getQuestions()
        .then((allQs) =>
          setQuestions(allQs.filter((q) => q.interview_id === applicant.interview_id))
        )
        .catch(() => toast.error("Failed to load questions"));
    }
  }, [applicant]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading interview...</p>;
  }

  if (!applicant) {
    return <p className="text-center mt-10 text-red-600">Applicant not found ❌</p>;
  };

  /**
   * Advance to the next question or move to review step.
   * Saves transcript as answer for current question before moving on.
   */
  const handleNext = () => {
    const currentQ = questions[currentIndex];
    if (transcript && transcript.trim() !== "") {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: transcript }));
      resetTranscript();
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep("review");
    }
  };

   /**
   * Submit answers for all questions.
   * - Creates applicant answers in DB
   * - Updates applicant status to "Completed"
   */
  const handleSubmit = async () => {
    try {
      for (const q of questions) {
        await createApplicantAnswer({
          applicant_id: applicant.id,
          interview_id: interview.id,
          question_id: q.id,
          answer: answers[q.id] || "",
        });
      }
      await updateApplicant(applicant.id, { interview_status: "Completed" });
      setSubmitted(true);
      setStep("complete");
      toast.success("Interview submitted ✅");
    } catch {
      toast.error("Error submitting answers ❌");
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 flex justify-center">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8">
        {/* Step 1 – Welcome */}
        {step === "welcome" && applicant && interview && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold mb-4">Welcome to Your Interview</h1>
            <p className="font-semibold">Applicant Details:</p>
            <p>
              {applicant.title} {applicant.firstname} {applicant.surname}
            </p>
            <p className="mb-4">{applicant.email_address}</p>

            <p className="font-semibold">Interview:</p>
            <p>{interview.title}</p>
            <p className="mb-6">{interview.description}</p>

            <button
              onClick={() => setStep("interview")}
              className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Start Interview
            </button>
          </motion.div>
        )}

        {/* Step 2 – Interview (Questions) */}
         {step === "interview" && (
          <>
            {questions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 text-gray-500"
              >
                There are no questions for this interview ❌
              </motion.div>
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-sm text-gray-500 mb-2">
                  Question {currentIndex + 1} of {questions.length}
                </p>
                <h2 className="text-lg font-semibold mb-4">
                  {questions[currentIndex].question}
                </h2>

                <div className="mb-4">
                  <p className="text-sm text-gray-500">
                    🎤 Microphone: {listening ? "on" : "off"}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {!listening && !answers[questions[currentIndex].id] && (
                      <button
                        type="button"
                        onClick={() =>
                          SpeechRecognition.startListening({ continuous: true })
                        }
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Start Recording
                      </button>
                    )}
                    {listening && (
                      <button
                        type="button"
                        onClick={SpeechRecognition.stopListening}
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Pause
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700 italic">{transcript}</p>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer"
                  >
                    {currentIndex < questions.length - 1 ? "Next" : "Review Answers"}
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Step 3 – Review */}
        {step === "review" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold mb-4">Review Your Answers</h2>
            <ul className="space-y-4 mb-6">
              {questions.map((q) => (
                <li key={q.id}>
                  <p className="font-medium">{q.question}</p>
                  <p className="text-gray-600">{answers[q.id] || "No answer"}</p>
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              >
                Submit Interview
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4 – Completion */}
        {step === "complete" && submitted && (
          <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="flex flex-col items-center justify-center text-center py-12"
>
  {/* Animated check badge */}
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6"
  >
    <HiCheckBadge className="text-green-600 w-12 h-12" />
  </motion.div>

  {/* Thank you text */}
  <motion.h2
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.6 }}
    className="text-2xl font-bold text-gray-800"
  >
    Thank you for completing the interview
  </motion.h2>

  {/*subtitle */}
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.6, duration: 0.6 }}
    className="text-gray-500 mt-2"
  >
    Your responses have been submitted successfully ✅
  </motion.p>
  </motion.div>

        )}
      </div>
    </div>
  );
}
