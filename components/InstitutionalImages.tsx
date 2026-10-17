"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { archiveImages, archiveImageDisplayAllowed, museumArtifacts } from "@/packages/shared/archive";
import { imageInstitutionAdapters } from "@/packages/shared/image-pipeline";
import { Empty, Heading } from "./common";

const pageSize = 24;

export function InstitutionalImageArchive() {
  const [query, setQuery] = useState("");
  const [institution, setInstitution] = useState("");
  const [objectType, setObjectType] = useState("");
  const [page, setPage] = useState(0);
  const artifactById = useMemo(() => new Map(museumArtifacts.map((item) => [item.id, item])), []);
  const allowed = useMemo(() => archiveImages.filter(archiveImageDisplayAllowed), []);
  const objectTypes = useMemo(
    () => [...new Set(museumArtifacts.map((item) => item.objectType).filter((value): value is string => Boolean(value)))].sort(),
    [],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allowed.filter((image) => {
      const artifact = artifactById.get(image.artifactId);
      return (
        (!institution || image.institution.startsWith(institution)) &&
        (!objectType || artifact?.objectType === objectType) &&
        (!needle || `${image.title} ${image.caption} ${artifact?.culture ?? ""} ${artifact?.institution ?? ""}`.toLowerCase().includes(needle))
      );
    });
  }, [allowed, artifactById, institution, objectType, query]);
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <>
      <Heading eyebrow="Rights-reviewed open access" title="Images, Manuscripts & Objects" description="Explore institution-linked images as physical and visual evidence. Object identity and catalog facts remain separate from religious interpretation." />
      <div className="image-pipeline-stats">
        <div><strong>{allowed.length}</strong><span>verified images</span></div>
        <div><strong>{imageInstitutionAdapters.length}</strong><span>institutions</span></div>
        <div><strong>{objectTypes.length}</strong><span>object types</span></div>
      </div>
      <p className="notice">Every displayed image carries an institutional source, attribution, explicit CC0 status, and review record. Public-domain status does not override cultural restrictions; records are removed from display when a protocol blocks them.</p>
      <div className="filters image-archive-filters">
        <label>Search title, culture, or caption<input value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} /></label>
        <label>Institution<select aria-label="Institution" value={institution} onChange={(event) => { setInstitution(event.target.value); setPage(0); }}><option value="">All institutions</option>{imageInstitutionAdapters.map((item) => <option key={item.id} value={item.institution}>{item.institution}</option>)}</select></label>
        <label>Object type<select aria-label="Object type" value={objectType} onChange={(event) => { setObjectType(event.target.value); setPage(0); }}><option value="">All object types</option>{objectTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <p className="small muted">{filtered.length} matching images · page {page + 1} of {Math.max(1, Math.ceil(filtered.length / pageSize))}</p>
      {visible.length ? <div className="institutional-image-grid">{visible.map((image) => {
        const artifact = artifactById.get(image.artifactId);
        return <article className="institutional-image-card" key={image.id}>
          <Link href={`/artifacts/${image.artifactId}`} className="institutional-image-frame"><img src={image.thumbnail} alt={image.title} loading="lazy" /></Link>
          <div><span className="eyebrow">{artifact?.objectType ?? "Museum object"}</span><h2><Link href={`/artifacts/${image.artifactId}`}>{image.title}</Link></h2><p>{image.caption}</p><p className="small muted">{image.institution}<br />{image.rights}</p><a href={image.sourceUrl} target="_blank" rel="noreferrer">Institutional record <ExternalLink size={13} /></a></div>
        </article>;
      })}</div> : <Empty>No rights-cleared image matches these filters.</Empty>}
      <div className="pagination"><button className="button secondary" disabled={!page} onClick={() => setPage(page - 1)}>Previous</button><span>{filtered.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span><button className="button secondary" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></div>
    </>
  );
}
