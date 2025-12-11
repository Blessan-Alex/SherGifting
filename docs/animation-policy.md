
# Animation Performance Policy

This document outlines animation guidelines and performance best practices for the SherGifting app.

## Core Principles

1. **Performance First**: Animations should enhance UX without degrading performance
2. **Progressive Enhancement**: Animations should gracefully degrade on mobile and reduced motion
3. **Code Splitting**: Heavy animation libraries should be dynamically imported
4. **CSS Over JS**: Prefer CSS animations/transitions over JavaScript when possible

## Technology Selection

### When to Use CSS Transitions/Animations

Use CSS for:
- Simple hover effects (scale, opacity, translate)
- Button press feedback
- Basic fade in/out
- Simple dropdown/tooltip open/close
- Decorative background animations (snow, lights)

**Example:**
```tsx
// ✅ Good: CSS transition
<div className="hover:scale-[1.01] transition-transform duration-300" />

// ❌ Bad: Framer Motion for simple hover
<motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }} />
```

### When to Use Framer Motion

Use Framer Motion for:
- Step transitions between screens
- Modal animations (enter/exit)
- Complex hero animations
- Gift-preview card interactions
- Multi-step form transitions
- Complex orchestrated animations

**Example:**
```tsx
// ✅ Good: Complex animation with Framer Motion
<AnimatePresence>
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  />
</AnimatePresence>
```

### When to Use Lottie

Use Lottie for:
- **Hero-level animations only** (max 1 per screen)
- High-impact animations that are central to the UX
- Complex vector animations that can't be achieved with CSS

**Do NOT use Lottie for:**
- Decorative elements (icons, small graphics)
- Multiple animations on the same screen
- Background flourishes

**Guidelines:**
- Max 1 Lottie per screen
- Always use dynamic imports (`LazyLottie` component)
- Provide static poster images as fallbacks
- Never use parallax transforms on Lottie elements

### When to Use Static Images

Use static WebP/PNG for:
- Decorative icons that were previously animated
- Small graphics that don't need motion
- Placeholder images
- Background patterns

## Heavy Effects Limits

**Maximum heavy effects per screen:**
- At most **2** of the following:
  - Lottie animations
  - Canvas-based animations
  - Heavy parallax effects
  - Confetti animations

**Examples:**
- ✅ Landing page: 1 Lottie (hero) + 1 CSS snow effect = OK
- ❌ Landing page: 1 Lottie + Canvas snow + Parallax + Confetti = Too many

## Performance Optimizations

### Snow Particles
- Use CSS keyframes only (no canvas, no RAF)
- Maximum 10-15 particles
- Animate only `transform` and `opacity`

### Twinkling Lights
- Use CSS keyframes only
- Maximum 10-12 lights total
- No parallax transforms
- Animate only `transform` and `opacity`

### Cursor Glow
- Maximum blur radius: 60px
- Throttle pointer move updates (max every 16-32ms)
- Disabled on mobile and reduced motion

### Scroll Listeners
- Use `ScrollMotionProvider` for page-level scroll
- Element-specific scroll tracking should be rare and documented
- Remove parallax from decorative elements

## Mobile & Accessibility

### Mobile Behavior
- Heavy effects automatically disabled on mobile via `useEffectsPolicy`
- Mount policy: Don't mount heavy effects at all (better than pausing)
- Reduced particle/light counts if effects are mounted

### Reduced Motion
- All animations respect `prefers-reduced-motion`
- Use `useReducedMotion()` hook from framer-motion
- Provide static fallbacks for animated content

**Example:**
```tsx
const shouldReduceMotion = useReducedMotion();

// Disable animation if reduced motion
<div className={shouldReduceMotion ? '' : 'animate-pulse'} />
```

## Bundle Size Guidelines

### Chunk Size Limits
- **Warning**: 250KB per chunk
- **Error**: 300KB per chunk
- Build will fail if chunks exceed limits

### Lottie Isolation
- `lottie-react` + `jszip` are isolated in separate chunk
- Only loaded when Lottie components are rendered
- Monitor chunk size in build output

## Code Review Checklist

When reviewing animation code, check:

- [ ] Is this animation necessary for UX?
- [ ] Can this be CSS instead of Framer Motion?
- [ ] Is Lottie used only for hero-level animations?
- [ ] Are there too many heavy effects on one screen?
- [ ] Does it respect `prefers-reduced-motion`?
- [ ] Is it disabled on mobile?
- [ ] Are scroll listeners consolidated?
- [ ] Is parallax removed from decorative elements?

## Migration Guide

### Replacing Framer Motion with CSS

**Before:**
```tsx
<motion.div
  whileHover={{ scale: 1.01, opacity: 0.9 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

**After:**
```tsx
<div className="hover:scale-[1.01] hover:opacity-90 transition-all duration-300">
  Content
</div>
```

### Replacing Canvas with CSS

**Before:** Canvas-based snow with RAF loop

**After:** CSS keyframe animation with static divs

## Examples

### ✅ Good Examples

1. **Simple hover with CSS:**
   ```tsx
   <div className="hover:scale-[1.01] transition-transform" />
   ```

2. **Complex modal with Framer Motion:**
   ```tsx
   <AnimatePresence>
     {isOpen && (
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
       />
     )}
   </AnimatePresence>
   ```

3. **Hero Lottie with dynamic import:**
   ```tsx
   <LazyLottie
     src="/hero-animation.lottie"
     priority="high"
     poster="/hero-poster.webp"
   />
   ```

### ❌ Bad Examples

1. **Framer Motion for simple hover:**
   ```tsx
   <motion.div whileHover={{ scale: 1.01 }} />
   ```

2. **Multiple Lotties on one screen:**
   ```tsx
   <LazyLottie src="/icon1.lottie" />
   <LazyLottie src="/icon2.lottie" />
   <LazyLottie src="/icon3.lottie" />
   ```

3. **Parallax on decorative elements:**
   ```tsx
   <motion.div style={{ y: parallaxY }}>Decorative element</motion.div>
   ```

## Enforcement

This policy is enforced through:
- Code review process
- Build-time bundle size checks
- Performance monitoring
- Lighthouse audits

Violations should be caught in code review and addressed before merge.

