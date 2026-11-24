// Serialize with the actual WordPress version used by the local editor fixture.
const fs = require("fs");
const path = require("path");
const { chromium } = require("../react/node_modules/playwright");
const os = require("os");
const repo = path.resolve(__dirname, "..");
(async () => {
  const cachedBrowser = path.join(process.env.LOCALAPPDATA || "", "ms-playwright/chromium-1248/chrome-win64/chrome.exe");
  const executablePath = process.env.CC_CHROMIUM_PATH || (fs.existsSync(cachedBrowser) ? cachedBrowser : undefined);
  const base = process.env.CC_WORDPRESS_URL || "http://127.0.0.1:8099";
  const browser = await chromium.launch({ headless: true, executablePath });
  const context = await browser.newContext();
  await context.route("**/*", route => route.request().url().startsWith(base) ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const authFile = path.join(os.homedir(), ".cache/cc-page-review/review-auth.json");
  const auth = process.env.CC_TEST_USER ? {user:process.env.CC_TEST_USER,password:process.env.CC_TEST_PASSWORD} : fs.existsSync(authFile) ? JSON.parse(fs.readFileSync(authFile,"utf8")) : {};
  if (!auth.user || !auth.password) throw new Error("Set CC_TEST_USER and CC_TEST_PASSWORD for an isolated local WordPress install");
  await page.goto(base + "/wp-login.php", {waitUntil:"domcontentloaded"});
  await page.locator("#user_login").fill(auth.user);
  await page.locator("#user_pass").fill(auth.password);
  await page.locator("#wp-submit").click();
  await page.waitForURL("**/wp-admin/**", {waitUntil:"domcontentloaded"});
  await page.goto(base + "/wp-admin/post-new.php?post_type=page", {waitUntil:"domcontentloaded"});
  await page.waitForFunction(() => window.wp && wp.blocks && wp.blocks.getBlockType("core/group"));
  const specs = JSON.parse(fs.readFileSync(path.join(repo, "build/wordpress-blocks.json"), "utf8"));
  const data = await page.evaluate(specs => {
    const create = spec => wp.blocks.createBlock(spec.name, spec.attributes, spec.innerBlocks.map(create));
    const root = specs.map(create);
    const markup = wp.blocks.serialize(root);
    const invalid = [];
    const walk = blocks => blocks.forEach(block => { if (!block.isValid) invalid.push(block.name); walk(block.innerBlocks); });
    walk(wp.blocks.parse(markup));
    return { markup, invalid, sections: root[0].innerBlocks.map(block => wp.blocks.serialize([wp.blocks.createBlock("core/group", {className:"cc-cpa-new-page",align:"full",layout:{type:"default"},templateLock:"contentOnly"}, [block])])) };
  }, specs);
  if (data.invalid.length) throw new Error("Invalid canonical blocks: " + data.invalid.join(","));
  const patterns = path.join(repo, "wordpress/patterns");
  fs.mkdirSync(patterns, { recursive: true });
  function save(file, title, slug, content, category = "cc-sections") {
    content = content.replace(/__CC_CPA_NEW_ASSETS__\/images\/([\w.-]+)/g, (_, filename) => "<?php echo esc_url( get_template_directory_uri() . '/assets/images/" + filename + "' ); ?>");
    const starter = slug === "page-cpa-partners-new" ? " * Block Types: core/post-content\n * Post Types: page\n" : "";
    const header = `<?php\n/**\n * Title: ${title}\n * Slug: cc-modern/${slug}\n * Categories: ${category}\n${starter} * Description: Native editable blocks converted from the supplied new CPA Partners React page.\n * Viewport Width: 1440\n *\n * @package cc-modern\n */\n?>\n`;
    fs.writeFileSync(path.join(patterns, file + ".php"), header + content + "\n");
  }
  save("page-cpa-partners-new", "Page — CPA Partners New", "page-cpa-partners-new", data.markup, "cc-page-starters");
  const names = ["hero","trust","problem","benefits","process","services","testimonials","technology","getting-started","faq","closing","contact"];
  if (data.sections.length !== names.length) throw new Error("Unexpected React section count: " + data.sections.length);
  data.sections.forEach((markup, i) => save("cpa-new-" + names[i], "CPA Partners New — " + names[i].replaceAll("-", " "), "cpa-new-" + names[i], markup, i === 0 ? "cc-hero" : [2,7,10].includes(i) ? "cc-accent" : "cc-sections"));
  console.log("Serialized a native full page and 12 reusable sections; zero invalid blocks.");
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
