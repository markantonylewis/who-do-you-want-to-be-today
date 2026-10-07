# Restore character-defining accessories

Restore the six approved accessories in the existing flat outlined artwork:
- Owl and teacher: round glasses with completely transparent lenses; retain the teacher's graduation cap.
- Pirate: one eye patch and its strap.
- Superhero: eye mask with open eye holes; retain the hood and star.
- Clown: restore the large red nose.
- Elephant: restore the trunk hanging down from the nose.

Leave all other costumes unchanged, especially the raised fireman helmet and wider knight face opening. These six accessories are approved exceptions to the normal clear-face rule.

## Verification
Check all six on `/costume-preview` and in the running game, including small-screen fit. Confirm transparent lenses and mask holes reveal the eyes, and no unrelated artwork changes appear. Camera alignment on a real phone remains a device check.

## Technical details
Keep the artwork in `premiumCostumeDrawers.ts`, using the existing shared drawing helpers. Add a shared unfilled glasses-frame helper and use an even-odd mask fill for genuine eye holes. Update the review-page note to reflect the approved exceptions; leave game flow, rewards, permissions and voice unchanged.