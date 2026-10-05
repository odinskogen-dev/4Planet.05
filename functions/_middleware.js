const PUBLIC_HOSTS = {
  "4planet.org": {
    title: "4PLANET — For a Living Planet",
    description: "Living Planet Intelligence connecting understanding, credible action and proof for a living planet.",
    canonical: "https://4planet.org/",
  },
  "4planetatlas.com": {
    title: "4PLANET ATLAS — Explore the Living Planet",
    description: "Explore places, species, living systems and source-grounded planetary data through 4PLANET ATLAS.",
    canonical: "https://4planetatlas.com/",
    sitemap: ["/"],
  },
  "4brands.org": {
    title: "4BRANDS — Understand Any Company. Improve Your Own.",
    description: "4BRANDS is 4PLANET's Better Company product: source-grounded company understanding, opportunities and measurable improvement.",
    canonical: "https://4brands.org/",
    sitemap: ["/"],
  },
  "s4piens.com": {
    title: "S4PIENS — Human Systems Intelligence",
    description: "S4PIENS explores the human systems, value chains, incentives and infrastructure that shape people and the living planet.",
    canonical: "https://s4piens.com/",
    sitemap: ["/"],
  },
};

const PRIVATE_HOSTS = new Set([
  "labs.4planet.org",
  "id.4planet.org",
]);

function normaliseHost(hostname) {
  return hostname.toLowerCase().replace(/^www\./, "");
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapXml(host, paths) {
  const urls = paths.map((path) => `  <url><loc>${xmlEscape(`https://${host}${path}`)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robotsText(host, isPrivate = false) {
  if (isPrivate) return "User-agent: *\nDisallow: /\n";
  return [
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: Googlebot",
    "Allow: /",
    "",
    "User-agent: Bingbot",
    "Allow: /",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /checkout",
    "Disallow: /account",
    "Disallow: /admin",
    "Disallow: /saved",
    "",
    `Sitemap: https://${host}/sitemap.xml`,
    "",
  ].join("\n");
}

function withSecurityHeaders(response, privateSurface = false) {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  if (privateSurface) {
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    headers.set("Cache-Control", "no-store");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const rawHost = url.hostname.toLowerCase();
  const host = normaliseHost(rawHost);

  if (rawHost.startsWith("www.") && PUBLIC_HOSTS[host]) {
    url.hostname = host;
    return Response.redirect(url.toString(), 308);
  }

  const privateSurface =
    PRIVATE_HOSTS.has(host) ||
    host.endsWith(".pages.dev") ||
    host === "localhost" ||
    host.endsWith(".localhost");

  if (url.pathname === "/robots.txt" && privateSurface) {
    return new Response(robotsText(host, true), {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
    });
  }

  const config = PUBLIC_HOSTS[host];

  if (config && url.pathname === "/robots.txt" && host !== "4planet.org") {
    return new Response(robotsText(host), {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  if (config?.sitemap && url.pathname === "/sitemap.xml") {
    return new Response(sitemapXml(host, config.sitemap), {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  }

  const response = await context.next();

  if (privateSurface) return withSecurityHeaders(response, true);

  if (!config) return response;

  const headers = new Headers(response.headers);
  headers.delete("X-Robots-Tag");

  const contentType = headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/html")) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  // Preserve route-specific prerender metadata on 4planet.org. Only the root needs
  // a canonical fallback here. Standalone product hosts receive their own identity.
  if (host === "4planet.org" && url.pathname !== "/") {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const canonical = host === "4planet.org"
    ? `https://4planet.org${url.pathname === "/" ? "/" : url.pathname}`
    : config.canonical;

  let sawCanonical = false;
  const transformed = new HTMLRewriter()
    .on("title", {
      element(element) {
        element.setInnerContent(config.title);
      },
    })
    .on('meta[name="description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('meta[name="robots"]', {
      element(element) {
        element.setAttribute("content", "index,follow,max-image-preview:large");
      },
    })
    .on('meta[property="og:title"]', {
      element(element) {
        element.setAttribute("content", config.title);
      },
    })
    .on('meta[property="og:description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('meta[property="og:url"]', {
      element(element) {
        element.setAttribute("content", canonical);
      },
    })
    .on('meta[name="twitter:title"]', {
      element(element) {
        element.setAttribute("content", config.title);
      },
    })
    .on('meta[name="twitter:description"]', {
      element(element) {
        element.setAttribute("content", config.description);
      },
    })
    .on('link[rel="canonical"]', {
      element(element) {
        sawCanonical = true;
        element.setAttribute("href", canonical);
      },
    })
    .on("head", {
      element(element) {
        // Cloudflare HTMLRewriter invokes the head handler before descendants;
        // appending is safe even if a canonical exists because the canonical
        // handler above normalises every existing canonical to the same URL.
        if (!sawCanonical) {
          element.append(`<link rel="canonical" href="${canonical}">`, { html: true });
        }
      },
    })
    .transform(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }));

  return transformed;
}
