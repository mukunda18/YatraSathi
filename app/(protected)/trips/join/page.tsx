import TripSearchForm from "@/components/trips/TripSearchForm";

export const metadata = {
    title: "Find a Ride | YatraSathi",
    description: "Search for available trips and shared rides near your route.",
};

export default function TripsPage() {
    return (
        <main className="h-dvh w-full relative">
            <TripSearchForm />
        </main>
    );
}
