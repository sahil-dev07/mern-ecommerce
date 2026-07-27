// Characterization tests for the shared Pagination control.
//
// Phase 5 converts every <div onClick> here into a real <button> and fixes the
// "Showing X to Y" arithmetic. These tests pin the CURRENT behaviour so that
// conversion is provably behaviour-preserving where it should be, and provably
// behaviour-changing only where intended.
//
// Everything is queried through the stable `nav[aria-label="Pagination"]` landmark
// and by visible text — never by tag — so the queries survive div -> button.
import { render, screen, fireEvent, within } from '@testing-library/react'
import Pagination from './Pagination'

// 100 items at ITEMS_PER_PAGE=9 -> 12 pages (Math.ceil(100/9)).
const TOTAL_ITEMS = 100
const TOTAL_PAGES = 12

function renderPagination(page = 1) {
    const handlePage = vi.fn()
    const setPage = vi.fn()
    render(
        <Pagination
            page={page}
            setPage={setPage}
            handlePage={handlePage}
            totalItems={TOTAL_ITEMS}
        />
    )
    return { handlePage, setPage, nav: screen.getByRole('navigation', { name: 'Pagination' }) }
}

describe('Pagination', () => {
    it('renders one control per page', () => {
        const { nav } = renderPagination(1)
        for (let n = 1; n <= TOTAL_PAGES; n++) {
            expect(within(nav).getByText(String(n))).toBeInTheDocument()
        }
    })

    it('asks the parent for the clicked page', () => {
        const { handlePage, nav } = renderPagination(1)
        fireEvent.click(within(nav).getByText('3'))
        expect(handlePage).toHaveBeenCalledWith(3)
    })

    it('does not page backwards from page 1', () => {
        // Today the guard is `if (page > 1)` inside the handler rather than a
        // `disabled` attribute (it is a <div>, which cannot be disabled). Phase 5
        // adds the real attribute; this behavioural assertion holds either way.
        const { handlePage, nav } = renderPagination(1)
        fireEvent.click(within(nav).getByText('Previous'))
        expect(handlePage).not.toHaveBeenCalled()
    })

    it('does not page forwards from the last page', () => {
        const { handlePage, nav } = renderPagination(TOTAL_PAGES)
        fireEvent.click(within(nav).getByText('Next'))
        expect(handlePage).not.toHaveBeenCalled()
    })

    it('pages forwards from a middle page', () => {
        const { handlePage, nav } = renderPagination(2)
        fireEvent.click(within(nav).getByText('Next'))
        expect(handlePage).toHaveBeenCalledWith(3)
    })

    // --- Two known bugs, pinned so Phase 5 has to change them deliberately ---

    it('CURRENT BUG: prints "Showing 10 to 9 of 100" on page 2', () => {
        // Pagination.jsx:27 is
        //   page * ITEMS_PER_PAGE > totalItems ? page * totalItems : ITEMS_PER_PAGE
        // so the upper bound collapses to ITEMS_PER_PAGE (9) instead of 18, and the
        // range reads backwards. Phase 5 rewrites this to
        //   Math.min(page * ITEMS_PER_PAGE, totalItems)  -> "Showing 10 to 18 of 100".
        renderPagination(2)
        const summary = screen.getByText(/Showing/).textContent.replace(/\s+/g, ' ').trim()
        expect(summary).toBe('Showing 10 to 9 of 100 results')
    })

    it('CURRENT BUG: marks every page aria-current, not just the active one', () => {
        // Pagination.jsx:50 hardcodes aria-current="page" on all of them, so a screen
        // reader announces all 12 as current. Phase 5 makes it conditional; after that
        // this count must be exactly 1.
        const { nav } = renderPagination(2)
        expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(TOTAL_PAGES)
    })
})
