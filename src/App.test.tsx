import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { sampleState } from './application/sampleData'
import App from './App.tsx'

const market = sampleState.shops[0]!.name
const grocer = sampleState.shops[1]!.name

describe('App shell', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('renders the BasketSplit setup workflow', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /basketsplit home/i })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /when a second shop is worth/i }),
    ).toBeTruthy()
    expect(screen.getByRole('heading', { name: /where could you shop/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /build your basket/i })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /your cheapest plan/i })).toBeTruthy()
  })

  it('updates the recommendation when the extra-stop cost changes', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))

    expect(screen.getByText(`Shop at ${market}`)).toBeTruthy()
    expect(screen.getAllByText('RM 50.20').length).toBeGreaterThan(0)

    fireEvent.change(
      screen.getByRole('textbox', { name: /cost of one extra stop/i }),
      { target: { value: '0.00' } },
    )

    expect(screen.getByText(`Split between ${market} and ${grocer}`)).toBeTruthy()
    expect(screen.getByText(/you save RM 1\.60 overall/i)).toBeTruthy()
  })

  it('restores the basket after the app is reopened', () => {
    const firstVisit = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getByText(`Shop at ${market}`)).toBeTruthy()

    firstVisit.unmount()
    render(<App />)

    expect(screen.getByDisplayValue(market)).toBeTruthy()
    expect(screen.getByText(`Shop at ${market}`)).toBeTruthy()
  })
})
