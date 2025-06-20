import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";
import { useI18n } from "@/i18n/i18n";

const ScrollTopButton = () => {
  const { t } = useI18n();
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
          className="w-fit mb-1 md:mb-2"
        >
          <p className="hidden md:inline">{t("scrollTopButton.toTop")}</p>
          <ArrowUp className="p-0 md:pl-2" />
        </Button>
      )}
    </>
  );
};

export default ScrollTopButton;
