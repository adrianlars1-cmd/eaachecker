import lighthouse from 'lighthouse'
import { CDP_PORT } from './browserPool.js'

export async function runLighthouse(url) {
  const result = await lighthouse(url, {
    port: CDP_PORT,
    output: 'json',
    onlyCategories: ['accessibility', 'best-practices', 'seo'],
    logLevel: 'error',
  })
  return result.lhr
}
