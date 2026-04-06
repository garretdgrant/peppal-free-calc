import CalculatorClient from "./CalculatorClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Free Reconstitution Calculator
        </h1>
        <div className="mx-auto mt-6 max-w-5xl sm:mt-8">
          <CalculatorClient />
        </div>
      </main>
    </div>
  );
}
