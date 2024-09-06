import React, { createContext, useEffect } from "react";

// Create the context
const TooltipContext = createContext<null>(null);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const tooltipElement = document.createElement("div");
    tooltipElement.style.position = "absolute";
    tooltipElement.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    tooltipElement.style.color = "white";
    tooltipElement.style.padding = "5px 10px";
    tooltipElement.style.borderRadius = "5px";
    tooltipElement.style.fontSize = "12px";
    tooltipElement.style.pointerEvents = "none";
    tooltipElement.style.zIndex = "10000";
    tooltipElement.style.display = "none";
    tooltipElement.style.whiteSpace = "nowrap";

    document.body.appendChild(tooltipElement);

    const handleMouseMove = (e: MouseEvent) => {
      const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);

      // Ensure the element exists and it's not the body or the tooltip itself
      if (
        hoveredElement &&
        hoveredElement !== document.body &&
        hoveredElement !== tooltipElement
      ) {
        // Only check the direct content of the hovered element, ignoring children
        const tagName = hoveredElement.tagName.toLowerCase();
        const classList = Array.from(hoveredElement.classList).join(" ");

        // Check if the direct textContent (excluding child elements) contains 'HP'
        if (
          hoveredElement.textContent &&
          hoveredElement.childElementCount === 0 &&
          hoveredElement.textContent.includes("HP")
        ) {
          tooltipElement.innerHTML = hoveredElement.innerHTML;
          // Get bounding box of the hovered element
          const boundingBox = hoveredElement.getBoundingClientRect();
          const tooltipHeight = tooltipElement.offsetHeight;

          // Position the tooltip above the element
          tooltipElement.style.top = `${
            boundingBox.top + window.scrollY - tooltipHeight - 10
          }px`; // 10px gap
          tooltipElement.style.left = `${boundingBox.left + window.scrollX}px`;
          tooltipElement.style.display = "block";
        } else {
          // Hide tooltip if 'HP' is not found or if the element has child elements
          tooltipElement.style.display = "none";
        }
      }
    };

    const handleMouseLeave = () => {
      tooltipElement.style.display = "none";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeChild(tooltipElement);
    };
  }, []);

  return (
    <TooltipContext.Provider value={null}>{children}</TooltipContext.Provider>
  );
};
