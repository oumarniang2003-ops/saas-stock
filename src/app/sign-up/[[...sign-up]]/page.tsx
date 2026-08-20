import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-2xl mb-3 shadow-lg shadow-indigo-500/10">
            📦
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">StockMaster SaaS</h1>
          <p className="text-sm text-slate-400 mt-1">Créez votre compte et votre organisation en quelques secondes</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: "bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl rounded-2xl",
              headerTitle: "text-white font-semibold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700/80",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20",
              formFieldLabel: "text-slate-300 text-xs font-medium",
              formFieldInput: "bg-slate-950 border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-500/20",
              footerActionText: "text-slate-400 text-sm",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
            },
          }}
        />
      </div>
    </main>
  );
}
