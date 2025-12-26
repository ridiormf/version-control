import * as https from "https";
import * as fs from "fs";
import * as path from "path";

/**
 * GitHub release options
 */
export interface GithubReleaseOptions {
  owner: string;
  repo: string;
  tag: string;
  name: string;
  body: string;
  token: string;
  prerelease?: boolean;
}

/**
 * Extract GitHub owner and repo from package.json
 */
export function getGithubInfo(): { owner: string; repo: string } | null {
  try {
    const packagePath = path.join(process.cwd(), "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    if (!packageJson.repository?.url) {
      return null;
    }

    // Parse GitHub URL: https://github.com/owner/repo.git
    const match = packageJson.repository.url.match(
      /github\.com[:/]([^/]+)\/([^/.]+)/
    );
    if (!match) {
      return null;
    }

    return {
      owner: match[1],
      repo: match[2],
    };
  } catch {
    return null;
  }
}

/**
 * Extract changelog for specific version
 */
export function extractChangelogForVersion(version: string): string {
  try {
    const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
    const content = fs.readFileSync(changelogPath, "utf-8");

    // Find the section for this version
    const versionRegex = new RegExp(
      `## \\[${version.replace(/\./g, "\\.")}\\][\\s\\S]*?(?=## \\[|$)`
    );
    const match = content.match(versionRegex);

    if (!match) {
      return `Release ${version}`;
    }

    // Clean up the section
    return match[0]
      .replace(/## \[.*?\].*\n/, "") // Remove version header
      .trim();
  } catch {
    return `Release ${version}`;
  }
}

/**
 * Create GitHub release
 */
export async function createGithubRelease(
  options: GithubReleaseOptions
): Promise<boolean> {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      tag_name: options.tag,
      name: options.name,
      body: options.body,
      draft: false,
      prerelease: options.prerelease || false,
    });

    const req = https.request(
      {
        hostname: "api.github.com",
        port: 443,
        path: `/repos/${options.owner}/${options.repo}/releases`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
          Authorization: `token ${options.token}`,
          "User-Agent": "@ridiormf/version-control",
        },
      },
      (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 201) {
            const response = JSON.parse(responseData);
            console.log(
              `✓ GitHub release created: ${response.html_url || options.tag}`
            );
            resolve(true);
          } else {
            console.error(
              `✗ Failed to create GitHub release: ${res.statusCode}`
            );
            console.error(responseData);
            resolve(false);
          }
        });
      }
    );

    req.on("error", (error) => {
      console.error(`✗ Error creating GitHub release: ${error.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}
