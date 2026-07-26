---
name: CoBuild Design System
colors:
  surface: '#ffffff'
  surface-dim: '#f1f5f9'
  surface-bright: '#ffffff'
  background: '#f8fafc'
  border-subtle: '#e2e8f0'
  primary: '#0f172a'
  secondary: '#334155'
  tertiary: '#3b82f6'
  text-main: '#191c1e'
  text-muted: '#64748b'
  success-green: '#10b981'
  warning-amber: '#f59e0b'
  error: '#ba1a1a'
  error-container: '#ffdad6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 4px
  DEFAULT: 6px
  md: 6px
  lg: 8px
  full: 9999px
spacing:
  unit: 4px
  container-max: 1200px
---

## Brand & Style

The brand personality of the design system is **technical, precise, and utilitarian**. It is designed specifically for builders—developers and designers who value speed, efficiency, and clarity over decorative flourishes. The design system positions itself as a "pre-development workbench," bridging the gap between a raw idea and a repository.

The chosen style is **Modern Minimalist with a focus on High-Density Utility**. It draws inspiration from modern developer tools, utilizing a structured grid, subtle borders instead of heavy shadows, and a monochromatic foundation with strategic hits of color for action.

**Key Brand Pillars:**
- **Clarity over Decoration:** Every UI element must serve a functional purpose.
- **Developer-Centric:** Use of monospaced accents and high-contrast typography to evoke a "code-adjacent" feel.
- **Trust through Precision:** Perfectly aligned grids and consistent spacing convey professional reliability.
- **Low Friction:** High-density layouts allow for rapid scanning of project roles and applicant statuses.

## Colors

The color strategy for the design system is anchored in a **Deep Slate and Indigo** palette to establish immediate professional trust.

- **Primary (#0F172A):** Used for headings, primary text, and high-emphasis interface anchors.
- **Secondary (#334155):** Used for secondary actions and iconography.
- **Tertiary/Accent (#3B82F6):** A vibrant blue reserved strictly for primary calls-to-action (e.g., "Apply for Role", "Create Project") and active focus states.
- **Background (#F8FAFC):** A cool-toned off-white used for backgrounds to reduce eye strain compared to pure white.

**Color Application Rules:**
- Use `border-subtle` (#E2E8F0) for all container divisions. Avoid using shadows to define depth; rely on these hairlines.
- `text-muted` (#64748B) should be used for metadata, such as "Posted 2 days ago" or "3/5 roles filled."

## Typography

The typography system prioritizes scanability and hierarchy. **Inter** is the workhorse font, utilized for its exceptional legibility at small sizes and its neutral, modern tone.

**System Logic:**
- **Headings:** Apply tight negative letter-spacing (`-0.02em` to `-0.03em`) to large headlines to create a "compact" and authoritative feel.
- **Technical Labels:** **JetBrains Mono** is introduced for labels, tags, and status indicators (e.g., "OPEN", "PENDING", "v1.0.4"). This reinforces the developer-focused nature of the product.
- **Body Text:** Keep body text strictly at `16px` or `14px` for high-density information layouts. Use a generous line height (`1.5x`) to maintain readability amidst data-heavy project descriptions.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. On desktop, content is centered within a `1200px` container to ensure line lengths remain readable for project descriptions. On smaller screens, the layout becomes fluid with `16px` side margins.

**Spacing Philosophy:**
- **4px Base Unit:** All margins and paddings must be multiples of 4px.
- **High Density:** Use tight spacing for grouped items like tags or role requirements. Use larger spacing to separate major sections.

## Elevation & Depth

This design system avoids traditional shadows in favor of **Tonal Layers and Low-Contrast Outlines**.

- **Surface Levels:**
  - **Level 0 (Background):** Background (#F8FAFC).
  - **Level 1 (Cards/Sidebar):** White (#FFFFFF) with a `1px` border of `border-subtle`.
  - **Level 2 (Popovers/Modals):** White with a very subtle, diffused shadow (`0px 4px 12px rgba(0,0,0,0.05)`) to indicate temporary overlay.
- **Interactive Depth:** On hover, cards should not "lift" with a shadow. Instead, the border color should transition to a slightly darker gray or the primary brand color to indicate interactivity.

## Shapes

The shape language is **Sharp and Efficient**. A low roundedness level is used to maintain a professional, "engineered" look that matches the precision of developer tools.

- **Standard Radius:** `4px` or `6px` for buttons and input fields.
- **Container Radius:** `8px` for project cards and modals.
- **Pill Shape:** Reserved exclusively for status badges (e.g., "Full-time," "Remote") to distinguish them from interactive buttons.
