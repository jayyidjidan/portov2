# UI Fix Brief: Dark Portfolio (Vite + React 19 + Tailwind 4)

This document is the working context for Antigravity. Every point has been translated into a technical solution (HTML/CSS/React). Files to edit: `src/App.tsx` and `src/index.css`. Do not rewrite whole files at once. Work section by section, and run `pnpm build` after each one.

## 0. Working rules

1. **The Skill (toolkit) section is already correct. Do not change how it looks.** The only exception is the Tailwind icon (see section 8).
2. Colors, blur values, and glow positions must follow Figma. If you have Figma access (MCP or Dev Mode), read the real values from the relevant node. Otherwise use the defaults in this document and leave a comment `/* TODO: verify against Figma */`.
3. Converting Figma blur to CSS: **`CSS blur(px) = Figma Layer Blur value / 2`**. Figma stores 2x the standard deviation, while CSS uses the standard deviation directly.
4. Do not use `100vw` in layout calculations. `100vw` includes the scrollbar width, so a `fixed` element and a normal-flow element can end up 8–17px apart.
5. New components go in `src/components/`, data in `src/data/` (see section 9).

## 1. Root-cause diagnosis (from reading the code)

| Symptom | Cause in the code |
|---|---|
| Navbar vertical lines don't connect to the hero frame | `.nav` uses `width: min(100% - 48px, 1068px)` with `left: 50%` + `translateX(-50%)`, while `.hero` uses `padding: max(24px, calc((100vw - 1068px)/2))`. Two different formulas, and `100vw` includes the scrollbar. |
| Top and bottom "+" markers don't match | `.cross` is a **text character "+"** with `left: 50%` but no `translateX(-50%)`, and the same `-13px` offset for top and bottom. The glyph baseline makes it asymmetrical. |
| White brackets look untidy | `<Corners/>` uses 4 `<i>` elements with `rotate()`, so the pivot is off by about 1px. On cards with `overflow: hidden`, half of each bracket is clipped and only a small tick remains. |
| About icons look broken | `34143.svg` and `af65e.svg` **already contain a full tile** (fill, border, and their own 4 brackets) and are then wrapped again in `.feature-icon.framed` + `<Corners/>`, producing a double frame. `f6950.svg` is only a bare 31px glyph, and because of `preserveAspectRatio="none"` plus `img {width:100%; height:100%}` it gets **stretched** to 72px. |
| Gmail icon is wrong | `29166.svg` also already contains a full tile. In the footer it is forced to `40x40` inside `.social.framed` + `<Corners/>`, creating a small nested box. |
| Project cards always have a gradient in the middle one | `index === 1 ? 'is-featured'` plus `.project-card.is-featured` in the CSS. |
| Certificate cards always have a gradient + image | `useState(1)` for `activeCertificate` (the 2nd row is active by default), it never resets on mouse leave, and `.certificate-preview` is always rendered. |
| Glow leaks across sections | `.glow-middle::before` uses `right: -300px; bottom: -100px` on `.projects`, which doesn't clip, so the glow bleeds into the Toolkit section. |
| Secondary button doesn't match the design | `.button` uses `border: 1px solid rgb(255 255 255 / .7)` and a gradient with alpha `.13`. |

## 2. Global foundation (do this first)

### 2.1 Design tokens, in `:root` of `index.css`

```css
:root {
  --nav-h: 72px;
  --container: min(100% - 48px, 1068px);      /* single source of width for nav and hero frame */
  --line: rgb(255 255 255 / 0.42);
  --bracket: rgb(255 255 255 / 0.8);
  --orange: #f58a3c;
  --orange-rgb: 245 138 60;
  --card-hover: linear-gradient(180deg, rgb(250 129 18 / 0.5) 0%, rgb(250 129 18 / 0) 72%); /* TODO: verify against Figma */
}

section[id] { scroll-margin-top: var(--nav-h); }   /* anchors don't hide under the fixed navbar */
```

### 2.2 `.bracketed` utility (replaces the `<Corners/>` component, except in ToolTile)

One pseudo-element with 8 gradients. The result is pixel-accurate, with no `rotate()` and no 4 `<i>` elements.

```css
.bracketed { position: relative; }

.bracketed::before {
  content: '';
  position: absolute;
  inset: -1px;                 /* sits exactly on top of the 1px border */
  z-index: 3;
  pointer-events: none;
  --c: var(--bracket);
  --l: 12px;                   /* bracket arm length */
  --w: 1px;                    /* line thickness */
  background:
    linear-gradient(var(--c) 0 0) top left    / var(--l) var(--w),
    linear-gradient(var(--c) 0 0) top left    / var(--w) var(--l),
    linear-gradient(var(--c) 0 0) top right   / var(--l) var(--w),
    linear-gradient(var(--c) 0 0) top right   / var(--w) var(--l),
    linear-gradient(var(--c) 0 0) bottom left / var(--l) var(--w),
    linear-gradient(var(--c) 0 0) bottom left / var(--w) var(--l),
    linear-gradient(var(--c) 0 0) bottom right/ var(--l) var(--w),
    linear-gradient(var(--c) 0 0) bottom right/ var(--w) var(--l);
  background-repeat: no-repeat;
}

/* variant: brackets on the 2 bottom corners only (used on the hero frame) */
.bracketed--bottom::before {
  background:
    linear-gradient(var(--c) 0 0) bottom left / var(--l) var(--w),
    linear-gradient(var(--c) 0 0) bottom left / var(--w) var(--l),
    linear-gradient(var(--c) 0 0) bottom right/ var(--l) var(--w),
    linear-gradient(var(--c) 0 0) bottom right/ var(--w) var(--l);
  background-repeat: no-repeat;
}

/* variant: brackets only appear on hover/focus (project and certificate cards) */
.bracketed--hover::before { opacity: 0; transition: opacity 200ms ease; }
.bracketed--hover:hover::before,
.bracketed--hover:focus-within::before { opacity: 1; }
```

### 2.3 `.hover-card` base: gradient appears on hover (used by ProjectCard and CertificateCard)

A gradient can't be transitioned directly, so put it on a pseudo-element and animate `opacity`.

```css
.hover-card { position: relative; isolation: isolate; background: transparent; }

.hover-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;                 /* behind the content, above the section background */
  background: var(--card-hover);
  opacity: 0;
  transition: opacity 240ms ease;
  pointer-events: none;
}

.hover-card:hover::after,
.hover-card:focus-within::after { opacity: 1; }
```

### 2.4 Per-section gradient wrapper (`SectionShell`)

Goal: the orange glow lives **inside each section's own wrapper**, is clipped by the section boundary, and never leaks into other sections.

Markup structure:

```tsx
<section className="section" id="projects">
  <div className="section__bg" aria-hidden="true">
    <span className="section__glow" />
  </div>
  <div className="section__inner">{children}</div>
</section>
```

```css
.section {
  position: relative;
  isolation: isolate;          /* a child with z-index:-1 stays above the page background */
  overflow: clip;              /* clips without creating a scroll container */
  width: 100%;                 /* full-bleed. The 1440px limit lives on .section__inner */
}

.section__inner { width: min(100%, 1440px); margin-inline: auto; padding: 100px 84px; }

.section__bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  overflow: hidden;
  /* fade at the top/bottom edges so there is no hard cut line between sections */
  -webkit-mask-image: linear-gradient(180deg, transparent 0, #000 160px, #000 calc(100% - 160px), transparent 100%);
          mask-image: linear-gradient(180deg, transparent 0, #000 160px, #000 calc(100% - 160px), transparent 100%);
}

.section__glow {
  position: absolute;
  left: var(--glow-x, 50%);
  top: var(--glow-y, 50%);
  width: var(--glow-w, 640px);
  height: var(--glow-h, 540px);
  translate: -50% -50%;
  border-radius: 50%;
  background: rgb(var(--orange-rgb) / var(--glow-alpha, 0.8));
  filter: blur(var(--glow-blur, 90px));   /* = Figma Layer Blur / 2 */
}
```

Glow values per section (defaults from the reference design, **verify against Figma**):

| Section | Glow placement | `--glow-x` | `--glow-y` | `--glow-w` × `--glow-h` | `--glow-alpha` | `--glow-blur` |
|---|---|---|---|---|---|---|
| Hero | inside the frame, centered | 50% | 50% | `min(720px, 80%)` × `min(560px, 75%)` | 0.9 | 60px |
| Projects | bottom right, half off-canvas | 100% | 85% | 640px × 540px | 0.8 | 90px |
| Intro, Toolkit, Certifications, Contact | no glow | | | | | |

Usage example: `<div className="section__bg" style={{ '--glow-x': '100%', '--glow-y': '85%' } as React.CSSProperties}>`.

Delete the old rules `.glow::before`, `.glow-middle::before`, `.glow`, and `.glow-middle`. Also remove `overflow: hidden` from `main` if it is no longer needed.

### 2.5 Button

The secondary button uses the exact values from the design. The primary button is unchanged.

```css
.button {
  min-height: 50px;
  padding: 15px 17px;
  border: 0.5px solid #fff;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 40.2%, rgba(255, 255, 255, 0.4) 190.2%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: -0.04em;
  transition: transform 180ms ease, filter 180ms ease;
}
.button:hover { transform: translateY(-2px); filter: brightness(1.15); }

.button--primary {                       /* renamed from .button-primary */
  color: #e47510;
  border-color: transparent;
  background: linear-gradient(145deg, #fff2e7 28%, #fa8112 172%);
}
```

Removed: `border-color: #f58a3c` on hover (not in Figma) and the old alpha values (`0.7` / `0.13`).

### 2.6 `IconTile` (one component for the About icons, footer icons, and so on)

```css
.icon-tile {
  position: relative;
  width: var(--tile, 72px);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  background: rgb(255 255 255 / 0.2);
  border: 1px solid rgb(255 255 255 / 0.2);
}
.icon-tile > img,
.icon-tile > svg { width: var(--glyph, 40px); height: var(--glyph, 40px); object-fit: contain; }
```

**Rule:** never put `width: 100%; height: 100%` on an SVG that has `preserveAspectRatio="none"`. That is what makes icons stretch. Always use explicit pixel sizes.

## 3. Hero

### 3.1 Navbar connects to the frame, plus a full-width bottom line

Split the navbar into two layers: a **full-bleed header** (carrying the screen-wide bottom line) and a **nav** inside it (carrying the two vertical lines at container width).

```tsx
<header className="site-header">
  <nav className="nav" aria-label="Primary navigation">…links…</nav>
</header>
```

```css
.site-header {
  position: fixed;
  inset: 0 0 auto 0;
  height: var(--nav-h);
  z-index: 50;
  border-bottom: 1px solid var(--line);        /* horizontal line across the full screen */
  background: rgb(15 8 4 / 0.72);
  backdrop-filter: blur(14px);
}

.nav {
  width: var(--container);                     /* same token as the hero frame */
  height: 100%;
  margin-inline: auto;
  border-inline: 1px solid var(--line);        /* same color as the frame border */
  display: flex; align-items: center; justify-content: center; gap: 48px;
  text-transform: uppercase; color: #939393; font-size: 12px; letter-spacing: -0.04em;
}
```

Hero:

```css
.hero { padding-top: calc(var(--nav-h) - 1px); }   /* the frame's top border lands exactly on the header's bottom line (no 1px gap) */

.hero-frame {
  position: relative;
  isolation: isolate;
  width: var(--container);                     /* replaces the 100vw-based padding */
  margin-inline: auto;
  min-height: calc(910px - var(--nav-h));
  border: 1px solid var(--line);
  display: grid; place-items: center; text-align: center;
}
```

Remove `padding: 72px max(24px, calc((100vw - 1068px)/2)) 0` from `.hero`. Check at 1440, 1280, and 1024px width, with and without a scrollbar: the left and right edges of the nav lines must line up pixel-for-pixel with the frame's left and right borders.

### 3.2 Frame markers: SVG "+" and brackets

Replace `.cross` (a text character) with an SVG. Marker layout:
- **Top** line: "+" at the left corner, "+" at the right corner, and "+" in the center.
- **Bottom** line: an "L" bracket at the left and right corners (`.bracketed--bottom`), and a "+" in the center. The bottom-center marker **uses exactly the same SVG component** as the top-center marker.

> If the layout differs in Figma, follow Figma.

```tsx
export function PlusMarker({ className = '' }: { className?: string }) {
  return (
    <svg className={`plus-marker ${className}`} width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
      <path d="M7.5 0V15M0 7.5H15" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  );
}
```

```css
.hero-frame { --bw: 1px; }                      /* border thickness, used to center markers on the line */

.plus-marker {
  position: absolute;
  z-index: 3;
  color: var(--bracket);
  pointer-events: none;
  translate: -7.5px -7.5px;                     /* SVG center = anchor point (15px / 2) */
}
/* absolute offsets are measured from the padding box, while the border sits outside it.
   So the center of the border line is at -bw/2 and 100% + bw/2 */
.mk-tl { left: calc(var(--bw) / -2);            top: calc(var(--bw) / -2); }
.mk-tr { left: calc(100% + var(--bw) / 2);      top: calc(var(--bw) / -2); }
.mk-tc { left: 50%;                             top: calc(var(--bw) / -2); }
.mk-bc { left: 50%;                             top: calc(100% + var(--bw) / 2); }
```

Hero frame markup: `<div className="hero-frame bracketed bracketed--bottom">` containing 4 `PlusMarker`s (`mk-tl`, `mk-tr`, `mk-tc`, `mk-bc`), then `.hero-frame__bg`, then `.hero-copy`. The SVG center must land exactly on the middle of the border line. Check at 200% browser zoom: no marker may look blurry or shifted by 1px.

### 3.3 Hero glow inside the frame

```tsx
<div className="section__bg hero-frame__bg" aria-hidden="true">
  <span className="section__glow"
        style={{ '--glow-w': 'min(720px, 80%)', '--glow-h': 'min(560px, 75%)', '--glow-alpha': 0.9, '--glow-blur': '60px' } as React.CSSProperties} />
</div>
```

```css
.hero-frame__bg { mask-image: none; -webkit-mask-image: none; }   /* clipped by the frame, no vertical fade */
```

`.section__bg` already has `inset: 0; overflow: hidden`, so the glow is cut exactly at the frame edge and never escapes. The markers and brackets live on `.hero-frame`, not on `.section__bg`, so they are not clipped.

## 4. About (Intro)

Use `IconTile` for all three icons with a bare glyph inside. The tile is drawn by CSS, not by the SVG.

1. **Remove** the `.feature-icon.framed` wrapper and `<Corners/>` from the features.
2. **Prepare 3 bare glyphs.** Two of the assets (`34143.svg` and `af65e.svg`) contain a tile, so extract only the glyph group:
   - Create `public/assets/glyph-zoom-in.svg`: copy the contents of `<g id="circum:zoom-in">…</g>` from `34143.svg` and wrap it in `<svg viewBox="16.36 16.36 40 40" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">…</svg>`.
   - Create `public/assets/glyph-recycle.svg`: copy the contents of `<g id="energy-icons:recycle-48">…</g>` from `af65e.svg` with the same `viewBox="16.36 16.36 40 40"`.
   - `f6950.svg` (note) is already a bare 31×31 glyph, so use it as is.
   - Alternative without editing SVGs: `pnpm add lucide-react`, then use `ZoomIn`, `StickyNote`, `RefreshCw` with `size={32}` and `strokeWidth={1.25}`. Pick one approach and use it consistently.
3. `viewBox="16.36 16.36 40 40"` works because the original tile's center is at (36.36, 36.36) and the glyph occupies a 40×40 box around it.

```tsx
<IconTile size={72} glyph={32}><img src="/assets/glyph-zoom-in.svg" alt="" /></IconTile>
```

For the `.features` layout, add `align-items: start` to the grid so the icon row stays aligned even when "Clear Documentation" wraps to two lines, and keep a `40px` gap between tile and label.

## 5. Project

1. Remove `index === 1 ? 'is-featured' : ''` from `App.tsx` and remove `.project-card.is-featured` from the CSS. **Every card is plain by default**, with no gradient and no brackets.
2. Create a `ProjectCard` component with class `hover-card bracketed bracketed--hover`. The gradient (via `::after`) and brackets (via `::before`) only appear on `:hover` or `:focus-within`.
3. Move `overflow: hidden` from the card root to the image wrapper. If it stays on the root, half of each bracket (which sits at `-1px`) gets clipped.

```css
.project-card {
  height: 542px;
  padding-top: 24px;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  /* no overflow:hidden here */
}
.project-card__media {
  width: calc(100% - 44px);
  height: 220px;
  overflow: hidden;                    /* crop the skewed image here only */
}
.project-card__media img { width: 92%; height: 100%; margin: 18px auto 0; object-fit: cover; transform: skewX(-10deg); border-radius: 3px; }
```

## 6. Certificate

1. Remove `useState(1)` for `activeCertificate`, the `onMouseEnter` and `onFocus` handlers, and the separate `.certificate-preview` element in `.cert-body`. **The interaction is pure CSS** (`:hover` and `:focus-within`), with no React state.
2. A default row is **empty**: no gradient, no brackets, no image. Remove `<Corners/>` and use `bracketed bracketed--hover`.
3. On hover: the orange gradient (via `.hover-card::after`), white brackets, and the certificate image appear **inside that row**, positioned `absolute` with a subtle 3D effect.
4. Add an `image` field to each certificate in `src/data/certificates.ts`. For now `5ce5f.png` can serve as a placeholder.

```tsx
<article className="hover-card cert-row bracketed bracketed--hover">
  <div className="cert-row__text"><h3>{title}</h3><p>{issuer}</p></div>
  <Button>See Credential</Button>
  <div className="cert-row__preview" aria-hidden="true"><img src={image} alt="" /></div>
</article>
```

```css
.cert-row {
  min-height: 132px;
  padding: 24px;
  display: flex; align-items: center; justify-content: space-between;
  overflow: visible;                              /* the preview may extend outside the row */
}
.cert-row:hover, .cert-row:focus-within { z-index: 5; }   /* this row's preview must sit above the neighboring row (each row has its own stacking context) */

.cert-row__preview {
  position: absolute;
  z-index: 4;
  left: 57%; top: 50%;
  width: min(420px, 38%);
  aspect-ratio: 945 / 614;
  pointer-events: none;                           /* the image must not "steal" the hover */
  opacity: 0;
  visibility: hidden;
  transform: translate(-50%, -44%) perspective(1100px) rotateX(18deg) rotateY(-12deg) rotateZ(-12deg) scale(0.9);
  transition: opacity 260ms ease, transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0s linear 260ms;
  filter: drop-shadow(0 28px 34px rgb(0 0 0 / 0.45));
}
.cert-row:hover .cert-row__preview,
.cert-row:focus-within .cert-row__preview {
  opacity: 1;
  visibility: visible;
  transform: translate(-50%, -50%) perspective(1100px) rotateX(18deg) rotateY(-12deg) rotateZ(-12deg) scale(1);
  transition-delay: 0s;
}
.cert-row__preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; display: block; }

@media (hover: none), (max-width: 700px) { .cert-row__preview { display: none; } }
```

Notes: the Certifications section must stay `overflow: clip` without cutting off the preview. Give the section at least 120px of `padding-bottom` so the last row's preview isn't clipped. Adjust the `rotateX/Y/Z` angles to match Figma. "Subtle 3D" means small angles.

## 7. Contact + Footer

### 7.1 Remove the photo, keep the text in the same position

Remove the `.contact-photo` element from the JSX, its CSS rules, and the `5146a.png` import (the asset file can be deleted). The old grid used columns `172px 1fr` with a `100px` gap, so the text started at `272px`. Keep that offset with tokens:

```css
:root { --contact-photo: 172px; --contact-gap: 100px; }

.contact-inner { display: block; }
.contact-copy { margin-left: calc(var(--contact-photo) + var(--contact-gap)); }

@media (max-width: 700px) { .contact-copy { margin-left: 0; } }
```

### 7.2 Gmail icon

1. Create `public/assets/glyph-gmail.svg`: copy the contents of `<g id="cib:gmail">…</g>` from `29166.svg` and wrap it with `viewBox="16.36 16.36 40 40" width="40" height="40"`. The result is a bare white "M" glyph with no tile.
2. All three social icons (GitHub, Gmail, WhatsApp) use the same component: `<IconTile size={72} glyph={40}>` + `bracketed`, with a bare-glyph `<img>`. GitHub (`f305f.svg`) and WhatsApp (`1281d.svg`) are already bare glyphs, so only Gmail needs replacing.
3. Remove `.social img { width: 40px; height: 40px }` if `--glyph` already covers it.

## 8. Extra findings (fix these too)

- **Tailwind icon in Skill.** `885a5.svg` is just a black rectangle (`<path fill="black">`), so Skill shows a black box. Replace it with the real Tailwind logo (color `#38BDF8`, about 24px tall). This is the only change allowed in Skill.
- **"Download CV" button** currently points to `#contact`. Change it to `<a href="/cv.pdf" download>` and put the file in `public/`.
- **Social links** are still placeholders (`href="#"` and `mailto:hello@example.com`). Add a TODO or fill in the real links.
- **Fonts** are loaded from `static.figma.com` (Figma URLs can expire). Move to self-hosting: `pnpm add @fontsource/azeret-mono @fontsource/inter` and import them in `main.tsx`.
- **Accessibility.** Add `@media (prefers-reduced-motion: reduce)` that disables the `transform` and `opacity` transitions on cards and previews.

## 9. Component structure (for consistency)

```
src/
  components/
    Button.tsx          (variant: "primary" | "secondary", from .button / .button--primary)
    IconTile.tsx        (size, glyph)
    PlusMarker.tsx
    SectionShell.tsx    (section + section__bg + section__glow + section__inner, props: glow vars)
    HoverCard.tsx       (base: hover-card bracketed bracketed--hover)
    ProjectCard.tsx     (uses HoverCard)
    CertificateCard.tsx (uses HoverCard + preview)
    ToolTile.tsx        (DO NOT change how it looks)
  data/
    projects.ts  certificates.ts  tools.ts
```

`ProjectCard` and `CertificateCard` are both built on `HoverCard`, so the gradient, brackets, and hover transitions all come from the same CSS.

## 10. Verification checklist

- [ ] Navbar vertical lines line up exactly with the hero frame's left and right borders at 1440, 1280, and 1024px, with and without a scrollbar.
- [ ] The navbar's bottom line spans the full screen width and merges with the frame's top border (no gap or double line).
- [ ] Top-left, top-right, top-center, and bottom-center "+" markers use the same SVG and sit exactly on the line (check at 200% zoom). "L" brackets are on the bottom corners.
- [ ] The hero glow does not leave the frame. The Projects glow does not leak into Toolkit.
- [ ] About: the three icon tiles are the same size, with no double frame and no stretched icons.
- [ ] Project and Certificate: the default state is plain (no gradient, no brackets). The gradient and brackets appear only on hover or focus.
- [ ] Certificate: the image appears only on hover, with a subtle 3D angle, and is not covered by the row below it.
- [ ] Contact: no photo, and the text stays in its original position (desktop). Footer: the Gmail icon is a bare "M" glyph inside the standard tile.
- [ ] Secondary button: `border: 0.5px solid #fff` and the gradient match the values in section 2.5.
- [ ] The Skill section is identical to before (except the Tailwind icon). `pnpm build` passes without errors.
