import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

/**
 * Footer Component
 *
 * A modern multi-column footer with:
 * - Branding
 * - Quick navigation links
 * - Support links
 * - Social media icons
 * - Copyright notice
 */
const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold text-indigo-600">ReadySetHire.</h2>
        </div>

        {/* Product Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Product</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <Link to="/interviews" className="hover:text-indigo-600">
                Interviews
              </Link>
            </li>
            <li>
              <Link to="/questions" className="hover:text-indigo-600">
                Questions
              </Link>
            </li>
            <li>
              <Link to="/applicants" className="hover:text-indigo-600">
                Applicants
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Support</h3>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>
              <a href="#" className="hover:text-indigo-600">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-600">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-indigo-600">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-indigo-600"
            >
              <FaGithub size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-indigo-600"
            >
              <FaTwitter size={20} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-gray-500 hover:text-indigo-600"
            >
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ReadySetHire. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
