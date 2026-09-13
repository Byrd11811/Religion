"use client";
import { useEffect, useState } from "react";
import { readManifest } from "@/packages/shared/iiif";
export function IIIFViewer({ artifactId }: { artifactId: string }) {
  const [manifest, setManifest] = useState<ReturnType<
      typeof readManifest
    > | null>(null),
    [page, setPage] = useState(0),
    [zoom, setZoom] = useState(1),
    [loaded, setLoaded] = useState(""),
    [failed, setFailed] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    fetch(`/api/iiif/${encodeURIComponent(artifactId)}`, {
      signal: abort.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Manifest unavailable");
        return readManifest(await r.json());
      })
      .then((m) => {
        setManifest(m);
        setPage(0);
        setZoom(1);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [artifactId]);
  if (error) return <p role="alert">{error}</p>;
  if (!manifest) return <p role="status">Loading image viewer…</p>;
  const selected = manifest.pages[page];
  if (!selected) return <p>No verified images available.</p>;
  return (
    <section className="panel">
      <span className="eyebrow">IIIF image viewer</span>
      <h2>{manifest.title}</h2>
      <p className="small muted">
        Atlas presentation of museum images. Sequence numbers are not original
        pages or spell numbers.
      </p>
      <div className="filters">
        <button
          className="button secondary"
          disabled={!page}
          onClick={() => {
            setPage(page - 1);
            setZoom(1);
          }}
        >
          Previous image
        </button>
        <label>
          Image
          <select
            aria-label="Image"
            value={page}
            onChange={(e) => {
              setPage(Number(e.target.value));
              setZoom(1);
            }}
          >
            {manifest.pages.map((p, i) => (
              <option key={p.id} value={i}>
                Image {i + 1} of {manifest.pages.length}
              </option>
            ))}
          </select>
        </label>
        <button
          className="button secondary"
          disabled={page + 1 >= manifest.pages.length}
          onClick={() => {
            setPage(page + 1);
            setZoom(1);
          }}
        >
          Next image
        </button>
        <label>
          Zoom
          <input
            aria-label="Image zoom"
            type="range"
            min="1"
            max="4"
            step="0.25"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </label>
      </div>
      <div
        style={{
          overflow: "auto",
          maxHeight: "70vh",
          minHeight: 240,
          width: "100%",
          background: "#e9e3d6",
        }}
      >
        <img
          data-testid="iiif-image"
          onLoad={() => setLoaded(selected.imageUrl)}
          onError={() => setFailed(selected.imageUrl)}
          src={selected.imageUrl}
          alt={selected.label}
          style={{
            width: `${zoom * 100}%`,
            maxWidth: "none",
            height: "auto",
            display: "block",
          }}
        />
      </div>
      {failed === selected.imageUrl ? (
        <p role="alert">
          The museum image could not load.{" "}
          <a href={selected.imageUrl} target="_blank" rel="noreferrer">
            Open the source image ↗
          </a>
        </p>
      ) : loaded !== selected.imageUrl ? (
        <p role="status">Loading museum image…</p>
      ) : null}
      <p>
        <a
          href={`/api/iiif/${encodeURIComponent(artifactId)}`}
          target="_blank"
          rel="noreferrer"
        >
          IIIF Presentation 3 manifest ↗
        </a>{" "}
        ·{" "}
        <a href={manifest.rights} target="_blank" rel="noreferrer">
          Image rights
        </a>
      </p>
    </section>
  );
}
