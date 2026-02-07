import { validateSession } from "@/app/actions/authActions";
import { getTripDetailsAction } from "@/app/actions/tripActions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { HiArrowLeft, HiClock, HiUser, HiCurrencyRupee, HiPhone, HiStar, HiTruck } from "react-icons/hi";

interface TripPageProps {
    params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripPageProps) {
    const { id } = await params;
    const user = await validateSession();

    if (!user) {
        redirect("/login");
    }

    const result = await getTripDetailsAction(id);

    if (!result.success || !result.trip) {
        notFound();
    }

    const trip = result.trip;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "waiting": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
            case "accepted": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            case "completed": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
            case "cancelled": return "text-red-400 bg-red-500/10 border-red-500/20";
            case "scheduled": return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
            default: return "text-slate-400 bg-slate-500/10 border-slate-500/20";
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-[600px] w-full max-w-[800px] bg-indigo-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto px-6 py-12">
                <Link
                    href="/trips"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white transition-colors mb-8"
                >
                    <HiArrowLeft className="w-4 h-4" />
                    Back to My Trips
                </Link>

                <div className="space-y-6">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <span className={`inline-flex px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusColor(trip.trip_status)}`}>
                                    {trip.trip_status}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                                <HiClock className="w-4 h-4" />
                                <span className="text-xs font-medium">{formatDate(trip.travel_date)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">From</p>
                                    <p className="text-lg text-white font-bold">{trip.from_address}</p>
                                </div>
                            </div>

                            {trip.stops && trip.stops.length > 0 && (
                                <div className="ml-1.5 pl-4 border-l border-dashed border-slate-700 space-y-3">
                                    {trip.stops.map((stop: any, index: number) => (
                                        <div key={stop.id} className="flex items-start gap-4">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0 -ml-[21px]" />
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-0.5">Stop {index + 1}</p>
                                                <p className="text-sm text-slate-300">{stop.stop_address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-start gap-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">To</p>
                                    <p className="text-lg text-white font-bold">{trip.to_address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Fare/Seat</p>
                                <p className="text-lg font-black text-emerald-400 flex items-center gap-1">
                                    <HiCurrencyRupee className="w-4 h-4" />
                                    {trip.fare_per_seat}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Total Seats</p>
                                <p className="text-lg font-black text-white">{trip.total_seats}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Available</p>
                                <p className="text-lg font-black text-white">{trip.available_seats}</p>
                            </div>
                        </div>

                        {trip.description && (
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2">Notes</p>
                                <p className="text-sm text-slate-400">{trip.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Driver</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                <HiUser className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-black text-white">{trip.driver_name}</p>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <HiStar className="w-4 h-4 text-amber-400" />
                                        {Number(trip.driver_rating).toFixed(1)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiTruck className="w-4 h-4" />
                                        {trip.vehicle_type} • {trip.vehicle_number}
                                    </span>
                                </div>
                            </div>
                            <a
                                href={`tel:${trip.driver_phone}`}
                                className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500/20 transition-colors"
                            >
                                <HiPhone className="w-5 h-5 text-emerald-400" />
                            </a>
                        </div>
                    </div>

                    {trip.my_request && (
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-4">Your Booking</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Status</p>
                                    <span className={`inline-flex px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusColor(trip.my_request.status)}`}>
                                        {trip.my_request.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Seats</p>
                                    <p className="text-lg font-black text-white">{trip.my_request.seats}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Pickup</p>
                                    <p className="text-sm text-white">{trip.my_request.pickup_address}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mb-1">Drop</p>
                                    <p className="text-sm text-white">{trip.my_request.drop_address}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Total Fare</p>
                                <p className="text-xl font-black text-emerald-400 flex items-center gap-1">
                                    <HiCurrencyRupee className="w-5 h-5" />
                                    {trip.my_request.total_fare}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
