import React from 'react'
import { ShoppingBagIcon } from '@heroicons/react/24/outline'

// The Kartly wordmark: a shopping-bag glyph plus the name, drawn inline rather
// than loaded as an image.
//
// Replaces the four <img src="/logo192.png"> sites (Navbar and the three auth
// screens). None of them had an onError fallback, so a dead logo URL rendered a
// broken-image icon at the top of every page — the exact failure that has already
// hit this app's product images twice. Inline SVG removes the failure mode
// completely: no request, nothing to 404, and it stays sharp at any size.
//
// Colour: the glyph is pinned to brand-500 so the mark reads the same everywhere,
// while the wordmark inherits `currentColor`. That is what lets one component sit
// on the dark navbar (white text) and on the light auth card (dark text) with no
// variant prop — the caller just sets a text-* utility.
//
// Sizing: height comes from the caller (e.g. `h-8`); the glyph is h-full w-auto so
// it tracks that height and the text scales independently.
//
// The root is `flex w-fit`, NOT inline-flex, and that matters: the <img> this
// replaces was block-level (Tailwind's preflight sets `img { display: block }`),
// which is the only reason `mx-auto` centred it on the three auth screens. An
// inline-level root would make those auto margins compute to 0 and silently
// left-align the logo. `w-fit` keeps the box shrink-wrapped so it still sits
// inside the navbar's <Link> without stretching.
export default function Logo({ className = '' }) {
    return (
        <span className={`flex w-fit items-center gap-2 ${className}`}>
            <ShoppingBagIcon className="h-full w-auto text-brand-500" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight">Kartly</span>
        </span>
    )
}
