<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep premium face-avatar artwork in `premiumCostumeDrawers.ts` and call it from the main costume dispatcher, so the 23 bespoke masks remain maintainable.
- Draw glasses as unfilled shared canvas frames and mask openings with even-odd fill, so camera and cartoon eyes show through the same accessory artwork.
- Camera/mic permissions are requested only in `ParentSetup` or Parent Settings (via `utils/permissions.ts`); child screens never prompt or show errors, because the child must never hit a dead end.
- Word attempts are logged through `logAttempt` in `App.tsx` into `progressStore` (results only, never audio), so the parent report has one source of truth.
- Every narrator line, listener and timer in the game loop belongs to a round id (`roundRef` in `App.tsx`); switching costume, opening the tray or restarting bumps it via `cancelRound()`, so stale callbacks from an abandoned costume can never fire.
- Word/costume listeners start with the narrator's prompt (barge-in) and `utils/echoGuard.ts` filters the narrator's own words using word timings cached with each phrase; the no-answer timeout only starts when the prompt ends.
