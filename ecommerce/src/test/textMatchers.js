// Shared query helpers for the characterization test suite.
//
// Prices in this app are rendered as a literal "$" plus a separate JSX expression
// (and in one place "$ {expr}", with a stray space), so the visible string is split
// across sibling text nodes and RTL's plain getByText('$90') never matches. These
// helpers compare NORMALIZED textContent instead, and are deliberately tag-agnostic
// so they keep working through the planned <div> -> <button> conversions and the
// card redesign.
import { screen, within } from '@testing-library/react'

// Collapse all runs of whitespace so "$ 90" and "$\n  90" both read as "$90".
const normalize = (node) => (node?.textContent ?? '').replace(/\s+/g, '')

// True when this element's own text is the target AND no single child already
// accounts for all of it — i.e. reject the ancestors that merely contain the match.
const ownTextIs = (text) => (_content, element) => {
    if (!element) return false
    if (normalize(element) !== text) return false
    return !Array.from(element.children).some((child) => normalize(child) === text)
}

// Find the innermost element whose visible text is exactly `text` (whitespace
// ignored). Throws like any other getBy* when there is no match.
export function getByExactText(text) {
    return screen.getByText(ownTextIs(text))
}

// Same, scoped to a subtree — used to read a value out of one summary row rather
// than the whole page.
export function getByExactTextWithin(container, text) {
    return within(container).getByText(ownTextIs(text))
}
