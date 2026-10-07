import { test, expect } from "@playwright/test";

const foodEnvelope = {
  source: { id: "open_food_facts", apiVersion: "2", schemaVersion: 1, licence: "ODbL" },
  request: { barcode: "7038010055652" },
  retrievedAt: "2026-09-28T00:00:00Z",
  product: {
    kind: "found",
    endpoint: "https://world.openfoodfacts.org/api/v2/product/7038010055652.json",
    raw: {
      code: "7038010055652",
      product_name: "Havregryn test product",
      brands: "Test Brand",
      quantity: "500 g",
      ingredients_text: "100% oats",
      allergens_tags: [],
      traces_tags: [],
      categories_tags: ["en:breakfast-cereals", "en:oat-flakes"],
      countries_tags: ["en:norway"],
      tags_sources: ["openfoodfacts"],
      rev: 7,
      last_modified_t: 1790550000,
      nutriments: {
        "energy-kcal_100g": 370,
        "energy-kj_100g": 1548,
        "fat_100g": 7,
        "saturated-fat_100g": 1.2,
        "carbohydrates_100g": 60,
        "sugars_100g": 1,
        "fiber_100g": 10,
        "proteins_100g": 13,
        "salt_100g": 0.01,
      },
    },
  },
  alternatives: { kind: "not_run", raw: { products: [] } },
};

test("DATA VALUE / FOOD: branded product can be explicitly joined to Matvaretabellen and recovered", async ({ page }) => {
  await page.route("**/api/food?**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(foodEnvelope) });
  });
  await page.route("**/api/food-reference?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        source: {
          id: "matvaretabellen",
          publisher: "Mattilsynet",
          exactDataset: "https://matvaretabellen.mattilsynet.io/api/nb/foods.json",
          retrievedAt: "2026-09-28T00:00:00Z",
          sourceVersion: "Matvaretabellen 2026",
          attribution: "Matvaretabellen 2026. Mattilsynet. www.matvaretabellen.no",
          scope: "GENERIC_FOOD_COMPOSITION_REFERENCE_NOT_BRANDED_PRODUCT",
          truthBoundary: "A branded product is never joined automatically.",
        },
        matches: [{
          foodId: "06.178",
          foodName: "Havregryn",
          foodGroupId: "6.1",
          searchKeywords: ["havre", "gryn"],
          nutritionPer100: {
            energyKcal: { nutrientId: "Energi2", quantity: 369, unit: "kcal", sourceId: "MVT-E" },
            protein: { nutrientId: "Protein", quantity: 13, unit: "g", sourceId: "MVT-P" },
            carbohydrate: { nutrientId: "Karbo", quantity: 60, unit: "g", sourceId: "MVT-C" },
            sugars: { nutrientId: "Mono+Di", quantity: 1, unit: "g", sourceId: "MVT-S" },
            fibre: { nutrientId: "Fiber", quantity: 10, unit: "g", sourceId: "MVT-F" },
            fat: { nutrientId: "Fett", quantity: 7, unit: "g", sourceId: "MVT-FA" },
            saturatedFat: { nutrientId: "Mettet", quantity: 1.2, unit: "g", sourceId: "MVT-SA" },
            salt: { nutrientId: "NaCl", quantity: 0.01, unit: "g", sourceId: "MVT-NA" },
          },
        }],
      }),
    });
  });

  await page.goto("/labs/food-user-test");
  await page.getByLabel("Barcode / GTIN").fill("7038010055652");
  await page.getByRole("button", { name: "Read source" }).click();
  await expect(page.getByRole("heading", { name: "Havregryn test product" })).toBeVisible();
  await expect(page.getByText("NOT JOINED")).toBeVisible();

  await page.getByLabel("Generic food").fill("havregryn");
  await page.getByRole("button", { name: "Search Matvaretabellen" }).click();
  await expect(page.getByText("Havregryn", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /CONFIRM THIS REFERENCE/ }).click();

  await expect(page.getByText("USER CONFIRMED")).toBeVisible();
  await expect(page.getByText(/do not prove this branded product has the same composition/i)).toBeVisible();

  await page.reload();
  await page.getByLabel("Barcode / GTIN").fill("7038010055652");
  await page.getByRole("button", { name: "Read source" }).click();
  await expect(page.getByText(/Returned value: your previously confirmed generic reference/i)).toBeVisible();
  await expect(page.getByText(/not Personal Brain or shared PLANETBRAIN truth/i)).toBeVisible();
});

test("DATA VALUE / 4BRANDS: public profile resolves exact identity, exposes evidence, procurement and reviewed planet signals", async ({ page }) => {
  const candidate = {
    organizationNumber: "927124238",
    entityName: "TOMRA SYSTEMS ASA",
    organizationForm: "ASA",
    registeredDate: "2022-03-01",
    deleted: false,
    bankrupt: false,
    liquidation: false,
    sourceUrl: "https://data.brreg.no/enhetsregisteret/api/enheter/927124238",
  };

  await page.route("**/api/company-identity?**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("orgnr")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          state: "EXACT_BRREG_IDENTITY",
          entity: candidate,
          gleif: {
            state: "EXACT_REGISTRATION_ID",
            candidates: [],
            verified: {
              lei: "549300TOMRATEST00001",
              legalName: "TOMRA SYSTEMS ASA",
              registeredAs: "927124238",
              sourceUrl: "https://www.gleif.org/lei/549300TOMRATEST00001",
            },
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, state: "CANDIDATES", query: "TOMRA", candidates: [candidate] }),
    });
  });

  await page.route("**/api/company-public-profile?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        profile: {
          generatedAt: "2026-10-06T00:00:00Z",
          company: {
            organizationNumber: "927124238",
            name: "TOMRA SYSTEMS ASA",
            organizationForm: { code: "ASA", description: "Allmennaksjeselskap" },
            registeredDate: "2022-03-01",
            foundationDate: "2021-12-01",
            website: "https://www.tomra.com",
            employees: 500,
            industries: [{ code: "28.290", description: "Manufacture of other general-purpose machinery" }],
            institutionalSector: null,
            businessAddress: { lines: ["Drengsrudhagen 2"], postnummer: "1385", poststed: "ASKER", kommune: "ASKER", land: "Norge", landkode: "NO" },
            postalAddress: null,
            lastSubmittedAccounts: "2025",
            registeredForVat: true,
            registeredInBusinessRegister: true,
            registeredInFoundationRegister: false,
            language: "Bokmål",
            historicalNames: [],
            status: "ACTIVE",
          },
          roles: [{ groupCode: "STYR", groupLabel: "Board", roleCode: "LEDE", roleLabel: "Chair", name: "Example Chair", subjectType: "PERSON", entityOrganizationNumber: null, sequence: 1, lastChanged: "2026-09-01" }],
          group: [{ level: 1, name: "TOMRA COLLECTION NORWAY AS", organizationNumber: "000000001", parentName: "TOMRA SYSTEMS ASA", parentOrganizationNumber: "927124238", relationshipCode: "DTR", relationship: "Subsidiary", basis: "BRREG", date: "2026-01-01", organizationForm: "AS" }],
          industryCohort: [{ organizationNumber: "000000002", name: "SOURCE-GROUNDED COHORT AS", employees: 50, organizationForm: "AS", latestAccounts: "2025", industryCode: "28.290", industry: "Manufacture of other general-purpose machinery" }],
          locations: [{ organizationNumber: "000000003", name: "TOMRA ASKER", employees: 100, industryCode: "28.290", industry: "Manufacture of other general-purpose machinery", address: { lines: ["Drengsrudhagen 2"], postnummer: "1385", poststed: "ASKER", kommune: "ASKER", land: "Norge", landkode: "NO" }, startDate: "2022-03-01", endDate: null, sourceUrl: "https://data.brreg.no" }],
          changes: [{ type: "ENTITY_UPDATE", date: "2026-09-20", title: "Register record changed", detail: "BRREG published a bounded entity update.", truthClass: "FACT", sourceId: "BRREG-UPDATES" }],
          financials: { periodStart: "2025-01-01", periodEnd: "2025-12-31", currency: "NOK", revenue: 1000000000, operatingResult: 100000000, annualResult: 80000000, resultBeforeTax: 90000000, assets: 2000000000, equity: 1000000000, debt: 1000000000, operatingMargin: 0.1, equityRatio: 0.5, truthClass: "FACT" },
          accounts: { availableYears: ["2025", "2024"], latestAvailableYear: "2025", copies: [{ year: "2025", url: "https://data.brreg.no/regnskapsregisteret/regnskap/927124238", format: "PDF" }] },
          coverage: { verifiedIdentity: true, sourceCount: 8, totalSourceLanes: 8, roleCount: 1, groupRelationCount: 1, locationCount: 1, changeCount: 1, accountYearCount: 2, financialFactsAvailable: true, industryCohortCount: 1 },
          sources: [{ id: "BRREG-ENTITY", title: "Legal entity", publisher: "Brønnøysundregistrene", url: candidate.sourceUrl, retrievedAt: "2026-10-06T00:00:00Z", state: "READY", note: "Exact organisation-number lookup." }],
          unknowns: ["Direct competitors are not established by industry code alone."],
          truthBoundary: "Facts, calculations, signals, hypotheses and unknowns remain separate.",
        },
      }),
    });
  });

  await page.route("**/api/climate-trace-owners?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        state: "CANDIDATES_REVIEW_REQUIRED",
        candidates: [{ id: "ct-owner-1", name: "TOMRA SYSTEMS ASA", country: "NO", type: "company", sourceUrl: "https://api.climatetrace.org/v7/owners?name=TOMRA" }],
      }),
    });
  });

  await page.route("**/api/climate-trace?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        assets: [{
          id: "source-1",
          sourceId: "source-1",
          canonicalFacilityId: "facility:climatetrace:source-1",
          name: "Reviewed emitting source",
          sector: "manufacturing",
          subsector: "recycling-equipment",
          country: "NOR",
          lat: 59.91,
          lon: 10.75,
          co2e: 1234,
          year: 2025,
          gas: "co2e_100yr",
        }],
      }),
    });
  });

  await page.route("**/api/procurement-demand?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        total: 1,
        signals: [{
          id: "procurement:ted:123456-2026",
          title: "Reverse vending systems",
          buyer: "Example Municipality",
          buyerCountry: "NOR",
          publicationDate: "2026-09-20",
          noticeType: "cn-standard",
          cpv: ["42933000"],
          deadline: "2026-10-31",
          sourceUrl: "https://ted.europa.eu/en/notice/-/detail/123456-2026",
        }],
      }),
    });
  });

  await page.goto("/4brands");
  await page.getByRole("textbox", { name: "Company", exact: true }).fill("TOMRA");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Which legal entity do you mean?" })).toBeVisible();
  await page.getByRole("button", { name: /USE THIS ENTITY/ }).click();

  await expect(page.getByRole("heading", { name: "TOMRA SYSTEMS ASA", exact: true })).toBeVisible();
  await expect(page.getByText(/ORG 927124238/)).toBeVisible();
  await expect(page.getByText("549300TOMRATEST00001", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Procurement", exact: true }).click();
  await page.getByLabel("Procurement keywords").fill("reverse vending");
  await page.getByRole("button", { name: "Search notices" }).click();
  await expect(page.getByText("Reverse vending systems", { exact: true })).toBeVisible();
  await expect(page.getByText(/not proof that TOMRA SYSTEMS ASA is eligible/i)).toBeVisible();

  await page.getByRole("button", { name: "Planet", exact: true }).click();
  await page.getByRole("button", { name: "Find owner candidates" }).click();
  await expect(page.getByText("Review this owner →", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Review this owner/ }).click();
  await expect(page.getByText("USER-REVIEWED SOURCE JOIN", { exact: true })).toBeVisible();
  await expect(page.getByText("facility:climatetrace:source-1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Findings", exact: true }).click();
  await expect(page.getByText("Register record changed", { exact: true })).toBeVisible();
  await expect(page.getByText(/Direct competitors are not established/i)).toBeVisible();
});

test("DATA VALUE / 4NATION: user can inspect neutral Stortinget case state and selected SSB context", async ({ page }) => {
  await page.route("**/api/nation-cases?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        state: "SOURCE_CASES",
        cases: [{
          id: "public-decision:stortinget:12345",
          sourceCaseId: "12345",
          title: "Tiltak for natur og fjord",
          shortTitle: "Natur og fjord",
          caseType: "alminneligsak",
          status: "til_behandling",
          documentGroup: "melding",
          committee: "Energi- og miljøkomiteen",
          subjects: ["Natur"],
          lastUpdated: "2026-09-27T12:00:00Z",
          sourceUrl: "https://data.stortinget.no/eksport/sak?sakid=12345&format=JSON",
        }],
      }),
    });
  });

  await page.route("**/api/statbank-context?**", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.get("table")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          state: "DEFAULT_EXTRACT",
          table: {
            id: "statistical-table:ssb:05810",
            tableId: "05810",
            label: "Population",
            description: null,
            updated: "2026-09-27T08:00:00Z",
            firstPeriod: "2025",
            lastPeriod: "2026",
            variableNames: ["region", "contents", "time"],
            source: "Statistisk sentralbyrå",
            sourceUrl: "https://data.ssb.no/api/pxwebapi/v2/tables/05810?lang=no",
          },
          dataset: {
            label: "Population context",
            updated: "2026-09-27T08:00:00Z",
            dimensions: ["region", "contents", "time"],
            cells: [{
              index: 0,
              value: 724000,
              status: null,
              coordinates: {
                region: { code: "03", label: "Oslo" },
                contents: { code: "Persons", label: "Persons" },
                time: { code: "2026", label: "2026" },
              },
            }],
          },
        }),
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        state: "TABLE_CANDIDATES",
        tables: [{
          id: "statistical-table:ssb:05810",
          tableId: "05810",
          label: "Population",
          description: null,
          updated: "2026-09-27T08:00:00Z",
          firstPeriod: "2025",
          lastPeriod: "2026",
          variableNames: ["region", "contents", "time"],
          source: "Statistisk sentralbyrå",
          sourceUrl: "https://data.ssb.no/api/pxwebapi/v2/tables/05810?lang=no",
        }],
      }),
    });
  });

  await page.goto("/4nation");
  // Official source discovery is intentionally progressive disclosure in the
  // human-first Nation surface. Open it as a person would before testing it.
  await page.locator(".nt-discovery > summary").click();
  await expect(page.getByText(/does not rank policy choices/i)).toBeVisible();

  await page.getByLabel("Search current Storting cases").fill("natur");
  await page.getByRole("button", { name: "Search official cases" }).click();
  await expect(page.getByText("public-decision:stortinget:12345")).toBeVisible();
  await expect(page.getByText("til behandling")).toBeVisible();

  await page.getByLabel("Search Statbank Norway").fill("befolkning Oslo");
  await page.getByRole("button", { name: "Find official tables" }).click();
  await expect(page.getByText("05810", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /OPEN DEFAULT EXTRACT/ }).click();
  await expect(page.getByText("statistical-table:ssb:05810")).toBeVisible();
  await expect(page.getByText("724000")).toBeVisible();
  await expect(page.getByText(/does not pick the statistic for you or treat correlation as policy causation/i)).toBeVisible();
});

test("DATA VALUE / IMPACT: independent context and open MRV gap remain visibly separate from proof", async ({ page }) => {
  await page.goto("/impact/actions/bay-of-biscay-survey");
  await expect(page.getByText("CONTEXT ONLY")).toBeVisible();
  await expect(page.getByText("MRV GAP REMAINS OPEN")).toBeVisible();
  const source = page.getByRole("link", { name: /OPEN BOUNDED SOURCE DATA/ });
  await expect(source).toHaveAttribute("href", /\/api\/obis\?scientificName=Cetacea/);
  await expect(page.getByText(/Occurrence records are not abundance, population trend, live position or proof of ecological change/i)).toBeVisible();
});
