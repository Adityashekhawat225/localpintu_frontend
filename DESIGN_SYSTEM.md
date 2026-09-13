# LocalPintu — Aubergine Atelier Design System

## Brand identity

LocalPintu combines modern engineering with calm, high-touch home care. The visual identity uses two brand colours only: Aubergine expresses trust, expertise and discretion; Antique Brass expresses craft, warmth and premium service. Bone, porcelain and grey-violet are neutral support colours.

## Colour tokens

| Token | HEX | Usage |
|---|---:|---|
| Primary | `#35213F` | Navigation, key icons, premium panels |
| Primary hover | `#432B50` | Hover states |
| Primary active | `#291931` | Pressed states and footer |
| Secondary | `#B08A58` | Highlights, dividers, active detail |
| Secondary hover | `#C09A67` | Accent hover |
| Secondary active | `#967142` | Accessible accent text |
| Accent highlight | `#DBC29B` | Soft badges and glow |
| Background | `#F6F1E8` | Main canvas |
| Background soft | `#EEE7DC` | Alternating sections |
| Surface | `#FFFDF9` | Inputs and translucent surfaces |
| Card | `#FFFFFF` | Elevated cards |
| Border | `rgba(53,33,63,.12)` | Component outlines |
| Divider | `rgba(53,33,63,.08)` | Internal separation |
| Text primary | `#2B2430` | Headings and body emphasis |
| Text secondary | `#625968` | Body copy |
| Muted | `#8B828E` | Metadata |
| Placeholder | `#A69DA7` | Input placeholders |
| Success | `#297A62` | Confirmed states only |
| Warning | `#A86B25` | Warning states only |
| Danger | `#B34B57` | Error states only |
| Overlay | `rgba(35,22,42,.66)` | Modal and image overlays |
| Focus | `rgba(176,138,88,.32)` | Keyboard focus ring |
| Selection | `rgba(219,194,155,.46)` | Text selection |
| Skeleton | `#E6DED3` | Loading placeholders |

Primary gradient: `linear-gradient(135deg, #35213F 0%, #50345C 58%, #B08A58 100%)`.

## Typography

Preferred family: **Manrope** for display and UI, with **Inter** and the native system stack as fallbacks. Editorial emphasis may use Georgia sparingly.

| Role | Size | Weight | Line height | Tracking |
|---|---|---:|---:|---:|
| Hero H1 | `clamp(44px, 5.3vw, 72px)` | 780 | 1.03 | -0.06em |
| Section heading | `clamp(38px, 5vw, 64px)` | 750 | 1.06 | -0.052em |
| Card heading | 18–22px | 750 | 1.35 | -0.025em |
| Subheading | 16–18px | 700 | 1.5 | -0.015em |
| Body | 15–16px | 400–500 | 1.7–1.9 | 0 |
| Button / nav | 11–13px | 800 | 1 | 0.01em |
| Label / badge | 8–10px | 850 | 1.2 | 0.11–0.14em |
| Statistics | 44–58px | 800 | 1 | -0.06em |

Never use body copy below 12px. Touch targets must remain at least 44px.

## Spacing

8px base system: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 128px`.

- Card internal padding: 20–28px
- Section vertical padding: 80–128px desktop, 64–80px mobile
- Grid gaps: 16–24px
- Content maximum: 1280–1320px
- Body reading width: 680–760px

## Radius

- XS: 8px
- SM: 12px
- MD: 16px
- LG: 24px
- XL: 32px
- Pill: 999px

Controls use 12px; cards use 20–24px; major editorial images use 24–32px.

## Elevation and shadows

- XS: `0 2px 8px rgba(53,33,63,.05)`
- SM: `0 8px 24px rgba(53,33,63,.07)`
- MD: `0 18px 48px rgba(53,33,63,.09)`
- LG: `0 30px 80px rgba(53,33,63,.14)`
- Premium glow: `0 0 0 1px rgba(176,138,88,.12), 0 22px 60px rgba(53,33,63,.1)`

Use one elevation step per interaction. Avoid dark or hard-edged shadows.

## Components

### Buttons

Primary uses the brand gradient, white text, 12px radius, minimum 48px height and medium elevation. Hover translates `-2px`; pressed returns to zero. Secondary uses porcelain fill and aubergine text. Ghost buttons use no fill until hover. Disabled controls use 50% opacity and no transform.

### Cards

Cards use white fill, 1px border and SM elevation. Hover uses brass-tinted border, MD elevation and at most `translateY(-6px)`. Image cards use a restrained aubergine overlay for legibility.

### Forms

Inputs use porcelain fill, 12px radius, 48px minimum height and aubergine translucent border. Focus uses a brass border and 4px focus halo. Labels remain visible; placeholders never replace labels.

### Navigation

Aubergine utility bar, translucent porcelain main navigation, 1320px maximum width and subtle blur. Active links use aubergine text with a brass indicator. Dropdowns use porcelain surfaces and LG elevation.

### Footer

Primary-active aubergine background, muted lavender-grey text and brass dividers. The CTA panel uses a restrained aubergine/brass radial gradient.

## Motion

Standard easing: `cubic-bezier(.22, 1, .36, 1)`.

- Button interaction: 220–280ms
- Card elevation: 280ms
- Section reveal: 600–750ms
- Modal: 260–320ms
- Page transition: 280ms

Only opacity, transform and occasional blur should animate. Respect `prefers-reduced-motion`.

## Iconography

Use Feather-style outline icons at a consistent 1.5–2px perceived stroke. Standard sizes are 16, 20 and 24px. Icon containers use 40–48px squares with 12–14px radius. Icons must never be decorative without an accessible label when interactive.

## Responsive rules

- Mobile: 320–679px, single-column content and full-width primary actions
- Tablet: 680–999px, two-column grids where content allows
- Laptop: 1000–1279px, constrained desktop composition
- Desktop: 1280–1599px, 1240–1320px content maximum
- Ultra-wide: 1600px+, maintain content maximum and increase outer whitespace

Typography uses `clamp()`; components never rely on fixed desktop widths.

## Accessibility

- Maintain WCAG AA contrast for text and interactive states
- Preserve visible `:focus-visible` rings
- Minimum 44px interactive target
- Use semantic headings in sequential order
- Every meaningful image requires useful alt text
- Never convey status with colour alone
- Provide reduced-motion alternatives

## Figma specification

Create variables matching every `--lp-*` CSS custom property. Build colour variables in Brand, Neutral, Semantic and Overlay collections. Use Auto Layout with the 8px spacing scale. Component variants: default, hover, pressed, focus, disabled and loading. Desktop frame: 1440px with 80px outer margin; tablet: 768px with 32px; mobile: 390px with 16px.

## Consistency checklist

- Only Aubergine and Antique Brass are used as brand colours
- Semantic colours only appear for status
- All cards use the shared surface, border and shadow tokens
- All controls use the shared focus ring
- Headings follow the defined scale
- Body copy is never smaller than 12px
- Section spacing follows the 8px system
- Hover movement never exceeds 6px
- Blur is limited to navigation, overlays and floating proof cards
- Every layout works at 320px without horizontal scrolling