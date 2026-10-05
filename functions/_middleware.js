const PUBLIC_HOSTS = {
  "4planet.org": {
    title: "4PLANET — For a Living Planet",
    description: "Living Planet Intelligence connecting understanding, credible action and proof for a living planet.",
    canonical: "https://4planet.org/",
    fallbackTitle: "4PLANET — For a Living Planet",
    fallbackText: "Living Planet Intelligence connecting places, species, living systems, missions and credible ecological action.",
    fallbackLinks: [
      ["Impact", "https://4planet.org/impact"],
      ["Places", "https://4planet.org/places"],
      ["Missions", "https://4planet.org/missions"],
      ["ATLAS", "https://4planetatlas.com/"],
      ["SPECIES", "https://4species.com/species/"],
    ],
    schemaType: "WebSite",
  },
  "4planetatlas.com": {
    title: "4PLANET ATLAS — Explore the Living Planet",
    description: "Explore places, species, living systems and source-grounded planetary data through 4PLANET ATLAS.",
    canonical: "https://4planetatlas.com/",
    fallbackTitle: "Explore the Living Planet with 4PLANET ATLAS",
    fallbackText: "ATLAS is a public exploration surface connecting places, species and living systems with source-grounded planetary context.",
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["SPECIES", "https://4species.com/species/"],
      ["Living Systems", "https://4planet.org/living-systems"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
  "4brands.org": {
    title: "4BRANDS — Understand Any Company. Improve Your Own.",
    description: "4BRANDS is the Better Company product from 4PLANET: source-grounded company understanding, opportunities and measurable improvement.",
    canonical: "https://4brands.org/",
    fallbackTitle: "Understand Any Company. Improve Your Own.",
    fallbackText: "4BRANDS is the Better Company product: a source-grounded public experience for understanding companies, value and practical improvement.",
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["Impact", "https://4planet.org/impact"],
      ["ATLAS", "https://4planetatlas.com/"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
  "s4piens.com": {
    title: "S4PIENS — Human Systems Intelligence",
    description: "S4PIENS explores the human systems, value chains, incentives and infrastructure that shape people and the living planet.",
    canonical: "https://s4piens.com/",
    fallbackTitle: "S4PIENS — Human Systems Intelligence",
    fallbackText: "S4PIENS explores value chains, incentives, infrastructure and other human systems that shape people and the living planet.",
    fallbackLinks: [
      ["4PLANET", "https://4planet.org/"],
      ["4SAPIEN", "https://4sapien.com/"],
      ["ATLAS", "https://4planetatlas.com/"],
    ],
    schemaType: "WebApplication",
    sitemap: ["/"],
  },
};


const FOURPLANET_ROUTES = {
  "/about": {
    title: "About 4PLANET — Living Planet Intelligence",
    description: "What 4PLANET is building, why it exists and how its public products connect understanding, action, proof and learning.",
    fallbackTitle: "About 4PLANET",
    fallbackParagraphs: [
      "4PLANET is an early-stage environmental technology initiative building Living Planet Intelligence: connected public tools that help people understand the living world, see what is changing and find credible ways to act.",
      "The ecosystem connects source-grounded knowledge, places, species, living systems and human systems across products such as ATLAS, SPECIES, 4SAPIEN, 4BRANDS, 4NATION, MAGAZINE and Impact. The products are at different stages of development, and public prototypes are labelled as such rather than presented as finished systems.",
      "The underlying direction is simple: better understanding should support better decisions; better decisions should make useful action easier; and action should be connected to evidence so the system can learn without confusing contribution with proven ecological outcome."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["MAGAZINE","https://4planetmagazine.com/magazine/"]],
    schemaType: "AboutPage",
  },
  "/impact": {
    title: "4PLANET Impact — From Understanding to Credible Action",
    description: "4PLANET Impact is an early public platform direction for connecting people and companies with credible expert-led action and proof.",
    fallbackTitle: "4PLANET Impact",
    fallbackParagraphs: [
      "Impact is the action layer of 4PLANET. The goal is to make it easier for people and companies to discover credible work for nature, understand what a contribution supports and follow the evidence that comes back from the organisations doing the work.",
      "4PLANET is not trying to replace field organisations. The intended model is to help expert organisations reach more supporters, connect funding to understandable actions and present delivery evidence with clear boundaries between contribution, work completed and independently supported ecological outcomes.",
      "This is an early public platform direction. Partner candidates are not presented as partners until an agreement exists, and no contribution is described as a verified ecological outcome unless the available evidence supports that claim."
    ],
    fallbackLinks: [["4PLANET","https://4planet.org/"],["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Partners","https://4planet.org/partners"]],
    schemaType: "WebPage",
  },
  "/missions": {
    title: "4PLANET Missions — Connected Work for a Living Planet",
    description: "Explore 4PLANET mission areas across ocean, land, human systems and culture, connected through shared living-planet intelligence.",
    fallbackTitle: "4PLANET Missions",
    fallbackParagraphs: [
      "4PLANET Missions organise work around major parts of the living planet and the human systems that affect them. The mission structure creates clear public entry points while shared infrastructure connects data, places, species, evidence and action across the ecosystem.",
      "The mission names are OCE4N_, E4RTH_, S4PIENS_ and 4CULTURE_. They are separate public worlds with shared infrastructure rather than isolated projects. Their role is to make complex planetary challenges understandable and connect them to practical products, actors, solutions and evidence.",
      "Mission pages are developed progressively. Public prototypes may expose only part of the intended system, and missing evidence or unfinished capabilities should remain visible rather than being filled with unsupported claims."
    ],
    fallbackLinks: [["Living Systems","https://4planet.org/living-systems"],["ATLAS","https://4planetatlas.com/"],["Impact","https://4planet.org/impact"],["MAGAZINE","https://4planetmagazine.com/magazine/"]],
    schemaType: "CollectionPage",
  },
  "/living-systems": {
    title: "Living Systems — 4PLANET",
    description: "Explore living systems as connected places, species, ecological relationships, pressures and human systems through 4PLANET.",
    fallbackTitle: "Living Systems",
    fallbackParagraphs: [
      "Living systems are a core public lens in 4PLANET. They connect species, places, ecological relationships, pressures and relevant human systems so a user can understand more than a single isolated fact.",
      "The aim is not to reduce nature to one score. Each public surface should preserve sources, uncertainty and the distinction between observation, interpretation and verified outcome. ATLAS provides the spatial lens, SPECIES provides species-level journeys and NATUREBRAIN provides the shared source-grounded intelligence underneath them.",
      "As the system grows, living-system pages are intended to connect understanding with credible actions and evidence without overstating what is known."
    ],
    fallbackLinks: [["ATLAS","https://4planetatlas.com/"],["SPECIES","https://4species.com/species/"],["Places","https://4planet.org/places"],["Impact","https://4planet.org/impact"]],
    schemaType: "CollectionPage",
  },
  "/partners": {
    title: "Partners — 4PLANET",
    description: "How 4PLANET approaches collaboration with expert organisations, technology partners and others contributing to a living planet.",
    fallbackTitle: "Working with 4PLANET",
    fallbackParagraphs: [
      "4PLANET is designed to work with organisations that already have real expertise, field capability, data, technology or distribution. The objective is not to duplicate good work but to make credible work easier to understand, discover, fund and learn from.",
      "Potential collaborations can range from expert field delivery and evidence to technology, science, distribution and mission support. A public mention of an organisation does not by itself mean a formal partnership; 4PLANET distinguishes research, candidate relationships, active pilots and confirmed partnerships.",
      "Where collaboration involves environmental action, the preferred model is transparent about who receives funding, who performs the work, what evidence is available and what can or cannot be claimed as an outcome."
    ],
    fallbackLinks: [["Impact","https://4planet.org/impact"],["About","https://4planet.org/about"],["Funders","https://4planet.org/funders"]],
    schemaType: "WebPage",
  },
  "/funders": {
    title: "Funding 4PLANET — Building Public-Interest Planetary Infrastructure",
    description: "Explore how funding can support 4PLANET public-interest technology, evidence infrastructure, products and credible ecological action.",
    fallbackTitle: "Funding 4PLANET",
    fallbackParagraphs: [
      "4PLANET is building public-interest technology and products around living-planet intelligence, decision support and credible ecological action. Funding can support the infrastructure, research, product development and field-connected work required to make those systems useful.",
      "Different forms of capital have different roles. Grants and mission-aligned support can help build shared public capability; sponsors can support defined missions or public experiences; commercial products can create recurring revenue; and later investment may support scalable technology where the evidence and economics justify it.",
      "4PLANET does not treat funding itself as impact. Capital is an input. Delivery, evidence and ecological outcomes remain separate states and should be reported separately."
    ],
    fallbackLinks: [["About","https://4planet.org/about"],["Impact","https://4planet.org/impact"],["Partners","https://4planet.org/partners"]],
    schemaType: "WebPage",
  },
};

const PRIVATE_HOSTS = new Set([
  "labs.4planet.org",
  "os.4planet.org",
  "test.4planet.org",
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function discoveryFallback(config) {
  const links = (config.fallbackLinks || [])
    .map(([label, href]) => `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`)
    .join("");
  const paragraphs = (config.fallbackParagraphs || [config.fallbackText || config.description])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  return `<main data-public-discovery-fallback="1" aria-label="Public discovery summary"><h1>${escapeHtml(config.fallbackTitle || config.title)}</h1>${paragraphs}<nav aria-label="Related 4PLANET public surfaces"><ul>${links}</ul></nav></main>`;
}

function structuredData(config, canonical) {
  const data = {
    "@context": "https://schema.org",
    "@type": config.schemaType || "WebSite",
    name: config.title,
    url: canonical,
    description: config.description,
  };
  if (config.schemaType === "WebApplication") {
    data.isPartOf = {
      "@type": "WebSite",
      name: "4PLANET",
      url: "https://4planet.org/",
    };
  }
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll("<", "\\u003c")}</script>`;
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

  const baseConfig = PUBLIC_HOSTS[host];
  const routeConfig = host === "4planet.org" ? FOURPLANET_ROUTES[url.pathname.replace(/\/$/, "") || "/"] : null;
  const config = routeConfig ? { ...baseConfig, ...routeConfig, canonical: `https://4planet.org${url.pathname.replace(/\/$/, "") || "/"}` } : baseConfig;

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

  // Existing prerendered discovery routes keep their own metadata. Named public
  // organisation routes and standalone product homes are normalised below.
  if (host === "4planet.org" && url.pathname !== "/" && !routeConfig) {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const canonical = config.canonical || (host === "4planet.org"
    ? `https://4planet.org${url.pathname === "/" ? "/" : url.pathname}`
    : `https://${host}/`);

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
        element.remove();
      },
    })
    .on("head", {
      element(element) {
        element.append(`<link rel="canonical" href="${canonical}">`, { html: true });
        element.append(structuredData(config, canonical), { html: true });
      },
    })
    .on("#root", {
      element(element) {
        element.setInnerContent(discoveryFallback(config), { html: true });
      },
    })
    .transform(new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }));

  return transformed;
}
