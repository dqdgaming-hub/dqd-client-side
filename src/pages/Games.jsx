import { Gamepad2 } from "lucide-react";
import CategorySection from "../components/home/CategorySection";
import PublicListPage from "./PublicListPage";

// Public games page: same cards and filters as the home page, in a full grid.
export default function Games() {
  return (
    <PublicListPage
      eyebrow="Pick your arena"
      title="All"
      accent="Games"
      sub="Consoles, pool tables and big-screen movies. Sign in to book an hour or more."
      colors={["#00f5ff", "#7b2fff"]}
      countIcon={Gamepad2}
      pick={(d) => (d.categories || []).flatMap((c) => c.games || [])}
      emptyText="New games are on the way. Check back soon!"
    >
      {(d) => <CategorySection categories={d.categories} page />}
    </PublicListPage>
  );
}
