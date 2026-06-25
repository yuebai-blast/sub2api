/** 把图片文件压缩到 ≤maxBytes（缩放×质量双重降档），返回 WebP data URL */
export async function compressToDataUrl(file: File, maxBytes = 20480): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = dataUrl
  })
  const scales = [1, 0.92, 0.84, 0.72, 0.6, 0.5, 0.4]
  const qualities = [0.92, 0.84, 0.72, 0.6, 0.5, 0.4]
  for (const sc of scales) {
    const cv = document.createElement('canvas')
    cv.width = Math.max(1, Math.round(img.width * sc))
    cv.height = Math.max(1, Math.round(img.height * sc))
    cv.getContext('2d')!.drawImage(img, 0, 0, cv.width, cv.height)
    for (const q of qualities) {
      const out = cv.toDataURL('image/webp', q)
      // base64 长度 ≈ 字节×4/3
      if (out.length * 0.75 <= maxBytes) return out
    }
  }
  throw new Error('图片过大，请换一张更小的图片')
}
