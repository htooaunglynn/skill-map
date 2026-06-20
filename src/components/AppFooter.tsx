import { FooterTypewriterLine } from "@/src/components/footer/FooterTypewriterLine";

export function AppFooter() {
  return (
    <footer
      className="px-4 py-6 text-center font-mono text-xs"
      style={{ color: "var(--sm-muted)" }}
    >
      <FooterTypewriterLine />
    </footer>
  );
}
