// ProductGrid characterization — the storefront card.
//
// Phase 6 redesigns this card and routes every price through formatCurrency, and
// Phase 4 changes what "loading" renders. The out-of-stock and soft-delete
// branches (ProductGrid.jsx:56-64) are the ONLY signals of either state anywhere
// in the storefront and are easy to drop during a redesign, so they are locked here.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getByExactText } from '../../../test/textMatchers'
import ProductGrid from './ProductGrid'

const product = (over = {}) => ({
    id: 'p1',
    title: 'Test Product',
    thumbnail: 'https://example.com/t.jpg',
    images: ['https://example.com/1.jpg'],
    price: 100,
    discountPercentage: 10, // -> discountedPrice 90
    rating: 4.5,
    stock: 25,
    ...over,
})

function renderGrid(products, status = 'idle') {
    return render(
        <MemoryRouter>
            <ProductGrid products={products} status={status} />
        </MemoryRouter>
    )
}

describe('ProductGrid', () => {
    it('renders the title, the discounted price and the struck-through list price', () => {
        renderGrid([product()])
        expect(screen.getByText('Test Product')).toBeInTheDocument()
        // Phase 6 swaps these for formatCurrency output ("$90.00"); this is the
        // before-picture that makes that change visible.
        expect(getByExactText('$90')).toBeInTheDocument()
        expect(getByExactText('$100')).toBeInTheDocument()
    })

    it('links each card to its product detail page', () => {
        renderGrid([product()])
        expect(screen.getByRole('link', { name: /Test Product/ })).toHaveAttribute(
            'href',
            '/product-detail/p1'
        )
    })

    it('flags an out-of-stock product', () => {
        renderGrid([product({ stock: 0 })])
        expect(screen.getByText('Out Of stock')).toBeInTheDocument()
    })

    it('flags a soft-deleted product', () => {
        renderGrid([product({ deleted: true })])
        expect(screen.getByText('Product deleted')).toBeInTheDocument()
    })

    it('shows neither flag for a normal in-stock product', () => {
        renderGrid([product()])
        expect(screen.queryByText('Out Of stock')).not.toBeInTheDocument()
        expect(screen.queryByText('Product deleted')).not.toBeInTheDocument()
    })

    it('renders an empty grid without throwing', () => {
        expect(() => renderGrid([])).not.toThrow()
    })

    // CURRENT BEHAVIOUR — the Phase 4 target.
    // The loader is a flow sibling ABOVE the grid, so stale cards stay on screen and
    // get pushed down ~120px on every filter change. Phase 4 makes the skeleton
    // REPLACE the content; when it does, this expectation must be inverted.
    it('CURRENT BEHAVIOUR: keeps rendering stale cards while status is loading', () => {
        renderGrid([product()], 'loading')
        expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
})
