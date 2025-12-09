Exploring the codebase to map the plan to the code structure.


[3 tools called]


Reviewing the landing page and section components to understand the current structure:


[10 tools called]


Checking for other sections or references:


[3 tools called]


Phase-by-phase implementation plan:

## Phase-by-phase implementation plan

### Phase 0: Pre-implementation analysis

Current structure (from `LoginPage.tsx`):
```
1. Hero Section (lines 164-258) - ✅ UNTOUCHED
2. TheProblem (line 267)
3. HowItWorks (line 270) 
4. RecipientExperience (line 273)
5. Comparison (line 276) - ❌ TO REMOVE
6. RiskReversal (line 279)
7. TrustSecurity (line 282)
8. FAQ (line 285)
9. FinalCTA (line 288)
```

Target structure:
```
1. Hero Section - ✅ UNTOUCHED
2. TheProblem (shortened to 3 bullets)
3. HowItWorks (renamed + gift language)
4. RecipientExperience (moved up - already in correct position)
5. RiskReversal (48-hour guarantee - single source)
6. TrustSecurity (merged + simplified)
7. FAQ (add "after redeem" question)
8. FinalCTA (copy adjustment)
```

---

## Phase 1: Remove "Why Smart People Gift Assets" section

### Android dev perspective
- Component: `components/sections/Comparison.tsx`
- Remove import and usage from `LoginPage.tsx`
- Check for dependencies (none found)
- Clean up unused assets if any

### UI/UX perspective
- Removes investment-focused messaging
- Reduces cognitive load
- Eliminates tab complexity

### Implementation steps
1. File: `pages/LoginPage.tsx`
   - Remove: `import Comparison from '../components/sections/Comparison';` (line 16)
   - Remove: `<Comparison />` (line 276)

2. File: `components/sections/Comparison.tsx`
   - Option A: Delete file (recommended)
   - Option B: Keep for future reference (not recommended)

3. Verify:
   - No broken imports
   - Navigation still works
   - No console errors

---

## Phase 2: Shorten "The Old Way is Broken" section

### Android dev perspective
- Component: `components/sections/TheProblem.tsx`
- Reduce `problems` array from 2 to max 3 items
- Keep structure, reduce content
- Maintain animations/transitions

### UI/UX perspective
- Quick scan (< 5 seconds)
- Clear problem statement
- Less visual clutter

### Implementation steps
1. File: `components/sections/TheProblem.tsx`
   - Current: 2 problems in array (lines 7-16)
   - Action: Keep 2, or add 1 more if needed (max 3)
   - Remove/reduce paragraph text (lines 33-35) if too verbose
   - Keep visual metaphor (right column)

2. Acceptance criteria:
   - Section renders in < 5 seconds visually
   - Max 3 problem cards
   - No redundant paragraphs

---

## Phase 3: Rename "Send Wealth Like An Email" → "Send a gift like an email"

### Android dev perspective
- Component: `components/sections/HowItWorks.tsx`
- Update title (line 69)
- Replace "wealth/assets" with "gift" language
- Keep 3-step structure intact

### UI/UX perspective
- More accessible language
- Removes crypto/wealth jargon
- Maintains clarity

### Implementation steps
1. File: `components/sections/HowItWorks.tsx`
   - Line 69: Change `"Send Wealth Like An Email"` → `"Send a gift like an email"`
   - Line 71: Update subtext if it mentions "wealth/asset"
   - Review step descriptions (lines 12-27):
     - Line 16: "Enter Email" - OK
     - Line 17: "$100 in Bitcoin, USDC, or SOL" - Consider simplifying
     - Line 20: "We Magic Link It" - OK
     - Line 26: "They Own It" - Consider "They Receive It"
     - Line 27: "hold for growth, save, or cash out" - Consider "hold, save, or cash out"

2. Copy suggestions:
   ```tsx
   // Title
   <h2 className="text-h2 font-bold text-white mb-4">Send a gift like an email</h2>
   
   // Subtext
   <p className="text-body-lg text-[#94A3B8] max-w-2xl mx-auto">
     No tech skills required. If you can send an email, you can send a gift.
   </p>
   
   // Step 3 description
   description: 'One click and the gift is theirs. They can hold, save, or cash out instantly.',
   ```

---

## Phase 4: Move "What recipients see" section (already correct)

### Android dev perspective
- Component: `components/sections/RecipientExperience.tsx`
- Current position: After HowItWorks (line 273)
- Target position: After HowItWorks
- Status: Already in correct position

### UI/UX perspective
- Answers "Will my friend understand?"
- Early placement builds confidence

### Implementation steps
1. Verify current order in `LoginPage.tsx`:
   - HowItWorks (line 270)
   - RecipientExperience (line 273) ✅ Already correct

2. No changes needed

---

## Phase 5: Ensure single guarantee section

### Android dev perspective
- Component: `components/sections/RiskReversal.tsx`
- Verify guarantee is only mentioned here
- Check TrustSecurity and FAQ for duplicates

### UI/UX perspective
- Single source of truth
- Clear, non-redundant messaging

### Implementation steps
1. File: `components/sections/RiskReversal.tsx`
   - Keep as-is (48-hour guarantee)

2. File: `components/sections/TrustSecurity.tsx`
   - Line 32: Remove "48-hour refund guarantee if gift is not claimed" from disclaimers array
   - This duplicates RiskReversal

3. File: `components/sections/FAQ.tsx`
   - Line 26-28: "What happens if they don't claim it?" - Keep but make it brief, reference the guarantee section

4. Verify:
   - Guarantee explained once in RiskReversal
   - FAQ references it briefly
   - TrustSecurity doesn't repeat it

---

## Phase 6: Merge Trust & Security into one block

### Android dev perspective
- Component: `components/sections/TrustSecurity.tsx`
- Merge "Important Information" box into main section
- Remove "Blockchain Verified" as primary card (or demote)
- Keep only: "Powered by Privy" + "Secure Magic Links"

### UI/UX perspective
- Single trust section
- Less overwhelming
- Focus on Privy + Magic Links

### Implementation steps
1. File: `components/sections/TrustSecurity.tsx`
   - Lines 10-26: Update `features` array:
     ```tsx
     const features = [
       {
         icon: Shield,
         title: 'Powered by Privy',
         description: 'Bank-grade security with industry-leading authentication. Your gifts are protected by the same technology trusted by Fortune 500 companies.',
       },
       {
         icon: Lock,
         title: 'Secure Magic Links',
         description: 'Each gift link is encrypted and can only be claimed by the intended recipient. No wallet addresses needed—just email or phone.',
       },
       // REMOVE "Blockchain Verified" card
     ];
     ```
   - Lines 28-33: Update `disclaimers` array:
     - Remove "48-hour refund guarantee" (moved to RiskReversal)
     - Keep: "Gifts are secured by encrypted links..."
     - Keep: "All transactions are processed on Solana..."
     - Keep: "We never store your private keys..."
   - Lines 137-152: Remove "Important Information" standalone box
   - Optionally: Move disclaimers into a subtle footer or merge into feature cards

2. Alternative approach (if keeping disclaimers visible):
   - Keep disclaimers but make them smaller/subtle
   - Remove the "Important Information" heading
   - Integrate into the section footer

---

## Phase 7: Remove "Important Information" standalone section

### Android dev perspective
- Component: `components/sections/TrustSecurity.tsx`
- Remove lines 131-153 (the GlassCard with "Important Information")
- Migrate unique content to appropriate sections

### UI/UX perspective
- Reduces redundancy
- Cleaner trust section

### Implementation steps
1. File: `components/sections/TrustSecurity.tsx`
   - Delete lines 131-153 (the entire "Important Information" GlassCard block)
   - If disclaimers are needed, integrate them subtly into the section footer or remove entirely

2. Content migration check:
   - "Gifts are secured by encrypted links" → Already in "Secure Magic Links" card
   - "All transactions are processed on Solana" → Can move to FAQ or remove
   - "We never store your private keys" → Can move to FAQ "Is it safe?"
   - "48-hour refund guarantee" → Already in RiskReversal

---

## Phase 8: Update FAQ with "after redeem" question

### Android dev perspective
- Component: `components/sections/FAQ.tsx`
- Add new FAQ item to `faqs` array
- Maintain accordion functionality

### UI/UX perspective
- Answers "What can they do after redeem?"
- Critical for web2 users

### Implementation steps
1. File: `components/sections/FAQ.tsx`
   - Lines 12-33: Add new FAQ item:
     ```tsx
     {
       question: "What can they do after they redeem?",
       answer: "They can hold the crypto, cash it out instantly, or transfer it to their own wallet. Full control, no restrictions.",
     },
     ```
   - Place after "Is it safe?" (around line 20)
   - Line 19: Simplify "Is it safe?" answer - remove "bank-grade encryption" if not precise:
     ```tsx
     answer: "Yes. The link we send is a secure \"Magic Link\" powered by Privy. Only the person with access to that email address can claim the funds.",
     ```
   - Line 27: Ensure "What happens if they don't claim it?" doesn't repeat guarantee verbatim - keep brief

---

## Phase 9: Final CTA copy alignment

### Android dev perspective
- Component: `components/sections/FinalCTA.tsx`
- Update copy on line 201
- Ensure no contradictory messaging

### UI/UX perspective
- Clear, unambiguous CTA
- No confusion about credit card requirements

### Implementation steps
1. File: `components/sections/FinalCTA.tsx`
   - Line 201: Change `"No credit card required for setup."` to:
     - Option A: `"Free to try"`
     - Option B: `"Start in under a minute"`
     - Option C: `"No setup friction"`
   - Verify line 189: "It's free to try" is consistent

2. Verify consistency:
   - Hero section: Check if it mentions credit card (should be untouched)
   - FinalCTA: Should align with actual flow

---

## Phase 10: Animation policy below hero

### Android dev perspective
- Review all section components for heavy animations
- Remove/reduce Lottie animations below fold
- Prefer CSS-only effects

### UI/UX perspective
- Faster load times
- Smoother scrolling
- Hero remains the focus

### Implementation steps
1. Review each section component:
   - `TheProblem.tsx`: Check for heavy animations (lines 74-96 have subtle motion - OK)
   - `HowItWorks.tsx`: Check sparkle particles (lines 52-169) - Consider reducing
   - `RecipientExperience.tsx`: Phone mockup animations are essential - Keep
   - `RiskReversal.tsx`: Static gradient (line 10) - OK
   - `TrustSecurity.tsx`: Minimal animations - OK
   - `FAQ.tsx`: Accordion animations are essential - Keep
   - `FinalCTA.tsx`: Sparkle particles (lines 72-154) - Consider reducing or removing

2. Specific changes:
   - `HowItWorks.tsx`: Reduce sparkle particle count or remove hover sparkles
   - `FinalCTA.tsx`: Reduce sparkle particles or make them static
   - Ensure no Lottie animations are imported below hero (HeroLottieAnimations should only be in hero)

3. Performance check:
   - Run Lighthouse audit
   - Check bundle size
   - Verify scroll performance

---

## Phase 11: Final validation & testing

### Android dev perspective
- Component tree validation
- Import cleanup
- No dead code
- TypeScript compilation

### UI/UX perspective
- User flow validation
- Copy consistency
- Visual hierarchy
- Mobile responsiveness

### Implementation steps
1. Code validation:
   ```bash
   # Check for unused imports
   # Verify TypeScript compilation
   # Run linter
   ```

2. Visual validation:
   - [ ] Hero unchanged
   - [ ] TheProblem shortened (max 3 bullets)
   - [ ] HowItWorks renamed to "Send a gift like an email"
   - [ ] RecipientExperience in correct position
   - [ ] RiskReversal is single guarantee source
   - [ ] TrustSecurity merged (no "Important Information" box)
   - [ ] FAQ includes "after redeem" question
   - [ ] FinalCTA copy aligned
   - [ ] No heavy animations below hero

3. Content validation:
   - [ ] No "wealth/asset" language in HowItWorks
   - [ ] No duplicate guarantee text
   - [ ] "Blockchain Verified" removed or demoted
   - [ ] Trust section focuses on Privy + Magic Links

---

## Summary checklist

| Phase | Component | Action | Status |
|-------|-----------|--------|--------|
| 1 | `LoginPage.tsx` | Remove Comparison import & usage | ⏳ Pending |
| 2 | `TheProblem.tsx` | Shorten to max 3 bullets | ⏳ Pending |
| 3 | `HowItWorks.tsx` | Rename + gift language | ⏳ Pending |
| 4 | `RecipientExperience.tsx` | Verify position (already correct) | ✅ Done |
| 5 | `RiskReversal.tsx` | Ensure single source | ⏳ Pending |
| 5 | `TrustSecurity.tsx` | Remove guarantee duplicate | ⏳ Pending |
| 6 | `TrustSecurity.tsx` | Merge + remove "Blockchain Verified" | ⏳ Pending |
| 7 | `TrustSecurity.tsx` | Remove "Important Information" box | ⏳ Pending |
| 8 | `FAQ.tsx` | Add "after redeem" question | ⏳ Pending |
| 9 | `FinalCTA.tsx` | Update copy | ⏳ Pending |
| 10 | All sections | Reduce animations below hero | ⏳ Pending |

---

## Recommended execution order

1. Phase 1 (Remove Comparison) - Clean slate
2. Phase 2 (Shorten TheProblem) - Quick win
3. Phase 3 (Rename HowItWorks) - Content update
4. Phase 5-7 (Trust consolidation) - Do together
5. Phase 8 (FAQ update) - Content addition
6. Phase 9 (FinalCTA) - Copy fix
7. Phase 10 (Animations) - Performance optimization
8. Phase 11 (Validation) - Final check

This plan maps each requirement to specific files and line numbers. Should I proceed with implementing any specific phase?