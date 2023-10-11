import { useEffect, useState } from "react";
import { ArrowBigUp } from "lucide-react";
import { Button } from "./ui/button";

const ScrollTopButton = () => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrolled = document.documentElement.scrollTop;
    if (scrolled > 300) {
      setVisible(true);
    } else if (scrolled <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisible);

    return () => window.removeEventListener("scroll", toggleVisible);
  });

  return (
    <Button
      className="bg-explorer-dark-gray hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      onClick={scrollToTop}
      style={{
        display: visible ? "inline" : "none",
      }}
    >
      <ArrowBigUp />
    </Button>
  );
};

export default ScrollTopButton;
