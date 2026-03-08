import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const handler = () => setVisible(main.scrollTop > 400);
    main.addEventListener("scroll", handler, { passive: true });
    return () => main.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  return (
    <Button
      size="icon"
      variant="secondary"
      className="fixed bottom-20 right-6 z-40 h-10 w-10 rounded-full shadow-lg transition-all hover:scale-105"
      onClick={() => document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </Button>
  );
}
