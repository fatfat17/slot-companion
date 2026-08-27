import Link from "next/link";

export function PageHeader({ title, eyebrow, action }: { title: string; eyebrow?: string; action?: React.ReactNode }) {
  return (
    <header className="page-header">
      <Link href="/" className="icon-button" aria-label="回首頁">←</Link>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {action ?? <span className="h-11 w-11" />}
    </header>
  );
}
