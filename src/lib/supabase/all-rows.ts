/** Supabase returns at most 1,000 rows per request, whatever .limit() asks for.
 *  This reads a list in pages of 1,000 until it has every row. The query must have a stable
 *  order (for example by name, then id), or rows could repeat or be skipped between pages. */
type Page<T> = (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>

export async function allRows<T>(page: Page<T>, max = 50000): Promise<{ data: T[]; error: { message: string } | null }> {
  const SIZE = 1000
  const out: T[] = []
  for (let from = 0; from < max; from += SIZE) {
    const { data, error } = await page(from, from + SIZE - 1)
    if (error) return { data: out, error }
    out.push(...(data ?? []))
    if (!data || data.length < SIZE) break
  }
  return { data: out, error: null }
}
