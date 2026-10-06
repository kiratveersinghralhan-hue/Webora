import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { track } from "../lib/analytics";

export function LinkButton({
  to = "/start-project",
  children = "Start a Project",
  secondary = false,
}: {
  to?: string;
  children?: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""}`}
      to={to}
      data-magnetic
      data-cursor="GO"
      onClick={() => to === "/start-project" && track("start_project_clicked")}
    >
      <span>{children}</span>
      {secondary ? <ArrowRight size={18} /> : <ArrowUpRight size={19} />}
    </Link>
  );
}
