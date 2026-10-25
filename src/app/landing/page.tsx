import type { Metadata } from "next";
import { LandingPage } from "@/components/auth/landing-page";

export const metadata: Metadata = {
  title: "LibrisAI — Academic Digital Library & Neural Repository",
  description:
    "Explore 2.4M+ peer-reviewed articles, doctoral dissertations, and preprint archives with verified citation lineages and Gemini AI literature synthesis.",
};

export default function Page() {
  return <LandingPage />;
}
