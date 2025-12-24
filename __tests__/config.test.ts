import {
  setLanguage,
  clearLanguage,
  getConfiguredLanguage,
} from "../src/config";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const CONFIG_PATH = path.join(os.homedir(), ".version-control-config.json");

describe("config", () => {
  beforeEach(() => {
    // Limpar configuração antes de cada teste
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  afterAll(() => {
    // Limpar após todos os testes
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
    }
  });

  describe("setLanguage", () => {
    it("should save language configuration", () => {
      setLanguage("pt");
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);

      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      expect(config.language).toBe("pt");
    });

    it("should overwrite existing language", () => {
      setLanguage("en");
      setLanguage("es");

      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      expect(config.language).toBe("es");
    });

    it("should accept valid language codes", () => {
      const languages: ("en" | "pt" | "es" | "fr")[] = ["en", "pt", "es", "fr"];
      languages.forEach((lang) => {
        expect(() => setLanguage(lang)).not.toThrow();
      });
    });
  });

  describe("getConfiguredLanguage", () => {
    it("should return undefined when no config exists", () => {
      expect(getConfiguredLanguage()).toBeUndefined();
    });

    it("should return saved language", () => {
      setLanguage("fr");
      expect(getConfiguredLanguage()).toBe("fr");
    });

    it("should return undefined for invalid config file", () => {
      fs.writeFileSync(CONFIG_PATH, "invalid json");
      expect(getConfiguredLanguage()).toBeUndefined();
    });
  });

  describe("clearLanguage", () => {
    it("should keep config file but remove language", () => {
      setLanguage("en");
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);

      clearLanguage();
      expect(fs.existsSync(CONFIG_PATH)).toBe(true);
      expect(getConfiguredLanguage()).toBeUndefined();
    });

    it("should not throw if config does not exist", () => {
      expect(() => clearLanguage()).not.toThrow();
    });
  });
});
