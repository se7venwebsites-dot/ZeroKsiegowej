# Design System Specification: High-End Financial Intelligence

## 1. Overview & Creative North Star
### Creative North Star: "The Digital Architect"
This design system moves away from the cluttered, line-heavy interfaces of traditional accounting software and toward a "Digital Architect" aesthetic. It treats financial data as a high-end editorial experience—authoritative, spacious, and meticulously structured. 

The system breaks the "SaaS template" look by utilizing **Intentional Asymmetry** and **Tonal Depth**. Instead of rigid grids separated by lines, we use massive white space and overlapping surface layers to guide the eye. We prioritize a "Cleanroom" environment: if an element doesn't serve a critical cognitive function, it is removed. The result is a high-trust, premium atmosphere that feels more like a private wealth management tool than a tax calculator.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a high-contrast relationship between deep navies and surgical whites, punctuated by a singular "Action Blue" that commands attention.

### Surface Hierarchy & The "No-Line" Rule
**Rule:** 1px solid borders are strictly prohibited for sectioning content. 
Boundaries must be defined through **Background Color Shifts** or **Nesting**.
- **Surface (Base):** `#f7f9fb` (The canvas).
- **Surface-Container-Low:** Use for secondary sidebars or grouping background elements.
- **Surface-Container-Lowest:** `#ffffff` (The primary card color). When placed on a `surface-container-low` background, the shift in tone creates a natural "lift" without a single line of CSS border.

### The Glass & Gradient Rule
To achieve the "innovative" brand pillar, use **Glassmorphism** for floating elements (Modals, Dropdowns, Hover Tooltips):
- **Token:** `surface-container-lowest` at 70% opacity + `backdrop-blur: 20px`.
- **Signature Textures:** For primary CTAs and Hero sections, apply a subtle linear gradient from `primary` (#004ac6) to `primary_container` (#2563eb) at a 135° angle. This adds "soul" and prevents the interface from feeling flat and clinical.

---

## 3. Typography: Editorial Authority
We use **Inter** not as a standard UI font, but as a bold, editorial statement.

*   **Display & Headlines:** Must use `font-weight: 700` or `800` with a negative letter-spacing of `-0.02em` to `-0.04em`. This creates a "tight," premium look found in high-end financial journals.
*   **Body:** Keep letter-spacing at `0` or slightly positive for maximum legibility.
*   **Hierarchy as Brand:** Use `display-lg` for data highlights (e.g., Total Revenue) to create "Value Landmarks" that dwarf the surrounding UI, instantly communicating what matters most.

| Level | Token | Size | Weight | Note |
| :--- | :--- | :--- | :--- | :--- |
| Display | `display-lg` | 3.5rem | 800 | Tight tracking (-0.04em) |
| Headline | `headline-sm` | 1.5rem | 700 | Primary section headers |
| Title | `title-md` | 1.125rem | 600 | Card titles |
| Body | `body-md` | 0.875rem | 400 | Standard UI text |
| Label | `label-sm` | 0.6875rem | 500 | All-caps, slightly tracked out |

---

## 4. Elevation & Depth
### The Layering Principle
Depth is achieved by "stacking" the surface-container tiers. 
- **Example:** A `surface-container-lowest` card sitting on a `surface-container-low` section. The hierarchy is communicated by the brightness of the white, not a shadow.

### Ambient Shadows
When a component must "float" (e.g., a primary action button or a modal):
- **Shadow Token:** `0px 20px 40px rgba(15, 23, 42, 0.06)`. 
- **Logic:** The shadow color must be a tinted version of the `on-surface` color (Deep Navy), never pure black. The blur must be at least 2x the spread to ensure an "ambient" feel.

### The Ghost Border
If accessibility requires a container edge (e.g., in high-sunlight environments), use the **Ghost Border**:
- **Token:** `outline-variant` (#c3c6d7) at **15% opacity**. It should be felt rather than seen.

---

## 5. Components
### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (1.5rem) corner radius, white text. No shadow in rest state; subtle ambient shadow on hover.
- **Secondary:** Surface-container-highest background with `on-surface` text. No border.

### Input Fields
- **Styling:** `surface-container-low` background, no border. On focus, the background shifts to `surface-container-lowest` with a 1px `primary` ghost border (20% opacity).
- **Radius:** Always `lg` (1rem).

### Cards & Data Lists
- **The Forbid Rule:** No divider lines between list items. Use vertical white space from the spacing scale (`spacing-4` or `spacing-6`) to separate rows.
- **Financial Cards:** Use glassmorphism for "Active" states. An active invoice card should have a backdrop blur and a `surface-tint` glow at the edge.

### Additional Signature Components
- **The "Pulse" Indicator:** For real-time syncing or live data, use a small `tertiary` (Success Green) dot with a soft radial glow.
- **The Modern Tab:** No "underline" for active tabs. Use a pill-shaped `surface-container-highest` background for the active state, transitioning smoothly with a spring-based animation.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-12` and `spacing-16` for section margins. Breathing room is a luxury.
- **Do** use `tertiary` (Success Green) sparingly. It should signify "Growth" or "Completion," never just decoration.
- **Do** treat "Empty States" as editorial opportunities. Use a `display-sm` headline and a `surface-variant` background to make an empty screen feel intentional.

### Don't
- **Don't** use 100% opaque borders to separate the sidebar from the main content. Use a subtle color shift from `surface-container-low` to `surface`.
- **Don't** use standard "Drop Shadows" (dark, tight, and heavy). They break the "Digital Architect" aesthetic.
- **Don't** cram data. If a table has more than 8 columns, utilize a "Horizontal Peek" layout rather than shrinking the font size. Readability is the foundation of trust.