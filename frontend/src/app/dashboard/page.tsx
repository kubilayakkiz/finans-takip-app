import ExchangeRateCard from "@/app/components/ExchangeRateCard";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Giriş başarılı, hoş geldiniz!</p>
      </div>
      <ExchangeRateCard />
    </div>
  );
}
