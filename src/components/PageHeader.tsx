import Link from "next/link";

export function PageHeader({ title, eyebrow, action, backHref="/", backLabel="回首頁" }: { title: string; eyebrow?: string; action?: React.ReactNode; backHref?:string; backLabel?:string }) {
  return (
    <header className="page-header">
      <Link href={backHref} className="icon-button" aria-label={backLabel}>←</Link>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {action ?? <span className="h-11 w-11" />}
    </header>
  );
}
