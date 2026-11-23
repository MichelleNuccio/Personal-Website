(() => {
  const allowedElements = new Set([
    "A", "BLOCKQUOTE", "BR", "CAPTION", "CODE", "DEL", "DIV", "EM", "H1", "H2", "H3",
    "H4", "H5", "H6", "HR", "IMG", "LI", "OL", "P", "PRE", "SPAN", "STRONG", "SUB",
    "SUP", "TABLE", "TBODY", "TD", "TH", "THEAD", "TR", "U", "UL"
  ]);

  function projectContent(html, videoSource, linkedVideos, videoAfterCredits) {
    const template = document.createElement("template");
    template.innerHTML = html;
    template.content.querySelectorAll("*").forEach((element) => {
      if (!allowedElements.has(element.tagName)) {
        element.remove();
        return;
      }
      for (const { name, value } of Array.from(element.attributes)) {
        const link = element.tagName === "A" && name === "href" && /^(https?:\/\/|mailto:)/i.test(value);
        const image = element.tagName === "IMG" && name === "src"
          && /^data:image\/(png|jpeg|gif|webp);base64,/i.test(value);
        if (!link && !image && !["alt", "colspan", "rowspan", "start"].includes(name)) {
          element.removeAttribute(name);
        }
      }
    });
    const paragraphs = Array.from(template.content.querySelectorAll("p"));
    const collaboration = paragraphs.find(
      paragraph => /\bin collaboration with\b.*\bMolteni\s*\]\s*$/is.test(paragraph.textContent.trim())
    );
    if (videoSource) {
      const title = paragraphs.find(paragraph => /^@\s*maru\./i.test(paragraph.textContent.trim()));
      const videoPoster = template.content.querySelector('img[alt^="movie::"]')
        || title?.querySelector("img");
      const video = createVideo(videoSource, videoPoster);
      videoPoster?.remove();
      const description = paragraphs.find(
        paragraph => /^Immanuel\b/i.test(paragraph.textContent.trim())
      );
      if (description) description.before(video);
      else if (collaboration) collaboration.after(video);
      else template.content.appendChild(video);
    }
    linkedVideos.forEach(([name, asset], index) => {
      const poster = template.content.querySelector(`img[alt="cv-video-${index}"]`);
      if (!poster) return;

      const video = typeof asset === "string"
        ? createVideo(asset, poster)
        : createVideo(asset.src);
      const placement = typeof asset === "string" ? null : asset.afterParagraph;
      if (typeof asset !== "string" && asset.poster) video.poster = asset.poster;
      const anchor = placement
        ? paragraphs.find(paragraph => paragraph.textContent.trim().toLowerCase() === placement.toLowerCase())
        : name === videoAfterCredits ? collaboration : null;
      if (anchor) {
        const originalParagraph = poster.closest("p");
        poster.remove();
        if (originalParagraph && !originalParagraph.textContent.trim() && !originalParagraph.querySelector("img, video")) {
          originalParagraph.remove();
        }
        anchor.after(video);
      } else {
        poster.replaceWith(video);
      }
    });
    return template.content;
  }

  function createVideo(src, poster) {
    const video = document.createElement("video");
    video.controls = true;
    video.loop = true;
    video.autoplay = true;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "none";
    video.src = src;
    video.setAttribute("aria-label", "Project video");
    if (poster) video.poster = poster.getAttribute("src") || "";
    return video;
  }

  async function labelVideoPosters(arrayBuffer, linkedVideos) {
    const archive = await window.JSZip.loadAsync(arrayBuffer);
    const mainDocument = archive.file("word/document.xml");
    if (!mainDocument) return arrayBuffer;

    const xml = await mainDocument.async("string");
    const videoIds = new Map();
    for (const [properties] of xml.matchAll(/<pic:cNvPr\b[^>]+>/g)) {
      const moviePath = /\bdescr="movie::([^"]+)"/.exec(properties)?.[1];
      const id = /\bid="([^"]+)"/.exec(properties)?.[1];
      const fileName = moviePath?.split(/[\\/]/).pop();
      const index = linkedVideos.findIndex(([name]) => name === fileName);
      if (id && index >= 0) videoIds.set(id, index);
    }
    if (!videoIds.size) return arrayBuffer;

    const labeled = xml.replace(/<wp:docPr\b[^>]+>/g, (properties) => {
      const id = /\bid="([^"]+)"/.exec(properties)?.[1];
      if (!videoIds.has(id)) return properties;
      const label = ` descr="cv-video-${videoIds.get(id)}"`;
      return properties.replace(/\s+descr="[^"]*"/, "").replace(/(\/?>)$/, `${label}$1`);
    });
    archive.file("word/document.xml", labeled, { createFolders: false });
    return archive.generateAsync({ type: "arraybuffer" });
  }

  async function convertProject(arrayBuffer) {
    const options = { includeEmbeddedStyleMap: false };
    try {
      return await window.mammoth.convertToHtml({ arrayBuffer }, options);
    } catch (error) {
      const archive = await window.JSZip.loadAsync(arrayBuffer);
      const document = archive.file("word/document.xml");
      const relationships = archive.file("word/_rels/document.xml.rels");
      if (!document || !relationships) throw error;

      const [xml, links] = await Promise.all([document.async("string"), relationships.async("string")]);
      const embeddedIds = new Set(Array.from(xml.matchAll(/\br:embed="([^"]+)"/g), match => match[1]));
      const imageLinks = Array.from(links.matchAll(/<Relationship\b[^>]+>/g), ([entry]) => ({
        id: /\bId="([^"]+)"/.exec(entry)?.[1],
        target: /\bTarget="(media\/[^"]+)"/.exec(entry)?.[1]
      })).filter(({ id, target }) => id && target && archive.file(`word/${target}`));
      const missing = [...embeddedIds].filter(id => !imageLinks.some(link => link.id === id));
      const unreferenced = imageLinks.filter(link => !embeddedIds.has(link.id));
      if (missing.length !== 1 || unreferenced.length !== 1) throw error;

      const repaired = xml.replace(/\br:embed="([^"]+)"/g, (match, id) =>
        id === missing[0] ? `r:embed="${unreferenced[0].id}"` : match
      );
      archive.file("word/document.xml", repaired, { createFolders: false });
      const normalized = await archive.generateAsync({ type: "arraybuffer" });
      return window.mammoth.convertToHtml({ arrayBuffer: normalized }, options);
    }
  }

  document.querySelectorAll(".project-document[data-document]").forEach((preview) => {
    const linkedVideos = Object.entries(JSON.parse(preview.dataset.videos || "{}"));
    let lastDocument;
    let rendered = false;
    let loading = false;

    async function refreshProject() {
      if (loading) return;
      loading = true;
      try {
        if (location.protocol === "file:") {
          throw new Error("Open the CV through Live Server to load the Word document.");
        }
        if (!window.mammoth) {
          throw new Error("The local Word converter did not load.");
        }
        const response = await fetch(preview.dataset.document, { cache: "no-store" });
        if (!response.ok) throw new Error(`The Word file returned HTTP ${response.status}.`);

        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        if (bytes.length === lastDocument?.length && bytes.every((byte, index) => byte === lastDocument[index])) {
          return;
        }

        const normalized = linkedVideos.length ? await labelVideoPosters(arrayBuffer, linkedVideos) : arrayBuffer;
        const { value } = await convertProject(normalized);
        const scrollTop = preview.scrollTop;
        preview.replaceChildren(projectContent(value, preview.dataset.video, linkedVideos, preview.dataset.videoAfterCredits));
        preview.scrollTop = scrollTop;
        lastDocument = bytes;
        rendered = true;
      } catch (error) {
        if (!rendered) preview.textContent = `The project document could not be loaded. ${error.message}`;
        console.warn("Unable to preview " + preview.dataset.document, error);
      } finally {
        loading = false;
      }
    }

    refreshProject();
    if (["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname)) {
      window.setInterval(() => {
        if (!document.hidden) refreshProject();
      }, 2000);
      window.addEventListener("focus", refreshProject);
    }
  });
})();
