import SeriesClient from './SeriesClient'

export async function generateStaticParams() {
  return [{ slug: '_' }]
}

export default function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  return <SeriesClient params={params} />
}
