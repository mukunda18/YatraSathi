"use client";

import { useState } from "react";
import { registerDriverAction } from "@/app/actions/authActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiIdentification, HiTruck, HiTag } from "react-icons/hi";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Card from "@/components/UI/Card";

export default function DriverRegistrationForm() {
    const [licenseNumber, setLicenseNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const result = await registerDriverAction({
            licenseNumber,
            vehicleType,
            vehicleNumber
        });

        if (result.success) {
            toast.success("Successfully registered as a driver!");
            router.push("/");
        } else {
            setErrors(result.errors || {});
            toast.error(result.message || "Failed to register as driver");
        }
        setLoading(false);
    };

    return (
        <Card className="p-8 md:p-10 border border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 text-center bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text">Become a Driver</h2>
            <p className="text-slate-400 text-sm text-center mb-8">Register your vehicle and license to start offering rides.</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                    label="License Number"
                    icon={<HiIdentification className="w-5 h-5" />}
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    error={errors.licenseNumber}
                    placeholder="LA-12345678"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                        label="Vehicle Type"
                        icon={<HiTruck className="w-5 h-5" />}
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        error={errors.vehicleType}
                        placeholder="Bike/Car"
                    />
                    <Input
                        label="Plate Number"
                        icon={<HiTag className="w-5 h-5" />}
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        error={errors.vehicleNumber}
                        placeholder="BA 1 PA..."
                    />
                </div>

                <Button type="submit" fullWidth loading={loading} className="mt-4">
                    Register as Driver
                </Button>
            </form>
        </Card>
    );
}
