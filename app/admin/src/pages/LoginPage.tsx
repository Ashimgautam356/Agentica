import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LottieAnimation } from "../components/LottieAnimation";
import { api } from "../api/client";
import type { CurrentAdmin } from "../api/admin";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { useToast } from "../components/Toast";
import employeeAnimation from "../assets/Employee content.json";
import logoUrl from "../assets/agentica.svg";
import greenCircleUrl from "../assets/green-cricle.png";
import orangeCircleUrl from "../assets/orange-circle.png";
import { getErrorMessage } from "../lib/utils";
import { setAdminToken } from "../lib/adminAuth";

type LoginResponse = {
  admin: CurrentAdmin;
  token: string;
};

export function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setError("");
    setIsSubmitting(true);

    try {
      const data = {
        email: form.get("email"),
        password: form.get("password"),
      };

      const result = await api<LoginResponse>("/api/admin/login", { method: "POST", data });
      const { admin } = result;

      if (!result.token) {
        throw new Error("Login succeeded but no auth token was returned.");
      }

      setAdminToken(result.token);

      toast.success(
        admin.emailVerifiedAt
          ? "Signed in successfully."
          : "Signed in. Verify your email to continue.",
      );
      navigate(admin.emailVerifiedAt ? "/dashboard" : "/verify-email");
    } catch (loginError) {
      const message = getErrorMessage(loginError, "Login failed");

      setError(message);
      toast.error(message);
      setIsSubmitting(false);
      return;
    }
  }

  return (
    <main className="min-h-screen bg-white font-sans text-[#241F14] motion-safe:animate-[login-fade-in_360ms_ease-out_both]">
      <section className="relative grid min-h-screen grid-cols-[minmax(360px,42%)_minmax(0,58%)] overflow-hidden max-lg:grid-cols-1">
        <img
          aria-hidden="true"
          className="pointer-events-none absolute left-[33.5%] top-[-4.25rem] z-20 h-[15.6rem] w-[17.5rem] opacity-100 motion-safe:animate-[login-circle-pop_640ms_160ms_cubic-bezier(.2,.8,.2,1)_both] max-lg:left-auto max-lg:right-[-5rem] max-sm:-right-[6.5rem] max-sm:-top-[5rem] max-sm:h-[12rem] max-sm:w-[13.5rem]"
          src={orangeCircleUrl}
        />
        <aside className="relative flex min-h-screen flex-col overflow-hidden bg-[#F3EBDB] px-[clamp(1.5rem,4.55vw,4.1rem)] py-[clamp(2rem,5.1vh,3.25rem)] max-lg:min-h-auto max-lg:px-8 max-lg:py-10 max-sm:px-5 max-sm:pb-8">
          <img
            aria-hidden="true"
            className="absolute -bottom-[5.75rem] -left-[6.25rem] z-50 h-[19.9rem] w-[16.25rem] opacity-100 motion-safe:animate-[login-circle-pop_640ms_260ms_cubic-bezier(.2,.8,.2,1)_both] max-sm:-bottom-[7.5rem] max-sm:-left-[7rem] max-sm:h-[15rem] max-sm:w-[12.25rem]"
            src={greenCircleUrl}
          />

          <img
            className="relative z-10 h-auto w-[283px] max-w-[72vw] motion-safe:animate-[login-slide-left_520ms_60ms_ease-out_both]"
            src={logoUrl}
            alt="Agentica"
          />

          <LottieAnimation
            animationData={employeeAnimation}
            className="relative z-10 mt-[clamp(1rem,3vh,2rem)] aspect-[328/315] w-[min(44rem,58vh,115%)] max-w-none self-center overflow-hidden motion-safe:animate-[login-scale-in_620ms_120ms_cubic-bezier(.2,.8,.2,1)_both] max-lg:w-[min(38rem,95vw)] max-sm:mt-6 max-sm:w-[min(25rem,105vw)]"
          />

          <div className="relative z-10 mt-[clamp(2rem,5vh,3.5rem)] max-w-[33rem] pb-4 motion-safe:animate-[login-slide-left_560ms_180ms_ease-out_both] max-lg:mt-8 max-lg:pb-0">
            <p className="text-[clamp(1.85rem,2.35vw,2.1rem)] font-extrabold leading-[1.18] tracking-normal max-sm:text-3xl">
              Run the store,
              <br />
              not the stack.
            </p>
            <p className="mt-5 max-w-[31rem] text-[1.12rem] font-semibold leading-8 text-[#8A8172] text-wrap-pretty max-sm:text-base max-sm:leading-7">
              Manage products, customers, reviews, and the Agentica AI operations layer from one
              focused admin workspace.
            </p>
          </div>
        </aside>

        <div className="flex min-h-screen items-start justify-start px-[clamp(2rem,6.95vw,6.25rem)] pt-[clamp(4.5rem,16.55vh,10.5rem)] max-lg:min-h-auto max-lg:px-8 max-lg:py-12 max-sm:px-5 max-sm:py-10">
          <section className="w-full max-w-[39.7rem] motion-safe:animate-[login-slide-right_560ms_80ms_ease-out_both]">
            <p className="text-[1.375rem] font-bold leading-none text-[#E8A33D]">Welcome Back!</p>
            <h1 className="mt-5 text-[clamp(2.3rem,4.4vw,3.25rem)] font-extrabold leading-[1.04] tracking-normal text-wrap-balance">
              Login to your account
            </h1>
            <p className="mt-5 max-w-[29rem] text-base font-medium leading-7 text-[#8A8172]">
              Enter your credentials to continue to the Agentica admin dashboard.
            </p>

            <form className="mt-[clamp(3rem,7vw,5.4rem)] grid gap-[2.4rem]" onSubmit={handleSubmit}>
              <label className="grid gap-3 text-base font-bold text-[#241F14]">
                Email
                <input
                  className="h-[3.4rem] rounded-[10px] border border-[#EFE7D8] bg-[#FBF8F2] px-5 text-base font-normal text-[#241F14] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/25"
                  name="email"
                  placeholder="admin@agentica.ai"
                  required
                  type="email"
                />
              </label>

              <label className="grid gap-3 text-base font-bold text-[#241F14]">
                Password
                <span className="relative block">
                  <input
                    className="h-[3.4rem] w-full rounded-[10px] border border-[#EFE7D8] bg-[#FBF8F2] px-5 pr-14 text-base font-normal text-[#241F14] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/25"
                    name="password"
                    placeholder="Enter your password"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-[#8A8172] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[#EFE7D8] hover:text-[#241F14] active:scale-95"
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                    type="button"
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10.733 5.076A10.744 10.744 0 0 1 12 5c5 0 8.5 4 10 7a13.893 13.893 0 0 1-3.356 4.568" />
                        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                        <path d="M17.479 17.499A10.75 10.75 0 0 1 12 19c-5 0-8.5-4-10-7a13.897 13.897 0 0 1 4.061-4.987" />
                        <path d="m2 2 20 20" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </span>
              </label>

              <div className="-mt-6 flex justify-end text-sm font-semibold text-[#8A8172]">
                <a
                  className="text-[#34A85B] transition-[color,transform,text-decoration-color] duration-150 ease-out hover:-translate-y-0.5 hover:text-[#E8A33D] hover:underline hover:decoration-[#E8A33D]/50 hover:underline-offset-4"
                  href="/login"
                >
                  Forgot password?
                </a>
              </div>

              <button
                disabled={isSubmitting}
                className="mt-[clamp(1.5rem,5vw,3rem)] flex min-h-12 h-[4.7rem] items-center justify-center gap-4 rounded-[10px] border border-[#d8efdd] bg-[#34A85B] px-8 text-center text-lg font-extrabold text-white shadow-[0_14px_28px_rgba(52,168,91,0.18)] transition-[transform,background-color,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#2f9852] hover:shadow-[0_18px_34px_rgba(52,168,91,0.24)] focus:outline-none focus:ring-2 focus:ring-[#241F14] focus:ring-offset-2 active:translate-y-0 active:scale-[0.98] max-sm:h-auto max-sm:py-4 max-sm:text-base"
                type="submit"
              >
                {isSubmitting ? <ButtonSpinner /> : null}
                <span>{isSubmitting ? "Signing in..." : "Sign In to Dashboard"}</span>
              </button>
              {error ? <p className="-mt-5 text-sm font-semibold text-red-600">{error}</p> : null}
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
