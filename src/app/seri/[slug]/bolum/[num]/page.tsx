import BolumClient from './BolumClient'

// Static export için zorunlu — runtime'da localStorage'dan gerçek veriler gelir
export async function generateStaticParams() {
  return [{ slug: '_', num: '0' }]
}

export default function BolumPage({ params }: { params: Promise<{ slug: string; num: string }> }) {
  return <BolumClient params={params} />
}
