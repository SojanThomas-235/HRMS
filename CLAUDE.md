# HRMS — Project Design Guidelines for Claude

## Project Overview
This is a Human Resource Management System (HRMS) built as a **cozy luxury ERP**.
Stack: Next.js 15 App Router · TypeScript · Tailwind CSS · TanStack Query v5 · Express.js v5 · Prisma 7 · PostgreSQL 16.

---

## Design Philosophy — "Cozy Luxury ERP"

The UI must feel warm, polished, and premium — not clinical or corporate.
Think: tasteful shadows, clean spacing, smooth transitions, elegant typography.
Reference aesthetic: the Unfold customer list UI (dark sidebar, warm content, rich side-preview panels).

### Core principles
1. **Warmth over flatness** — use subtle gradients on hero sections, layered card shadows.
2. **Calm density** — enough whitespace that content breathes, but not so sparse it feels empty.
3. **No redundant labels** — actions communicate through icons + tooltip; save text for content.
4. **Always both themes** — every class that sets a colour must have a `dark:` counterpart.
5. **Motion is meaningful** — use transitions only on interactive states (hover lift, slide-in panels).

---

## Theme Rules

### Tailwind dark mode
`darkMode: "class"` — the `.dark` class is added to `<html>` by the ThemeProvider.

### Palette mapping (always use both)

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-gray-50` | `dark:bg-slate-900` |
| Card / surface | `bg-white` | `dark:bg-slate-800` |
| Elevated card | `bg-white` | `dark:bg-slate-800` |
| Border | `border-gray-200` | `dark:border-slate-700` |
| Divider | `divide-gray-100` | `dark:divide-slate-700/60` |
| Heading text | `text-gray-900` | `dark:text-white` |
| Body text | `text-gray-700` | `dark:text-slate-300` |
| Muted text | `text-gray-500` | `dark:text-slate-400` |
| Very muted | `text-gray-400` | `dark:text-slate-500` |
| Primary accent | `text-primary-600` / `bg-primary-600` | `dark:text-primary-400` / `dark:bg-primary-500` |
| Hover surface | `hover:bg-gray-50` | `dark:hover:bg-slate-700/40` |
| Input bg | `bg-white` | `dark:bg-slate-800` |
| Sidebar | `bg-white` | `dark:bg-slate-900` |

### Sidebar footer text (near-invisible risk)
Use `dark:text-slate-500` (role name) and `dark:text-slate-600` (version) — never `slate-700` or darker.

---

## Button & Action Convention

### Rule: **Icon + Tooltip, not text labels, for row/card actions**

All CRUD action buttons (Edit, Delete, View, Add, Toggle) must be:
- **Icon-only** button
- Wrapped in `<Tooltip label="…">` with a clear description
- Use `<Tooltip>` from `@/components/ui`

```tsx
// ✅ Correct — icon with tooltip
<Tooltip label="Edit employee">
  <button className={iconBtn}>
    <Pencil className="w-4 h-4" />
  </button>
</Tooltip>

// ❌ Wrong — text button for a row action
<Button leftIcon={<Pencil />}>Edit Profile</Button>
```

**Exception**: Primary CTA buttons at page level (e.g. "Add Employee", form submit buttons, modal confirm buttons) keep their text label since they are the main call-to-action and need to be immediately obvious.

### Icon button base class (copy-paste)
```tsx
const iconBtn = "p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-150 active:scale-95";
const iconBtnDanger = "p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 active:scale-95";
```

---

## Component Inventory

All components exported from `@/components/ui`:

| Component | Use |
|---|---|
| `Button` | Primary, secondary, danger, ghost, outline CTAs |
| `Input` | Text inputs with optional left/right addons |
| `Select` | Dropdown selects |
| `Textarea` | Multi-line text |
| `Badge` | Status chips: success / warning / danger / info / secondary |
| `Card`, `CardHeader`, `CardTitle`, `CardDivider` | Content cards |
| `Pagination` | Table pagination — props: `{ page, pages, total, limit, onPageChange }` |
| `SidePanel` | Slide-in preview panel with `.Header`, `.Body`, `.Footer` sub-components |
| `Tooltip` | Icon button labels — props: `{ label, side?, children }` |
| `Modal` | Confirmation dialogs and forms |
| `FormField` | Label + error wrapper for form inputs |
| `Avatar` | Initials avatar — sizes: `xs`, `sm`, `md`, `lg`, `xl` |
| `Tabs` | Tab navigation |
| `Breadcrumb` | Page location trail |
| `BackButton` | Back navigation |
| `EmptyState` | Zero-state placeholder |
| `Skeleton`, `SkeletonTable`, `SkeletonCard` | Loading states |

---

## Reusable Hooks

| Hook | Use |
|---|---|
| `useTableControls<T>(data, opts)` | Client-side sort + pagination. Returns `{ rows, sort, toggleSort, page, totalPages, total, pageSize, setPage }` |
| `useEmployees(filters)` | Employee list with server-side pagination |
| `useEmployee(id)` | Single employee detail |
| `useDepartmentsConfig()` etc | Master data from `/masters/*` |

---

## Page Patterns

### List page with side-panel preview
1. Table row: full-width, clickable, highlights with `bg-primary-600` when selected.
2. Click → `<SidePanel>` slides in from right with record preview.
3. Side panel: hero section (avatar + name + badges), data sections, action chips.
4. Action chips in side panel use `ActionChip` pattern (icon + label text, with `Tooltip`).
5. Icon buttons in table rows use icon-only + `Tooltip` (no text).

### Settings / Config page
- 8 tabs (Departments, Designations, Skills, Qualifications, Certifications, BPV Config, Exp Types, Org Types).
- Each tab: `SortableHeader` (clickable columns with `↑`/`↓`/`↕` indicators) + `TableFooter` (pagination).
- Skills tab: expandable category accordion with skill tags (no separate flat table).

### Employee detail page
- Gradient hero header card.
- 6 tabs: Overview, Qualifications, Experience, Skills, Certifications, BPV History.
- All add/delete actions use icon buttons + `Tooltip`.

### Forms (new/edit)
- Full-page form card, not a modal.
- `FormField` wrapper on every input.
- Submit button: text label (primary CTA exception).

---

## File Locations

```
frontend/
  src/
    app/
      (auth)/login/          — Login page
      (dashboard)/
        layout.tsx           — Shell: sidebar + header + main (MUST have dark:bg-slate-900)
        dashboard/           — Dashboard
        employees/           — List, [id], [id]/edit, new
        settings/            — Config tabs
    components/
      ui/                    — All shared UI components
      layout/                — Sidebar, Header
      auth/                  — Can, RoleGuard
    hooks/
      useTableControls.ts    — Sort + pagination hook
      useConfig.ts           — Master data hooks
      employee/              — Employee-specific hooks
```

---

## Dark Mode Checklist (run mentally before committing any page)

- [ ] Page/layout wrapper has `dark:bg-slate-900`
- [ ] Every card has `dark:bg-slate-800`
- [ ] Every border has `dark:border-slate-700`
- [ ] Every heading has `dark:text-white`
- [ ] Every body text has `dark:text-slate-300`
- [ ] Every muted label has `dark:text-slate-400` or `dark:text-slate-500`
- [ ] Icon colours have `dark:text-slate-400` / `dark:text-slate-500`
- [ ] Hover states have `dark:hover:bg-slate-700/40`
- [ ] Inputs have `dark:bg-slate-800 dark:border-slate-600 dark:text-white`
- [ ] Dividers have `dark:divide-slate-700/60`
