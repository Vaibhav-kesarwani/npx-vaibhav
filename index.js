#!/usr/bin/env node
import chalk from "chalk";
import boxen from "boxen";
import gradient from "gradient-string";
import figlet from "figlet";
import dayjs from "dayjs";
import fetch from "node-fetch";
import { Spinner } from "cli-spinner";
import wrapAnsi from "wrap-ansi";

const username = "Vaibhav-kesarwani";
const font = "Epic";
const accent = chalk.hex("#f4b942");

const terminalWidth = process.stdout.columns || 80;
const boxWidth = Math.min(terminalWidth - 6, 90);

const spinner = new Spinner("%s Fetching live GitHub data...");
spinner.setSpinnerString("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");
spinner.start();

async function getGitHubData() {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    const user = await res.json();

    const reposRes = await fetch(user.repos_url);
    const repos = await reposRes.json();

    spinner.stop(true);

    const topRepos = repos
      .filter((r) => !r.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 3);

    const time = chalk.gray(dayjs().format("HH:mm [IST] • ddd, MMM D"));
    const line = chalk.gray("─".repeat(boxWidth - 10));

    let selectedFont = font;

    if (boxWidth < 60) {
      selectedFont = "Standard";
    } else if (boxWidth < 75) {
      selectedFont = "Small";
    }

    let title;
    try {
      const rawFiglet = figlet.textSync("Vaibhav", {
        font: selectedFont,
        horizontalLayout: "fitted",
      });
      const figletLines = rawFiglet.split("\n");

      const centeredFiglet = figletLines
        .map((line) => {
          const visibleLength = line.replace(/\x1B\[[0-9;]*m/g, "").length;
          const pad =
            visibleLength < boxWidth
              ? Math.floor((boxWidth - visibleLength) / 2)
              : 2;
          return " ".repeat(pad) + line;
        })
        .join("\n");

      title = gradient.pastel.multiline(centeredFiglet);
    } catch {
      const name = "Vaibhav";
      const pad = Math.max(0, Math.floor((boxWidth - name.length) / 2));
      title = gradient.pastel(" ".repeat(pad) + name);
    }

    const taglineText = "Software Developer • AI | DevTools | UI/UX Enthusiast";
    const tagline = boxen(chalk.white(taglineText), {
      padding: { top: 0, bottom: 0, left: 2, right: 2 },
      borderStyle: "round",
      borderColor: "#f4b942",
      align: "center",
      width: Math.min(taglineText.length + 10, boxWidth - 10),
    });

    const connect = `
${accent(" GitHub")}    ${chalk.cyan("github.com/Vaibhav-kesarwani")}
${accent(" Website")}   ${chalk.cyan("vaibhavkesarwani.vercel.app/")}
${accent(" Email")}     ${chalk.cyan("vaibhavkesarwani100@gmail.com")}
${accent(" LinkedIn")}  ${chalk.cyan("linkedin.com/in/vaibhavdev")}
${accent(" Twitter")}   ${chalk.cyan("x.com/vaibhav_k__")}
`;

    const stack = chalk.white("React  •  Next.js  •  TypeScript  •  Python");

    const projects = topRepos
      .map(
        (r) =>
          `${chalk.bold(accent(r.name))} ${chalk.gray(
            `(${r.stargazers_count}★)`
          )}\n${chalk.white(
            wrapAnsi(r.description || "No description provided", boxWidth - 12)
          )}\n`
      )
      .join("\n");

    const content = `
${time}

${title}

${tagline}

${accent.bold("CONNECT")}
${line}
${connect.trim()}

${accent.bold("STACK")}
${line}
${wrapAnsi(stack, boxWidth - 12)}

${accent.bold("TOP PROJECTS")}
${line}
${projects.trim()}

${chalk.gray("──────────────────────────────────────────────")}
${chalk.gray("Made with ❤️  by ")}${accent("Vaibhav Kesarwani")}
`;

    console.log(
      boxen(content.trim(), {
        borderStyle: "round",
        borderColor: "#f4b942",
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        margin: { top: 1, bottom: 1 },
        float: "center",
        width: boxWidth,
      })
    );
  } catch (err) {
    spinner.stop(true);
    console.error(chalk.red("Error fetching GitHub data:"), err.message);
  }
}

getGitHubData();
