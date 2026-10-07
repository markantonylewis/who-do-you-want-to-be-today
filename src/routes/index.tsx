import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const App = lazy(() => import("@/app/App"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Who Am I Today? — Toddler Dress-Up Adventure" },
      { name: "description", content: "A costume game where your toddler practises saying words out loud. Helps diction and vocabulary. Free to play with no ads, and nothing your child says is ever recorded." },
      { property: "og:title", content: "Who Am I Today? — Toddler Dress-Up Adventure" },
      { property: "og:description", content: "A costume game where your toddler practises saying words out loud. Helps diction and vocabulary. Free to play with no ads." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" },
    ],
  }),
  component: Index,
});

function Loading() {
  return <div className="flex h-screen items-center justify-center text-2xl font-bold">Getting dressed up…</div>;
}

function Index() {
  return (
    <ClientOnly fallback={<Loading />}>
      <Suspense fallback={<Loading />}>
        <App />
      </Suspense>
    </ClientOnly>
  );
}
