import { expect, test } from "@playwright/test";
import { bartaEducationCorpus } from "../../src/features/barta/education-corpus";
import { bartaLearningResources, getBartaLearningResources } from "../../src/features/barta/learning-resources";

test("supplementary resources are mapped to real bilingual reviewed chunks and bounded official URLs", () => {
  const passages = new Map(bartaEducationCorpus.passages.map((passage) => [passage.chunkId, passage]));
  const matched = new Set<string>();
  for (const group of bartaLearningResources) {
    for (const chunkId of group.chunkIds) {
      expect(passages.get(chunkId)?.reviewStatus, chunkId).toBe("approved");
      expect(matched.has(chunkId), chunkId).toBe(false);
      matched.add(chunkId);
    }
    for (const locale of ["en", "bn"] as const) {
      expect(group.chunkIds.some((id) => passages.get(id)?.language === locale)).toBe(true);
      for (const resource of group.resources[locale]) {
        const url = new URL(resource.href);
        expect(url.protocol).toBe("https:");
        expect(["www.unicef.org", "www.who.int", "www.nhs.uk", "bsw.icb.nhs.uk", "www.nhsinform.scot", "www.leedsth.nhs.uk", "www.cdc.gov"]).toContain(url.hostname);
        expect(resource.title[locale]).not.toBe("");
        if ("videoId" in resource && resource.videoId) {
          expect(resource.kind).toBe("video");
          expect(resource.videoId).toMatch(/^[A-Za-z0-9_-]{11}$/u);
        }
        if ("imagePreview" in resource && resource.imagePreview) {
          expect(resource.kind).toBe("visual");
          const image = new URL(resource.imagePreview.src);
          expect(image.protocol).toBe("https:");
          expect(image.hostname).toBe(url.hostname);
          expect(resource.imagePreview.alt[locale]).not.toBe("");
        }
      }
    }
  }
});

test("resources are localized, deduplicated, capped and absent for unrelated or uncited answers", () => {
  const enLatch = { chunkId: "6346fea0-da42-409d-b9fe-4a13b508e90a" };
  const bnLatch = { chunkId: "15dfb4a5-822c-4be7-aa1c-cb695d2a05a3" };
  const milkSupply = { chunkId: "3672a64c-168d-43fd-ad1f-2777ca08c77e" };
  expect(getBartaLearningResources([enLatch, bnLatch], "bn")).toEqual([
    expect.objectContaining({ href: "https://www.unicef.org/bangladesh/parenting-bd/food-nutrition/breastfeeding-positions" }),
  ]);
  const resources = getBartaLearningResources([enLatch, milkSupply], "en");
  expect(resources).toHaveLength(2);
  expect(resources.map(({ kind }) => kind).sort()).toEqual(["video", "visual"]);
  expect(getBartaLearningResources([], "en")).toEqual([]);
  expect(getBartaLearningResources([{ chunkId: "efdc34fe-36c4-464a-8339-11ce87cc65ba" }], "en")).toEqual([]);
});

test("both ANC nutrition passages get the matching illustrated UNICEF guide", () => {
  for (const [chunkId, locale, path] of [
    ["089fc74c-53c4-404a-9268-fcf317841932", "en", "/bangladesh/en/parenting-bd/what-to-eat-when-pregnant"],
    ["eb43f5f3-e53d-4e92-90bb-0987112d9889", "bn", "/bangladesh/parenting-bd/what-to-eat-when-pregnant"],
  ] as const) {
    expect(getBartaLearningResources([{ chunkId }], locale)).toEqual([
      expect.objectContaining({ kind: "visual", href: `https://www.unicef.org${path}` }),
    ]);
  }
});
