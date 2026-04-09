// scripts/deploy.js
import { execSync } from "child_process";
import { writeFileSync } from "fs";
import { join } from "path";

const dist = join(process.cwd(), "dist");
const customDomain = "colin.quarksgames.com";
writeFileSync(join(dist, ".nojekyll"), "");
writeFileSync(join(dist, "CNAME"), `${customDomain}\n`);

const exec = (cmd) =>
  execSync(cmd, { stdio: "inherit", shell: true, cwd: dist });
const read = (cmd) =>
  execSync(cmd, { encoding: "utf8", shell: true }).trim();

const resolveIdentity = () => {
  try {
    return {
      name: read("git log -1 --pretty=format:%an"),
      email: read("git log -1 --pretty=format:%ae"),
    };
  } catch {
    const actor = process.env.GITHUB_ACTOR || "deploy-bot";
    return {
      name: process.env.GIT_AUTHOR_NAME || actor,
      email: process.env.GIT_AUTHOR_EMAIL || `${actor}@users.noreply.github.com`,
    };
  }
};

exec("git init");
const { name, email } = resolveIdentity();
exec(`git config user.name ${JSON.stringify(name)}`);
exec(`git config user.email ${JSON.stringify(email)}`);
try {
  exec("git checkout gh-pages");
} catch {
  exec("git checkout -b gh-pages");
}
exec("git add .");
let needCommit = true;
try {
  execSync("git diff --cached --quiet", { cwd: dist });
  needCommit = false;
} catch {
  needCommit = true;
}
if (needCommit) {
  exec('git commit -m "deploy"');
} else {
  console.log("No changes to commit.");
}
try {
  exec("git remote remove origin");
} catch {}
exec("git remote add origin https://github.com/c01-in/c01-in.github.io.git")
exec("git push -f origin gh-pages");
