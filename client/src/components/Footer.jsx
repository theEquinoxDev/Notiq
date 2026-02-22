import { FaGithub } from "react-icons/fa";

const Footer = () => (
  <footer className="border-t border-border-subtle px-5 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
    <span className="font-mono text-[11px] text-ink-faint tracking-wide">
      made with <span className="text-fill">♥</span> by Aditya
    </span>
    <a
      href="https://github.com/theEquinoxDev/Notiq"
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-faint hover:text-fill transition-colors duration-150"
      title="github.com/theEquinoxDev"
    >
      <FaGithub className="text-base" />
    </a>
  </footer>
);

export default Footer;
