import Atlas from "@/components/Atlas";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug = [] } = await params;
  const search = await searchParams;
  return (
    <Atlas
      key={slug.join("/") + JSON.stringify(search)}
      route={slug[0] ?? "home"}
      id={slug[1]}
      initialQuery={typeof search.q === "string" ? search.q : ""}
      initialText={typeof search.text === "string" ? search.text : ""}
    />
  );
}
