import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * Hero Component
 *
 * Landing page hero section with:
 * - Lottie animation
 * - Headline and supporting description
 * - Call-to-action buttons linking to interviews and questions pages
 *
 * Uses Framer Motion for staggered entrance animations.
 */
export default function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <div className="flex-grow flex items-center justify-center px-6 h-screen">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center max-w-2xl"
      >
        {/* Floating animated Lottie */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            y: [0, -10, 0], // floating effect
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
          }}
          className="mb-6"
        >
          <DotLottieReact
            src="https://lottie.host/8ff871ae-d392-4569-95fc-80125e23b647/1MdR429wuD.lottie"
            loop
            autoplay
          />
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={item}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
          className="text-4xl font-extrabold text-gray-800 mb-4"
        >
          Streamline Your Hiring with{" "}
          <span className="text-indigo-600">AI</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          variants={item}
          className="text-gray-600 text-lg mb-6"
        >
          Create interviews, manage applicants, and use AI-powered transcription
          to make your recruitment process smoother and faster.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={item} className="flex gap-4 justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/interviews"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/questions"
              className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
            >
              Explore Questions
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
