import Navbar from "@/components/navbar/Navbar";
import Calendar from "@/components/calendar/Calendar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalender PM2.5 Jakarta",
  description: "Tampilkan data kualitas udara PM2.5 berdasarkan tanggal di Jakarta",
  keywords: ["PM2.5", "Jakarta", "kualitas udara", "kalender"],
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Calendar />
      </main>
    </div>
  );
}
