import { getCurrentUser } from "@/lib/auth-utils";
import { simulateLogin, simulateLogout } from "@/app/actions/simulate-auth";
import Link from "next/link";

export default async function RootPage() {
  const user = await getCurrentUser(); // Get the simulated user from cookies

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">
        Learning Platform <span className="text-purple-600">Dev Portal</span>
      </h1>

      {user ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {user.email[0].toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-500 mb-6">{user.email}</p>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/my-courses"
              className="bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
            >
              Go to My Learning
            </Link>

            <form action={simulateLogout}>
              <button
                type="submit"
                className="w-full text-red-500 font-semibold py-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out (Clear Cookie)
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
          <p className="text-gray-600 mb-8">
            The authentication system is currently in development. Use the
            button below to simulate a successful login.
          </p>

          <form action={simulateLogin}>
            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-xl"
            >
              Simulate Login
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-400">
            This will set a <code className="bg-gray-100 px-1">user_data</code>{" "}
            HTTP-only cookie.
          </p>
        </div>
      )}
    </div>
  );
}
