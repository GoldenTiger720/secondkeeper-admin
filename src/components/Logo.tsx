
import { Link } from "react-router-dom";

export function Logo({ className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Link to="/" className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center">
        <img
          src="/Logo.png"
          alt="SecondKeeper Logo"
          className="h-12"
        />
      </div>
    </Link>
  );
}
