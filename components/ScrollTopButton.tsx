import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
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
    <>
      {visible && (
        <Button
          onClick={scrollToTop}
          className="bg-[#ADA9A9] rounded text-white hover:bg-gray-700 w-fit mb-1 md:mb-2"
        >
          <p className="hidden md:inline">To Top</p>
          <ArrowUp className="p-0 md:pl-2" />
        </Button>
      )}
    </>
  );
};

export default ScrollTopButton;
