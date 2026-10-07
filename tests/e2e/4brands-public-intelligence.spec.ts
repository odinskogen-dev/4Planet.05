import { test, expect } from "@playwright/test";

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

  await page.route("**/api/company-eu-projects?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        state: "EXACT_LEGAL_NAME_PROJECTS",
        company: { organizationNumber: "927124238", legalName: "TOMRA SYSTEMS ASA" },
        projects: [{
          id: "101234567",
          title: "Circular resource intelligence",
          startDate: "2025-01-01",
          endDate: "2028-12-31",
          organisationName: "TOMRA SYSTEMS ASA",
          fundingAmount: 1250000,
          sourceUrl: "https://cordis.europa.eu/project/id/101234567",
        }],
        truthBoundary: "CORDIS project participation and grant-role amounts are public source records, not company revenue.",
      }),
    });
  });

  await page.route("**/api/company-first-party?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        state: "FIRST_PARTY_SOURCE_MAP",
        company: { organizationNumber: "927124238", name: "TOMRA SYSTEMS ASA", registeredWebsite: "https://www.tomra.com/" },
        homepage: { url: "https://www.tomra.com/", title: "TOMRA", description: "Company-published business description.", h1: "TOMRA", state: "READY" },
        pages: [{ url: "https://www.tomra.com/investor-relations", title: "Investor Relations", description: "Company-published investor information.", h1: "Investor Relations", category: "INVESTOR", state: "READY" }],
        truthBoundary: "Website content is first-party company-published context / claims, not independently verified fact.",
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
  await expect(page.getByText("DECISION BRIEF", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What is worth investigating next?" })).toBeVisible();
  await expect(page.getByText("FROM PUBLIC FACTS TO MEASURABLE VALUE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Turn one finding into a bounded Value Cell." })).toBeVisible();

  await page.getByRole("button", { name: "Business", exact: true }).click();
  await page.getByRole("button", { name: "Map official company sources" }).click();
  await expect(page.getByText("BRREG-ANCHORED FIRST PARTY", { exact: true })).toBeVisible();
  await expect(page.getByText("Investor Relations", { exact: true })).toBeVisible();
  await expect(page.getByText(/not independently verified fact/i)).toBeVisible();

  await page.getByRole("button", { name: "Innovation", exact: true }).click();
  await page.getByRole("button", { name: "Load EU project records" }).click();
  await expect(page.getByText("Circular resource intelligence", { exact: true })).toBeVisible();
  await expect(page.getByText(/CORDIS 101234567/)).toBeVisible();

  await page.getByRole("button", { name: "Capital", exact: true }).click();
  await page.getByRole("button", { name: "Load EU funding records" }).click();
  await expect(page.getByText("CORDIS project participation and grant-role amounts are public source records, not company revenue.", { exact: true })).toBeVisible();

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

