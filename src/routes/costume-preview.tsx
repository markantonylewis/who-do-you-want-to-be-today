import { createFileRoute } from "@tanstack/react-router";
import { CHARACTERS } from "@/app/data/characters";
import { FREE_CHARACTER_IDS } from "@/app/data/premiumCharacters";
import { CostumeThumb } from "@/app/components/CostumeThumb";

// Hidden grown-up page for checking all 32 costumes at once. Not linked from the game.
export const Route = createFileRoute("/costume-preview")({
  head: () => ({
    meta: [
      { title: "Costume preview – Who Am I Today?" },
      { name: "description", content: "Grown-up check of every costume on the cartoon face." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Costume preview – Who Am I Today?" },
      { property: "og:description", content: "Grown-up check of every costume on the cartoon face." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CostumePreview,
});

function CostumePreview() {
  const free = new Set<string>(FREE_CHARACTER_IDS as readonly string[]);
  return (
    <main className="min-h-screen bg-amber-50 p-6">
      <h1 className="text-2xl font-black text-amber-950">All costumes ({CHARACTERS.length})</h1>
      <p className="mb-6 text-sm font-semibold text-amber-800">
        Grown-up check page. Glasses and superhero eye holes are see-through; the pirate patch, clown nose and elephant trunk are approved face accessories.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {CHARACTERS.map((c) => (
          <figure key={c.id} className="flex flex-col items-center rounded-2xl border-2 border-b-4 border-amber-300 bg-white p-2">
            <CostumeThumb id={c.id} size={180} />
            <figcaption className="text-sm font-black text-amber-950">
              {c.name} <span className="font-semibold text-amber-700">{free.has(c.id) ? "free" : "premium"}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
