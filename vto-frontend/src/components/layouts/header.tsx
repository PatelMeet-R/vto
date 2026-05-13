import { Glasses } from "lucide-react";

export function Header() {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <p className="text-zinc-500 mt-2">
          {" "}
          <Glasses size={32} />
          Browse our collection.
        </p>
      </div>
      {/* new profile icon */}
    </div>
  );
}
