Reviewing the current hero implementation to plan the UI/UX changes.


[4 tools called]


Reviewing the full landing page and related components:


[5 tools called]


Checking font loading, contrast, and card payment mentions:


[5 tools called]


## Implementation plan: Hero section UI/UX improvements

### Current state analysis

**Hero section location:** `pages/LoginPage.tsx` (lines 152-232)

**Current implementation:**
1. Subcopy (line 172): "Create a secure gift link. They claim it with email/phone via Privy. No wallet address needed."
2. Secondary CTA (line 198): "See recipient experience"
3. Trust cues (lines 204-219): Below CTAs but visually separated
4. Snow animation: Already respects `prefers-reduced-motion` via `useReducedMotion()` hook
5. Fonts: Montserrat loaded via Google Fonts (not preloaded)
6. Contrast: Uses `text-[#CBD5E1]` - needs verification
7. Card payment: Onramp system exists but not mentioned in hero

---

## Implementation plan

### 1) Hero subcopy → 1-line ladder

**File:** `pages/LoginPage.tsx`  
**Line:** 172

**Current:**
```tsx
<p className="text-body-lg text-[#CBD5E1] text-max-width mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
  Create a secure gift link. They claim it with email/phone via Privy. No wallet address needed.
</p>
```

**Change to:**
```tsx
<p className="text-body-lg text-[#CBD5E1] text-max-width mx-auto lg:mx-0 leading-relaxed animate-fade-in-up delay-200">
  Pick an amount → choose a card → send a link. They claim by email/phone. No wallet needed.
</p>
```

**Rationale:** Clear 3-step ladder, removes "Privy" jargon, keeps "No wallet needed" as reassurance.

---

### 2) Add "Pay by card" microcopy

**File:** `pages/LoginPage.tsx`  
**Location:** After subcopy, before CTAs (around line 174)

**Add:**
```tsx
{/* Payment clarity */}
<p className="text-sm text-[#94A3B8] text-center lg:text-left animate-fade-in-up delay-250">
  Pay by card (no crypto needed)
</p>
```

**Alternative (if Apple Pay/Google Pay supported):**
```tsx
<p className="text-sm text-[#94A3B8] text-center lg:text-left animate-fade-in-up delay-250">
  Pay by card • Apple Pay/Google Pay
</p>
```

**Note:** Check if onramp supports Apple Pay/Google Pay. If not, use the simpler version.

---

### 3) Move trust cues directly under primary CTA

**File:** `pages/LoginPage.tsx`  
**Current location:** Lines 204-219 (separate section)  
**New location:** Immediately after CTA buttons (around line 201)

**Current structure:**
```tsx
{/* CTAs */}
<div className="flex flex-col sm:flex-row gap-4 ...">
  <GlowButton>Send a Gift</GlowButton>
  <GlowButton>See recipient experience</GlowButton>
</div>

{/* Micro trust row - currently here but separated */}
<div className="flex flex-wrap items-center ...">
  ...
</div>
```

**New structure:**
```tsx
{/* CTAs */}
<div className="space-y-4 animate-fade-in-up delay-300">
  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
    <GlowButton onClick={handleLogin} variant="primary" icon={ArrowRight} fullWidth className="sm:w-auto">
      Send a Gift
    </GlowButton>
    <GlowButton 
      onClick={() => scrollToSection('preview')} 
      variant="secondary" 
      fullWidth 
      className="sm:w-auto"
    >
      Preview how they claim
    </GlowButton>
  </div>
  
  {/* Trust cues - moved directly under CTA */}
  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-[#94A3B8]">
    <div className="flex items-center gap-1.5">
      <Shield size={12} />
      <span>No wallet needed</span>
    </div>
    <span className="hidden sm:inline">•</span>
    <div className="flex items-center gap-1.5">
      <Link2 size={12} />
      <span>Link-based claiming</span>
    </div>
    <span className="hidden sm:inline">•</span>
    <div className="flex items-center gap-1.5">
      <Shield size={12} />
      <span>Powered by Privy</span>
    </div>
  </div>
</div>
```

**Changes:**
- Wrap CTAs and trust cues in same container
- Reorder trust cues: "No wallet needed" first, "Powered by Privy" last
- Remove "Built by Sher" (keep in footer)
- Adjust spacing to group visually

---

### 4) Rename secondary CTA

**File:** `pages/LoginPage.tsx`  
**Line:** 198

**Current:**
```tsx
See recipient experience
```

**Change to:**
```tsx
Preview how they claim
```

**Verification:** Ensure `scrollToSection('preview')` routes to the RecipientExperience section (it does, line 247).

---

### 5) Snow animation respects `prefers-reduced-motion`

**Status:** Already implemented

**Files:**
- `components/decorative/SnowParticles.tsx` (line 70): Uses `useReducedMotion()`
- `components/HolidayBackground.tsx` (line 67): Uses `useReducedMotion()`
- `lib/animations.ts`: Has `useReducedMotion()` wrapper

**Verification needed:**
- Ensure CSS `@media (prefers-reduced-motion: reduce)` in `index.css` (lines 89-98) is working
- Test that snow particles reduce to 5 when motion is reduced (line 74 in SnowParticles.tsx)

**Enhancement (optional):**
If snow still renders with reduced motion, add early return:
```tsx
if (shouldReduceMotion) {
  return null; // Don't render canvas at all
}
```

---

### 6) Optimize LCP (fonts, defer animations)

**A. Font preloading**

**File:** `index.html`  
**Current (line 7):**
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

**Change to:**
```html
<!-- Preload critical font weights -->
<link rel="preload" href="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXpsog.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="https://fonts.gstatic.com/s/montserrat/v26/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr6Hw5aXpsog.woff2" as="font" type="font/woff2" crossorigin />

<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

**Better approach (if using Vite):**
Add to `vite.config.ts`:
```ts
export default defineConfig({
  // ... existing config
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-fonts': []
        }
      }
    }
  }
})
```

**B. Defer non-critical animations**

**File:** `pages/LoginPage.tsx`  
**Current:** `HolidayBackground` loads immediately (line 101)

**Change to lazy load with delay:**
```tsx
// At top of component
const [showBackground, setShowBackground] = useState(false);

useEffect(() => {
  // Defer background until after first paint
  const timer = setTimeout(() => {
    setShowBackground(true);
  }, 100);
  return () => clearTimeout(timer);
}, []);

// In JSX
{showBackground && <HolidayBackground />}
```

**C. Hero background optimization**

**File:** `components/HolidayBackground.tsx`  
**Current:** Snow particles render immediately

**Enhancement:** Add `requestIdleCallback` wrapper:
```tsx
useEffect(() => {
  if (shouldShowSnow) {
    const loadSnow = () => {
      // Mount snow component
    };
    
    if (typeof window !== 'undefined' && (window as any).requestIdleCallback) {
      (window as any).requestIdleCallback(loadSnow, { timeout: 2000 });
    } else {
      setTimeout(loadSnow, 100);
    }
  }
}, [shouldShowSnow]);
```

---

### 7) Contrast check for body text (WCAG)

**File:** `pages/LoginPage.tsx`  
**Current:** `text-[#CBD5E1]` on `bg-[#0B1120]`

**Contrast calculation:**
- `#CBD5E1` (text) vs `#0B1120` (background)
- Need to verify: WCAG AA requires 4.5:1 for normal text

**Fix if needed:**
```tsx
// Change from:
className="text-body-lg text-[#CBD5E1] ..."

// To (brighter):
className="text-body-lg text-[#E2E8F0] ..." // or text-white/90
```

**Also check:**
- Trust cues: `text-[#94A3B8]` - may need `text-[#CBD5E1]`
- Payment microcopy: `text-[#94A3B8]` - may need `text-[#CBD5E1]`

**Tool to verify:** Use browser DevTools or online contrast checker.

---

## Complete code changes summary

### File 1: `pages/LoginPage.tsx`

**Changes:**
1. Line 172: Update subcopy
2. Line 174: Add payment microcopy
3. Lines 188-219: Restructure CTAs + trust cues
4. Line 198: Rename secondary CTA

### File 2: `index.html`

**Changes:**
1. Line 7: Add font preloading

### File 3: `index.css` (optional)

**Changes:**
1. Verify contrast ratios
2. Ensure reduced motion CSS is comprehensive

### File 4: `components/decorative/SnowParticles.tsx` (optional enhancement)

**Changes:**
1. Add early return if `shouldReduceMotion` is true

---

## Acceptance criteria checklist

- [ ] Subcopy reads as 3-step ladder (pick → choose → send)
- [ ] Subcopy contains "No wallet needed"
- [ ] "Pay by card" microcopy visible above fold
- [ ] Trust cues directly under primary CTA (same visual group)
- [ ] Secondary CTA says "Preview how they claim"
- [ ] Snow animation disabled/static with reduced motion ON
- [ ] Fonts preloaded (check Network tab)
- [ ] LCP improved (Lighthouse mobile)
- [ ] Hero paragraph passes WCAG AA contrast (4.5:1)

---

## Testing recommendations

1. Lighthouse (mobile):
   - LCP < 2.5s
   - No render-blocking resources
2. Accessibility:
   - Contrast checker: all text ≥ 4.5:1
   - Reduced motion: animations disabled
3. Visual:
   - Trust cues grouped with CTA
   - Payment clarity visible
   - Mobile responsive (2-3 lines for subcopy)

---

## Notes

1. Card payment: The onramp system exists. Verify if Apple Pay/Google Pay are supported before adding to microcopy.
2. Font preloading: Use actual font URLs from Google Fonts. The example URLs are placeholders.
3. Performance: Test on slow 3G to verify LCP improvements.
4. Reduced motion: Already implemented; verify it works across browsers.

Should I provide the exact code snippets for each change, or do you want to implement them step by step?