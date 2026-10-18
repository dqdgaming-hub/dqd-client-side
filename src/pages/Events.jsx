import { CalendarDays } from "lucide-react";
import EventSection from "../components/home/EventSection";
import PublicListPage from "./PublicListPage";

// Public events page: the next event with its countdown first, then the rest.
export default function Events() {
  return (
    <PublicListPage
      eyebrow="Don't miss out"
      title="Upcoming"
      accent="Events"
      sub="Tournaments, watch parties and game nights at DQD Gaming. Seats are limited."
      colors={["#ff2d78", "#ffd60a"]}
      countIcon={CalendarDays}
      pick={(d) => d.events || []}
      emptyText="No upcoming events right now. New ones are announced every week."
    >
      {(d) => <EventSection events={d.events} page />}
    </PublicListPage>
  );
}
