Creating a phased plan for the frontend redesign. Reviewing the current structure to understand the codebase:


[5 tools called]


Phased plan for the frontend redesign:

## Phased Frontend Redesign Plan - CryptoGifting Holiday Theme

### **Phase 1: Foundation & Design System** (Week 1)
**Goal:** Set up design tokens, theme system, and base components

**Tasks:**
1. **Design tokens & CSS variables**
   - Extend `index.css` with holiday theme variables
   - Add: `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--brand`, `--holiday-red`, `--frost`, `--glow`, `--success`, `--warning`
   - Update Tailwind config with holiday color palette
   - Add theme toggle system (Christmas/New Year/Classic)

2. **Typography improvements**
   - Verify Montserrat font loading
   - Add typography scale utilities
   - Improve text hierarchy and spacing

3. **Base component refactors**
   - Refactor `GlowButton` with holiday variants
   - Create `FrostedCard` wrapper component
   - Update `GlassCard` with holiday styling
   - Create `PrimaryButton`, `SecondaryButton`, `GhostButton` variants

**Deliverables:**
- Updated `index.css` with design tokens
- Updated `tailwind.config.js` with holiday colors
- Refactored base button components
- Theme toggle hook/context

---

### **Phase 2: Holiday Background & Ambient Effects** (Week 1-2)
**Goal:** Create animated background components

**Tasks:**
1. **Enhanced HolidayBackground component**
   - Add snowfall animation (particles)
   - Add twinkling lights (bokeh effect)
   - Add parallax scrolling
   - Respect `prefers-reduced-motion`

2. **Cursor effects**
   - Enhance `CursorGlow` component
   - Add spotlight glow effect (landing page only)
   - Subtle radial gradient follow

3. **Ambient animations**
   - Add subtle shimmer effects
   - Add gentle pulse animations
   - Add floating particles

**Deliverables:**
- Enhanced `HolidayBackground.tsx`
- Updated `CursorGlow.tsx`
- New animation utilities

---

### **Phase 3: Landing Page Hero Section** (Week 2)
**Goal:** Redesign hero with interactive elements

**Tasks:**
1. **Hero layout (2-column)**
   - Left: Headline, subheadline, CTAs
   - Right: Interactive Gift Preview Card
   - Responsive mobile layout

2. **Gift Preview Card enhancements**
   - Tilt on hover (3D transform)
   - Ribbon animation
   - Sparkle shine effect
   - "Unwrap" animation on CTA click

3. **Hero copy updates**
   - New headline: "Send crypto gifts in 60 seconds — wrapped for the holidays."
   - Updated subheadline
   - CTA button micro-interactions

4. **CTA micro-interactions**
   - Hover: ribbon wiggle
   - Click: confetti burst (tasteful)
   - Press: button depress effect

**Deliverables:**
- Redesigned hero section in `LoginPage.tsx`
- Enhanced `HeroGiftCard.tsx`
- Updated copy strings

---

### **Phase 4: Landing Page Sections** (Week 2-3)
**Goal:** Redesign all landing page sections

**Tasks:**
1. **How It Works section**
   - 3-step layout with animated icons
   - Stagger-in animations
   - Updated copy

2. **Recipient Experience section**
   - Phone mockup component
   - "Unwrap" animation demo
   - Interactive preview

3. **Why CryptoGifting section**
   - Benefits grid layout
   - Icon animations
   - Scroll reveal animations

4. **Trust & Security section**
   - Privy branding
   - Security badges
   - Disclaimers

5. **Holiday Themes preview**
   - Card theme strip
   - Christmas/New Year previews
   - Interactive hover states

6. **FAQ section**
   - Accordion animations
   - Smooth expand/collapse

7. **Final CTA band**
   - Glow effect
   - Festive border
   - Animated background

8. **Navigation & Footer**
   - "CryptoGifting by Sher" brand lockup
   - Holiday-themed styling

**Deliverables:**
- Updated all section components
- New `PhoneMockup.tsx` component
- Updated `Footer.tsx`

---

### **Phase 5: Send Gift Flow Redesign** (Week 3-4)
**Goal:** Convert gift page into guided, joyful flow

**Tasks:**
1. **Stepper component enhancements**
   - Visual step indicator
   - Progress tracking
   - Smooth transitions

2. **Step 1: Recipient**
   - Improved input design
   - Better error states
   - Username/email resolution UI

3. **Step 2: Amount & Token**
   - Quick amount chips ($10, $25, $50, $100, Custom)
   - "Suggested holiday amounts" section
   - Enhanced token picker
   - USD/Token toggle improvements

4. **Step 3: Card & Note**
   - Greeting card picker modal redesign
   - Grid layout with previews
   - Message input improvements

5. **Step 4: Review & Send**
   - Clean summary layout
   - Animated confirmation
   - Success state with confetti

6. **Sticky Gift Preview**
   - Desktop: right sidebar
   - Mobile: collapsible bottom sheet
   - Real-time updates

7. **Balance Resolution Panel**
   - Inline design
   - "You need $X more" message
   - "Add Funds" CTA

**Deliverables:**
- Redesigned `GiftPage.tsx` layout
- Enhanced `Stepper.tsx`
- Updated `QuickAmountChips.tsx`
- Enhanced `GreetingCardModal.tsx`
- New `StickyGiftPreview.tsx` component
- Updated `BalanceResolutionPanel.tsx`

---

### **Phase 6: Dashboard & Other Authenticated Pages** (Week 4)
**Goal:** Redesign dashboard and other pages

**Tasks:**
1. **Dashboard (HomePage)**
   - Holiday-themed balance card
   - Enhanced quick actions
   - Improved asset table
   - Micro-interactions

2. **History Page**
   - Holiday-themed gift cards
   - Improved filtering/sorting UI
   - Better empty states

3. **Add Funds Page**
   - Holiday styling
   - Improved flow

4. **Withdraw Page**
   - Holiday styling
   - Improved UX

**Deliverables:**
- Updated `HomePage.tsx`
- Updated `HistoryPage.tsx`
- Updated `AddFundsPage.tsx`
- Updated `WithdrawPage.tsx`

---

### **Phase 7: Component Library & Micro-interactions** (Week 4-5)
**Goal:** Add micro-interactions across all components

**Tasks:**
1. **Button micro-interactions**
   - Hover glow
   - Press depress
   - Shine sweep

2. **Input micro-interactions**
   - Focus ring with frosty glow
   - Helper text transitions
   - Error state animations

3. **Card micro-interactions**
   - Hover lift
   - Shadow enhancement
   - Border brighten

4. **Table micro-interactions**
   - Row hover highlighting
   - Soft shimmer effect

5. **Toast enhancements**
   - Success sparkle icon animation
   - Improved positioning
   - Auto-dismiss animations

6. **Loading states**
   - Skeleton shimmer with frosty gradient
   - Improved spinner designs

7. **Modal enhancements**
   - Smooth open/close animations
   - Backdrop blur improvements

8. **Scroll reveals**
   - Sections animate in with stagger
   - Intersection Observer setup

**Deliverables:**
- Enhanced all UI components
- New animation utilities
- Updated `ToastContainer.tsx`
- Updated `SkeletonLoader.tsx`

---

### **Phase 8: Holiday Motifs Integration** (Week 5)
**Goal:** Add festive visual elements tastefully

**Tasks:**
1. **Snow particles**
   - Light, slow animation
   - Performance optimized

2. **Twinkling lights**
   - Subtle bokeh effect
   - Configurable intensity

3. **Gift ribbon borders**
   - Key cards only
   - Subtle implementation

4. **Candy-cane stripe accents**
   - Tiny accents only
   - Not overwhelming

5. **Ornament/holly decorations**
   - Very subtle corner decorations
   - Optional toggle

6. **New Year elements**
   - Sparkles
   - Starbursts
   - Midnight glow gradients

**Deliverables:**
- New `SnowParticles.tsx` component
- New `TwinklingLights.tsx` component
- Decorative utility components
- Theme configuration system

