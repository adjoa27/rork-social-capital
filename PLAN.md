# Fix broken imports & uncatched haptics

## Fix leftovers from the Lifetime product removal

### Paywall screen — remove all Lifetime plan references
The Lifetime product was removed from the provider, but the paywall still imports and references it in 7 places. This causes the app to fail loading entirely with a bundle error.

**Changes:**
- Remove `PACKAGE_LIFETIME` from the import statement
- Remove the `PlanId` type (only 2 plans left: Yearly & Monthly)
- Remove the Lifetime entry from the `PLANS` array
- Remove `lifetimePackage` from the context destructuring
- Remove the lifetime entry from `packageMap` and its dependency array
- Simplify `hasOfferings` to only check Yearly and Monthly
- Simplify the CTA period text (only /month and /year needed now)

### Terms & Privacy screens — add `.catch()` to haptics
Both screens call `Haptics.impactAsync()` without `.catch()` on their back button presses. On web (where haptics don't work), this throws an unhandled promise error in the console.

**Changes:**
- `terms.tsx`: Add `.catch(() => {})` to the haptics call on the back button
- `privacy.tsx`: Add `.catch(() => {})` to the haptics call on the back button