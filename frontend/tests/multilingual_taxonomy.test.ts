import { describe, expect, it } from "vitest";
import {
  MULTILINGUAL_DISTRICTS,
  MULTILINGUAL_CATEGORIES,
  MULTILINGUAL_INTERESTS,
  getLocalizedDistrictLabel,
  getLocalizedCategoryLabel,
  getLocalizedInterestLabel,
} from "../src/types/multilingualTaxonomy";

describe("Frontend Multilingual Taxonomy Contract & Crosswalk", () => {
  describe("30 Administrative Districts Taxonomy", () => {
    it("contains exactly 30 authoritative Odisha districts", () => {
      expect(MULTILINGUAL_DISTRICTS).toHaveLength(30);
    });

    it("has unique canonical district IDs with non-empty English, Odia, and Hindi labels", () => {
      const ids = new Set<string>();
      for (const item of MULTILINGUAL_DISTRICTS) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
        expect(item.id.trim()).not.toBe("");
        expect(item.label_en.trim()).not.toBe("");
        expect(item.label_or.trim()).not.toBe("");
        expect(item.label_hi.trim()).not.toBe("");
      }
    });

    it("matches verified backend crosswalk values for key districts", () => {
      const puri = MULTILINGUAL_DISTRICTS.find((d) => d.id === "Puri");
      expect(puri).toEqual({
        id: "Puri",
        label_en: "Puri",
        label_or: "ପୁରୀ",
        label_hi: "पुरी",
      });

      const cuttack = MULTILINGUAL_DISTRICTS.find((d) => d.id === "Cuttack");
      expect(cuttack).toEqual({
        id: "Cuttack",
        label_en: "Cuttack",
        label_or: "କଟକ",
        label_hi: "कटक",
      });

      const mayurbhanj = MULTILINGUAL_DISTRICTS.find((d) => d.id === "Mayurbhanj");
      expect(mayurbhanj).toEqual({
        id: "Mayurbhanj",
        label_en: "Mayurbhanj",
        label_or: "ମୟୂରଭଞ୍ଜ",
        label_hi: "मयूरभंज",
      });

      const khordha = MULTILINGUAL_DISTRICTS.find((d) => d.id === "Khordha");
      expect(khordha).toEqual({
        id: "Khordha",
        label_en: "Khordha",
        label_or: "ଖୋର୍ଦ୍ଧା",
        label_hi: "खोर्धा",
      });

      const sundargarh = MULTILINGUAL_DISTRICTS.find((d) => d.id === "Sundargarh");
      expect(sundargarh).toEqual({
        id: "Sundargarh",
        label_en: "Sundargarh",
        label_or: "ସୁନ୍ଦରଗଡ଼",
        label_hi: "सुंदरगढ़",
      });
    });

    it("correctly resolves localized district labels via getLocalizedDistrictLabel", () => {
      expect(getLocalizedDistrictLabel("Puri", "en")).toBe("Puri");
      expect(getLocalizedDistrictLabel("Puri", "or")).toBe("ପୁରୀ");
      expect(getLocalizedDistrictLabel("Puri", "hi")).toBe("पुरी");
      expect(getLocalizedDistrictLabel("UnknownDistrict", "or")).toBe("UnknownDistrict");
    });
  });

  describe("16 Canonical Physical Categories Taxonomy", () => {
    it("contains exactly 16 physical categories matching backend taxonomy", () => {
      expect(MULTILINGUAL_CATEGORIES).toHaveLength(16);
    });

    it("has unique canonical category IDs with non-empty English, Odia, and Hindi labels", () => {
      const ids = new Set<string>();
      for (const item of MULTILINGUAL_CATEGORIES) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
        expect(item.id.trim()).not.toBe("");
        expect(item.label_en.trim()).not.toBe("");
        expect(item.label_or.trim()).not.toBe("");
        expect(item.label_hi.trim()).not.toBe("");
      }
    });

    it("matches verified backend crosswalk values for key categories", () => {
      const temple = MULTILINGUAL_CATEGORIES.find((c) => c.id === "temple");
      expect(temple).toEqual({
        id: "temple",
        label_en: "temple",
        label_or: "ମନ୍ଦିର",
        label_hi: "मंदिर",
      });

      const waterfall = MULTILINGUAL_CATEGORIES.find((c) => c.id === "waterfall");
      expect(waterfall).toEqual({
        id: "waterfall",
        label_en: "waterfall",
        label_or: "ଜଳପ୍ରପାତ",
        label_hi: "जलप्रपात",
      });

      const beach = MULTILINGUAL_CATEGORIES.find((c) => c.id === "beach");
      expect(beach).toEqual({
        id: "beach",
        label_en: "beach",
        label_or: "ସମୁଦ୍ର କୂଳ",
        label_hi: "समुद्र तट",
      });

      const museum = MULTILINGUAL_CATEGORIES.find((c) => c.id === "museum");
      expect(museum).toEqual({
        id: "museum",
        label_en: "museum",
        label_or: "ସଂଗ୍ରହାଳୟ",
        label_hi: "संग्रहालय",
      });

      const wildlife = MULTILINGUAL_CATEGORIES.find((c) => c.id === "wildlife");
      expect(wildlife).toEqual({
        id: "wildlife",
        label_en: "wildlife",
        label_or: "ବନ୍ୟଜନ୍ତୁ ଅଭୟାରଣ୍ୟ",
        label_hi: "वन्यजीव अभयारण्य",
      });
    });

    it("correctly resolves localized category labels via getLocalizedCategoryLabel", () => {
      expect(getLocalizedCategoryLabel("temple", "en")).toBe("temple");
      expect(getLocalizedCategoryLabel("temple", "or")).toBe("ମନ୍ଦିର");
      expect(getLocalizedCategoryLabel("temple", "hi")).toBe("मंदिर");
      expect(getLocalizedCategoryLabel("unknown_cat", "hi")).toBe("unknown_cat");
    });
  });

  describe("12 Canonical Traveler Interests Taxonomy", () => {
    it("contains exactly 12 traveler interests matching backend taxonomy", () => {
      expect(MULTILINGUAL_INTERESTS).toHaveLength(12);
    });

    it("has unique canonical interest IDs with non-empty English, Odia, and Hindi labels", () => {
      const ids = new Set<string>();
      for (const item of MULTILINGUAL_INTERESTS) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
        expect(item.id.trim()).not.toBe("");
        expect(item.label_en.trim()).not.toBe("");
        expect(item.label_or.trim()).not.toBe("");
        expect(item.label_hi.trim()).not.toBe("");
      }
    });

    it("matches verified backend crosswalk values for key interests", () => {
      const heritage = MULTILINGUAL_INTERESTS.find((i) => i.id === "heritage");
      expect(heritage).toEqual({
        id: "heritage",
        label_en: "heritage",
        label_or: "ଐତିହ୍ୟ",
        label_hi: "विरासत",
      });

      const spirituality = MULTILINGUAL_INTERESTS.find((i) => i.id === "spirituality");
      expect(spirituality).toEqual({
        id: "spirituality",
        label_en: "spirituality",
        label_or: "ଆଧ୍ୟାତ୍ମିକତା",
        label_hi: "आध्यात्मिकता",
      });

      const food = MULTILINGUAL_INTERESTS.find((i) => i.id === "food");
      expect(food).toEqual({
        id: "food",
        label_en: "food",
        label_or: "ଖାଦ୍ୟ",
        label_hi: "खानपान",
      });

      const adventure = MULTILINGUAL_INTERESTS.find((i) => i.id === "adventure");
      expect(adventure).toEqual({
        id: "adventure",
        label_en: "adventure",
        label_or: "ଦୁଃସାହସିକ ଯାତ୍ରା",
        label_hi: "साहसिक यात्रा",
      });
    });

    it("correctly resolves localized interest labels via getLocalizedInterestLabel", () => {
      expect(getLocalizedInterestLabel("heritage", "en")).toBe("heritage");
      expect(getLocalizedInterestLabel("heritage", "or")).toBe("ଐତିହ୍ୟ");
      expect(getLocalizedInterestLabel("heritage", "hi")).toBe("विरासत");
      expect(getLocalizedInterestLabel("unknown_interest", "or")).toBe("unknown_interest");
    });
  });
});
