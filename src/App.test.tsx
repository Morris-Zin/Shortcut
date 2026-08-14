import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'

describe('App shell', () => {
  it('renders the product name and empty-stage copy', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: /shortcut/i })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: /ready when you are/i }),
    ).toBeTruthy()
  })
})
