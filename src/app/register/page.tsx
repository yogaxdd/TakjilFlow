"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const supabase = createClient();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== confirmPassword) {
			toast.error("Password tidak cocok");
			return;
		}

		if (password.length < 6) {
			toast.error("Password minimal 6 karakter");
			return;
		}

		setLoading(true);

		const { error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			toast.error("Registrasi gagal", {
				description: error.message,
			});
			setLoading(false);
			return;
		}

		toast.success("Registrasi berhasil!", {
			description: "Silakan cek email Anda untuk verifikasi.",
		});
		router.push("/login");
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-orange-50 px-4">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<Link href="/" className="inline-flex items-center gap-2 group">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg group-hover:shadow-emerald-200 transition-shadow">
							<span className="text-white font-bold text-lg">T</span>
						</div>
						<span className="text-2xl font-bold text-gray-900">
							Takjil<span className="text-emerald-600">Flow</span>
						</span>
					</Link>
				</div>

				<Card className="rounded-2xl shadow-xl border-0 bg-white/80 backdrop-blur-sm">
					<CardHeader className="text-center pb-2">
						<CardTitle className="text-2xl font-bold">Daftar</CardTitle>
						<CardDescription>
							Buat akun TakjilFlow baru
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleRegister} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="nama@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="rounded-xl h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									placeholder="Minimal 6 karakter"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="rounded-xl h-11"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Konfirmasi Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="Ulangi password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									className="rounded-xl h-11"
								/>
							</div>
							<Button
								type="submit"
								className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-emerald-300"
								disabled={loading}
							>
								{loading ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<UserPlus className="w-4 h-4 mr-2" />
								)}
								{loading ? "Memproses..." : "Daftar"}
							</Button>
						</form>
						<div className="mt-6 text-center text-sm text-muted-foreground">
							Sudah punya akun?{" "}
							<Link
								href="/login"
								className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
							>
								Masuk di sini
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
