import TripSearchForm from "@/components/trips/TripSearchForm";

export const metadata = {
    title: "Find a Ride | YatraSathi",
    description: "Search for available trips and shared rides near your route.",
};

export default function TripsPage() {
    return (
        <main className="h-screen w-full relative">
            <TripSearchForm />
        </main>
    );
}
