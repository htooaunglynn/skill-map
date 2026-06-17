export function AppFooter() {
  return (
    <footer
      className="px-4 py-6 text-center font-mono text-xs"
      style={{ color: "var(--sm-muted)" }}
    >
      <span>Created by Htoo Aung Lynn</span>
      <span aria-hidden="true"> · </span>
      <a
        href="https://htooaunglynn.uk"
        target="_blank"
        rel="noreferrer"
        className="transition-opacity hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        style={{ color: "var(--sm-accent)" }}
      >
        htooaunglynn.uk
      </a>
    </footer>
  );
}
