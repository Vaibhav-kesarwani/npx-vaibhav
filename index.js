#!/usr/bin/env node
import chalk from "chalk";
import boxen from "boxen";
import gradient from "gradient-string";
import figlet from "figlet";
import dayjs from "dayjs";
import fetch from "node-fetch";
import { Spinner } from "cli-spinner";
import wrapAnsi from "wrap-ansi";
import open from "open";
import ora from "ora";
import cliSpinners from "cli-spinners";
import fs from "fs";
import path from "path";
import request from "request";
import inquirer from "inquirer";

const prompt = inquirer.createPromptModule();

const username = "Vaibhav-kesarwani";
const font = "Epic";
const accent = chalk.hex("#f4b942");

const terminalWidth = process.stdout.columns || 80;
const boxWidth = Math.min(terminalWidth - 6, 90);

const spinner = new Spinner("%s Fetching live GitHub data...");
spinner.setSpinnerString("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");
spinner.start();

const questions = [
  {
    type: "list",
    name: "action",
    message: "What do you want to do?",
    choices: [
      {
        name: `Send me an ${chalk.green.bold("email")}`,
        value: async () => {
          await open("mailto:vaibhavkesarwani100@gmail.com");
          console.log(chalk.yellow("\nDone! See you soon in inbox.\n"));
        },
      },
      {
        name: `Download my ${chalk.magentaBright.bold("Resume")}`,
        value: async () => {
          const loader = ora({
            text: chalk.gray("Downloading Resume..."),
            spinner: cliSpinners.material,
          }).start();

          const resumeUrl =
            "https://drive.google.com/uc?export=download&id=16mQ8BQlpTX2vyemCcoUFx_Ypc6p0oXwp";

          try {
            const filePath = path.join(process.cwd(), "vaibhav-resume.pdf");
            const stream = fs.createWriteStream(filePath);

            request(resumeUrl)
              .pipe(stream)
              .on("finish", async () => {
                loader.succeed(chalk.green("Resume downloaded successfully!"));
                console.log(`\n📂 Saved at: ${chalk.cyan(filePath)}\n`);
                await open(filePath);
              })
              .on("error", (err) => {
                loader.fail(chalk.red("Error downloading resume."));
                console.error(err.message);
              });
          } catch (error) {
            loader.fail("Failed to download resume.");
            console.error(error.message);
          }
        },
      },
      {
        name: `Schedule a ${chalk.redBright.bold("Meeting")}`,
        value: async () => {
          await open("https://cal.com/vaibhav-kesarwani");
          console.log(chalk.yellow("\nSee you at the meeting!\n"));
        },
      },
      {
        name: "Just quit.",
        value: () => {
          console.log(chalk.gray("\nHasta la vista 👋\n"));
          process.exit(0);
        },
      },
    ],
  },
];

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
    if (boxWidth < 60) selectedFont = "Standard";
    else if (boxWidth < 75) selectedFont = "Small";

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
${accent.bold(" GitHub")}    ${chalk.cyan("github.com/Vaibhav-kesarwani")}
${accent.bold(" Website")}   ${chalk.cyan("vaibhavkesarwani.vercel.app")}
${accent.bold(" Email")}     ${chalk.cyan("vaibhavkesarwani100@gmail.com")}
${accent.bold(" LinkedIn")}  ${chalk.cyan("linkedin.com/in/vaibhavdev")}
${accent.bold(" Twitter")}   ${chalk.cyan("x.com/vaibhav_k__")}
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

    console.log(
      `\n💡 ${chalk.cyanBright.bold("Tip:")} Try ${chalk.yellowBright.bold(
        "Cmd/Ctrl + Click"
      )} on the links above!\n`
    );
  } catch (err) {
    spinner.stop(true);
    console.error(chalk.red("Error fetching GitHub data:"), err.message);
  }
}

(async () => {
  await getGitHubData();
  const answer = await prompt(questions);
  await answer.action();
})();
