interface PublicSeoOptions {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}

export function usePublicSeo(options: PublicSeoOptions) {
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const canonical = `${siteUrl}${options.path.startsWith('/') ? options.path : `/${options.path}`}`
  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: options.type ?? 'website',
    ogUrl: canonical,
    ogSiteName: 'WorkFlow',
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
  })
  useHead({ link: [{ rel: 'canonical', href: canonical }] })
}
