import AxeBuilder from '@axe-core/playwright'

export async function runAxe(page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  return results
}
