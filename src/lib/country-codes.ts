/** Country list and flags, built in the browser (Intl), shared by the quiz and the article form. */
export const flag = (code: string) => (/^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '🌍')

export function countries() {
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  const out: { code: string; name: string }[] = []
  for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) {
    const code = String.fromCharCode(a, b)
    if (['EU', 'EZ', 'UN', 'ZZ', 'QO', 'XA', 'XB', 'AA'].includes(code)) continue
    let n: string | undefined
    try { n = names.of(code) } catch { n = undefined }
    if (n && n !== code && !/unknown/i.test(n)) out.push({ code, name: n })
  }
  return out.sort((x, y) => x.name.localeCompare(y.name))
}

export const countryName = (code: string) => { try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code } catch { return code } }
