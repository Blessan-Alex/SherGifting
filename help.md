Got it. Looking at the full “Send Gift” flow (WHO → WHAT → PERSONALIZE → REVIEW + confirm modal) **as a senior frontend + UX and from a Web2 user POV**, you’re *very close* to a strong product. The structure is right (stepper + sticky preview), but the **information hierarchy is still Web3-first** (token amount, fees, selections) and the flow has a couple “friction spikes” that will cause drop-off.

I’ll rate each step, then tell you exactly what to change (copy + placement + psychology).

---

## Overall flow rating

* **As a Web3 user:** **7.5/10** (clear, guided, consistent, looks premium)
* **As a Web2 user:** **6/10** (still feels like “crypto form”, not “send a gift”)

Main reasons Web2 users hesitate:

1. **Crypto is primary everywhere** (SOL amount big; USD feels secondary)
2. **Too many decision points** (token choice, USD/token toggle, card fee)
3. **Fees feel “surprising”** even if disclosed (card + service fee + onramp)

---

## Step-by-step ratings + what to improve

### 1) WHO (Recipient)

**Rating:** 7/10
**What works**

* Clear title: “Who are you gifting?”
* Single input. Great.

**What hurts Web2**

* Placeholder “[recipient@example.com](mailto:recipient@example.com) or @username” is fine, but Web2 expects “email/phone/contact”, not username handle.
* Sticky preview shows “Gift amount 0.0000 SOL / $0.00” which looks broken at step 1.

**Fixes**

* Change helper copy to reduce crypto anxiety:

  * ✅ “We’ll send a secure claim link. **No wallet address needed.**”
  * Add: “They claim using email/phone via Privy.”
* Update preview for step 1:

  * Instead of showing **0.0000 SOL**, show a friendly placeholder:

    * “Gift amount: —”
    * “Pick an amount next”
* Input label tweak:

  * **Recipient (email or phone)**
  * Keep @username as a secondary hint: “or @username (optional)”

---

### 2) WHAT (Token + Amount)

**Rating:** Web3: 7/10 | Web2: 5/10
**What works**

* Suggested holiday amounts is a great pattern.
* Clear Continue CTA.
* Sticky preview reinforces choices.

**What hurts Web2**

* You still lead with **Choose a crypto**. Web2 wants **USD gift** first.
* The UI toggles between Token Amount / USD Amount — cognitive load.
* Token decimals are too prominent (0.1882 SOL reads like “finance math”).

**Fixes (high impact)**

1. **Make USD the primary input and the hero number everywhere**

   * Big input: **$25.00**
   * Under it: “≈ 0.1882 SOL” (small, muted, with ≈)
2. **Make crypto choice optional**

   * Default delivery asset: **USDC (Recommended)** or “Best option”
   * Hide token dropdown behind “Change” / “Advanced”
3. Keep “Suggested holiday amounts” but make them USD-first

   * Card title: **$10**
   * Subtitle: “Stocking stuffer”
   * Tiny line below: “≈ 0.0757 SOL”

**UI hierarchy rule for Web2:**

> USD big, crypto small, fees visible but not alarming.

---

### 3) PERSONALIZE (Card + message)

**Rating:** 7/10 (good layout, nice preview integration)

**What hurts conversion**

* The “Add a greeting card +$1.00” tag **feels like an upsell tax** at the moment of choice.
* Your modal is visually heavy and wide; it steals attention and feels like “more work”.

#### Your team’s point is valid:

> Showing “+$1.00” directly on the toggle discourages selection.

But you’re also right:

> You can’t hide the charge—users must learn it *before purchase*.

✅ Best compromise (psychologically + ethically):

### “Reveal cost when intent is shown”

Instead of showing **+$1.00** next to the checkbox, do:

**Collapsed state**

* Button-like row: **Add a greeting card**
* Microcopy underneath: “Includes festive design + delivered with gift link”
* A subtle tag: **Optional** (no price shown here)

**When user clicks “Add a greeting card”**

* Open the card picker modal
* In the modal header or footer show:

  * “Greeting cards are **$1** (applied at checkout)”
  * Or “Greeting cards **start at $1**”
* Show it as a calm line, not as a warning.

**Why this works**

* You’re not tricking anyone.
* You avoid front-loading the pain.
* The price appears at the moment the user is *already motivated* (they clicked to add a card).

Also: move “Skip Card” to a secondary text button; keep primary as “Use selected card”.

---

### 4) REVIEW step (the screen)

**Rating:** 5.5/10
This step currently feels **underbuilt**: it’s mostly a “Review Gift” button, then you push users into a modal.

For Web2 users, “Review” should be where they gain confidence:

* To: email
* Amount: **$25.00**
* “Recipient receives ≈ 0.1882 SOL”
* Greeting card included?
* Fees summarized clearly
* Final action: “Create Gift Link”

**Fix**

* Make the Review page itself a full summary (no “empty” state)
* Either:

  * remove the modal entirely, OR
  * keep modal only if you need a final confirmation, but make it very lightweight.

---

### 5) Confirm modal (Confirm Gift)

**Rating:** 6.5/10
**What works**

* Fee breakdown is explicit (good trust)
* Clear primary: “Create Gift Link”

**What hurts Web2**

* Too many numbers and crypto units. Use a Web2 “receipt” layout:

  * Big: **Total: $27.00**
  * Smaller: includes fees and what the recipient gets
* Service/greeting fees should not feel “gotcha”.

**Copy + layout improvements**

* Replace “Service fee $1.00 USD” with:

  * “Processing (incl. network + operations) $1”
* Add an info tooltip “What’s this?” with simple explanation.
* Show USD first everywhere. Crypto is secondary.

---

## Spacing / composition issues I see across screens

* The flow is centered in a **small column** with lots of dead space. It looks premium, but it can feel “empty / slow”.

  * Consider slightly increasing the form card width on desktop (or bring preview closer).
* Stepper labels are small; progress is hard to parse fast.

  * Add “Step 2 of 4” text.
* Continue button sometimes looks disabled even when it’s primary (color contrast).

  * Make primary CTA color *consistent* across all steps.

---

## Web2-first redesign rules (apply globally)

1. **USD is the primary currency** everywhere
2. **Crypto choice is optional** (Advanced)
3. **User sees what happens next** (“secure claim link”, “no wallet needed”)
4. **Fees are disclosed at the right moment** (not too early, not too late)
5. **Reduce decimals + jargon**

   * show “≈”, show 2 decimals USD, show fewer token decimals unless needed
6. **Preview should feel like a gift card receipt**, not a blockchain transaction

---

## Fee disclosure: “psychological but honest” phrasing options

For greeting card:

* “Greeting card: **$1** (applied at checkout)”
* “Premium greeting card: **$1**”
* “Festive card design: **$1**”
* “Includes card delivery: **$1**”

For service fee:

* “Processing fee (incl. network): $1”
* “Service + network: $1”
* Tooltip: “Covers transaction + delivery infrastructure”

Avoid:

* “+$1 upfront” beside the checkbox (creates loss aversion immediately)
* Hiding it until after “Create Gift Link” (feels deceptive)

---

## Biggest 3 wins (do these first)

1. **Make amount USD-first and default** (everywhere, including the sticky preview)
2. **Move crypto selection behind “Change asset”** (default to USDC recommended)
3. **Rebuild Review step into a real summary** (reduce modal dependency)

If you paste the TSX for your Step 2 (“What are you sending?”) component, I can rewrite it to a USD-first design while keeping your current state/handlers intact.
