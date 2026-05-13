import { Header } from "./header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
