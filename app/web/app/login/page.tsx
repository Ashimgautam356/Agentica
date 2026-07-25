import type { Metadata } from "next";
import LoginForm from "./LoginForm";
import s from "./login.module.css";

export const metadata: Metadata = {
  title: "Sign in · Agentica",
  description:
    "Sign in to Agentica to chat with your AI shopping assistant and manage your orders.",
};

export default function LoginPage() {
  return (
    <main className={s.page}>
      <LoginForm />
    </main>
  );
}
