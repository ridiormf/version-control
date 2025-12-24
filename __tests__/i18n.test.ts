import { t, getYesOptions, getNoOptions } from "../src/i18n";
import i18next from "i18next";

describe("i18n", () => {
  describe("Translation completeness", () => {
    it("should have translations for en and pt", () => {
      expect(i18next.hasResourceBundle("en", "translation")).toBe(true);
      expect(i18next.hasResourceBundle("pt", "translation")).toBe(true);
    });

    it("should not have empty translation values for en", () => {
      const resources = i18next.getResourceBundle("en", "translation");
      const checkEmpty = (obj: any) => {
        Object.entries(obj).forEach(([_key, value]) => {
          if (typeof value === "string") {
            expect(value.trim()).not.toBe("");
          } else if (typeof value === "object" && value !== null) {
            checkEmpty(value);
          }
        });
      };
      checkEmpty(resources);
    });

    it("should not have empty translation values for pt", () => {
      const resources = i18next.getResourceBundle("pt", "translation");
      const checkEmpty = (obj: any) => {
        Object.entries(obj).forEach(([_key, value]) => {
          if (typeof value === "string") {
            expect(value.trim()).not.toBe("");
          } else if (typeof value === "object" && value !== null) {
            checkEmpty(value);
          }
        });
      };
      checkEmpty(resources);
    });
  });

  describe("getYesOptions", () => {
    it("should return array of yes options", () => {
      const options = getYesOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      options.forEach((option) => {
        expect(typeof option).toBe("string");
        expect(option.trim()).not.toBe("");
      });
    });
  });

  describe("getNoOptions", () => {
    it("should return array of no options", () => {
      const options = getNoOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      options.forEach((option) => {
        expect(typeof option).toBe("string");
        expect(option.trim()).not.toBe("");
      });
    });
  });

  describe("t function", () => {
    it("should translate keys correctly", () => {
      const translation = t("welcome");
      expect(translation).toBeDefined();
      expect(typeof translation).toBe("string");
      expect(translation.length).toBeGreaterThan(0);
    });

    it("should return key for missing translations", () => {
      const translation = t("nonExistentKey");
      expect(translation).toBe("nonExistentKey");
    });
  });
});
