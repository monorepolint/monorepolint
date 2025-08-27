import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import classnames from "classnames";
import styles from "./styles.module.css";

const features = [
  {
    title: <>Dependency Management</>,
    icon: "📦",
    description: (
      <>
        Keep dependencies organized and consistent across all packages. Automatically sort
        alphabetically, enforce version consistency, and ban problematic packages.
      </>
    ),
  },
  {
    title: <>Configuration Validation</>,
    icon: "⚙️",
    description: (
      <>
        Ensure TypeScript configs, package.json files, and build scripts remain consistent. Prevent
        configuration drift before it becomes a problem.
      </>
    ),
  },
  {
    title: <>Automated Fixing</>,
    icon: "🔧",
    description: (
      <>
        Don't just find problems—fix them automatically. Most consistency issues can be resolved
        with a single command: <code>mrl check --fix</code>
      </>
    ),
  },
  {
    title: <>Custom Rules</>,
    icon: "🎯",
    description: (
      <>
        Create your own rules for project-specific patterns. Built with TypeScript for full IDE
        support and type safety.
      </>
    ),
  },
  {
    title: <>CI/CD Ready</>,
    icon: "🚀",
    description: (
      <>
        Integrate seamlessly with your CI/CD pipeline. Prevent inconsistencies from reaching your
        main branch with automated checks.
      </>
    ),
  },
  {
    title: <>Zero Lock-in</>,
    icon: "🔓",
    description: (
      <>
        Works with your existing tools and workflows. No need to change your build system, package
        manager, or development process.
      </>
    ),
  },
];

const quickStartExample = `# Install monorepolint
npm install monorepolint

# Add basic configuration
echo 'import { alphabeticalDependencies, packageOrder } from "@monorepolint/rules";

export default {
  rules: [
    packageOrder({}),
    alphabeticalDependencies({}),
  ],
};' > .monorepolint.config.mjs

# Check your monorepo
npx mrl check

# Fix issues automatically
npx mrl check --fix`;

function Feature({ icon, title, description }) {
  return (
    <div className={classnames("col col--4", styles.feature)}>
      <div className={styles.featureIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function QuickStart() {
  return (
    <section className={styles.quickStart}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <h2>Get Started in 5 Minutes</h2>
            <p>
              Add monorepolint to your project and start enforcing consistency across your monorepo
              immediately.
            </p>
            <div className={styles.quickStartButtons}>
              <Link
                className="button button--primary button--lg"
                to={useBaseUrl("docs/")}
              >
                Full Installation Guide
              </Link>
              <Link
                className="button button--secondary button--outline button--lg"
                to={useBaseUrl("docs/rules/alphabetical-dependencies")}
              >
                Browse Rules
              </Link>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.codeBlock}>
              <pre>
                <code>{quickStartExample}</code>
              </pre>
              <button
                className={styles.copyButton}
                onClick={() => navigator.clipboard.writeText(quickStartExample)}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UsedBy() {
  return (
    <section className={styles.usedBy}>
      <div className="container">
        <div className="text--center">
          <h2>Trusted by Development Teams</h2>
          <p>
            Originally developed at Palantir Technologies and now used by teams worldwide to
            maintain consistent monorepos.
          </p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>⭐ 500+</strong>
              <span>GitHub Stars</span>
            </div>
            <div className={styles.stat}>
              <strong>📦 15+</strong>
              <span>Built-in Rules</span>
            </div>
            <div className={styles.stat}>
              <strong>🏢 100+</strong>
              <span>Projects Using It</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title="Keep Your Monorepo Consistent"
      description="Automated linting and fixing for monorepo standards. Ensure dependency consistency, configuration validation, and structural organization across all your packages."
    >
      <header className={classnames("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className="hero__title">{siteConfig.title}</h1>
              <p className="hero__subtitle">{siteConfig.tagline}</p>
              <div className={styles.heroButtons}>
                <Link
                  className={classnames(
                    "button button--outline button--secondary button--lg",
                    styles.getStarted,
                  )}
                  to={useBaseUrl("docs/")}
                >
                  Get Started
                </Link>
                <Link
                  className="button button--outline button--secondary button--lg"
                  href="https://github.com/monorepolint/monorepolint"
                >
                  View on GitHub
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <img
                src={useBaseUrl("img/logo.jpg")}
                alt="monorepolint logo - stacked washing machines representing lint cleaning"
                className={styles.heroLogo}
              />
            </div>
          </div>
          <div className={styles.heroDemo}>
            <div className={styles.terminalWindow}>
              <div className={styles.terminalHeader}>
                <span></span>
              </div>
              <div className={styles.terminalBody}>
                <div className={styles.terminalLine}>
                  <span className={styles.prompt}>$</span> mrl check
                </div>
                <div className={styles.terminalOutput}>
                  <div className={styles.errorLine}>
                    ❌ @myapp/frontend: Incorrect order of dependencies in package.json
                  </div>
                  <div className={styles.errorLine}>
                    ❌ @myapp/backend: Missing required script "test" in package.json
                  </div>
                </div>
                <div className={styles.terminalLine}>
                  <span className={styles.prompt}>$</span> mrl check --fix
                </div>
                <div className={styles.terminalOutput}>
                  <div className={styles.successLine}>
                    ✅ @myapp/frontend: Fixed order of dependencies in package.json
                  </div>
                  <div className={styles.successLine}>
                    ✅ @myapp/backend: Added required script "test" to package.json
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="text--center">
              <h2>Why Monorepolint?</h2>
              <p>
                Large monorepos are powerful but hard to maintain. Monorepolint makes it easy to
                enforce consistent patterns across all your packages.
              </p>
            </div>
            <div className="row">
              {features.map((props, idx) => <Feature key={idx} {...props} />)}
            </div>
          </div>
        </section>

        <QuickStart />

        <section className={styles.cta}>
          <div className="container">
            <div className="text--center">
              <h2>Ready to Get Started?</h2>
              <p>
                Join the teams who've already improved their monorepo consistency with monorepolint.
              </p>
              <Link
                className="button button--primary button--lg"
                to={useBaseUrl("docs/")}
              >
                Install Monorepolint
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
