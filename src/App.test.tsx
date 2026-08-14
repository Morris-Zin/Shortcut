import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App shell', () => {
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
})
