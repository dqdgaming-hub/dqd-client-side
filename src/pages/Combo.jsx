import { Package } from "lucide-react";
import ComboSection from "../components/home/ComboSection";
import PublicListPage from "./PublicListPage";

// Public combo packs page: play time + snacks for one price.
export default function Combo() {
  return (
    <PublicListPage
      eyebrow="Best value"
      title="Combo"
      accent="Packs"
      sub="Game time and snacks together for one price, plus bonus loyalty points on every pack."
      colors={["#ffd60a", "#ff2d78"]}
      countIcon={Package}
      pick={(d) => d.combo_packs || []}
      emptyText="No combo packs right now. Check back soon!"
    >
      {(d) => <ComboSection combos={d.combo_packs} page />}
    </PublicListPage>
  );
}
