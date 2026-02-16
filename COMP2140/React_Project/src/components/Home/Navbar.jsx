import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

/**
 * Navbar Component
 *
 * A responsive navigation bar with animations:
 * - Logo fade/slide-in
 * - Desktop links staggered entrance
 * - Mobile dropdown with slide/fade
 * - Hover/tap interactions
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add shadow when user scrolls past 10px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Variants
  const navLinks = {
    hidden: { opacity: 0, y: -10 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed w-full top-0 left-0 z-50 transition-shadow duration-300 bg-white ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="h-14 flex justify-around items-center px-6 md:px-12">
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" className="font-bold text-indigo-600 text-lg">
            ReadySetHire.
          </Link>
        </motion.div>

        {/* Desktop menu */}
        <div className="hidden md:flex gap-10 text-gray-700 font-medium">
          {["Interviews", "Questions", "Applicants"].map((item, i) => (
            <motion.div
              key={item}
              custom={i}
              initial="hidden"
              animate="show"
              variants={navLinks}
              whileHover={{ scale: 1.05, color: "#4f46e5" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={`/${item}`} className="transition">
                {item}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile menu button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </motion.button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-white px-6 pb-4 space-y-3"
          >
            {["Interviews", "Questions", "Applicants"].map((item, i) => (
              <motion.div
                key={item}
                custom={i}
                initial="hidden"
                animate="show"
                exit="hidden"
                variants={navLinks}
              >
                <Link
                  to={`/${item}`}
                  className="block py-2 text-gray-700 hover:text-indigo-600"
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
