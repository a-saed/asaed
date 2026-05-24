"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import Terminal from "react-console-emulator";
import { openNewLink } from "@/utils/general.util";

const TerminalPage = () => {
  const terminal = useRef(null);
  const router = useRouter();

  const commands = {
    whoami: {
      description: "who is asaed?",
      usage: "whoami",
      fn: () =>
        "Abdulrhman Elsaed — full-stack engineer building GIS software.\nI turn messy coordinates into products people actually use.\nI write here when something takes too long to figure out.",
    },
    projects: {
      description: "list my projects",
      usage: "projects",
      fn: () =>
        [
          "Navigo       — delivery telematics platform with real-time tracking",
          "Toder        — task management with drag-and-drop project hierarchy",
          "FutureMe     — send a letter to your future self via scheduled email",
          "linkedin-dl  — CLI to download LinkedIn Learning courses offline",
        ].join("\n"),
    },
    writing: {
      description: "list my articles",
      usage: "writing",
      fn: () => {
        router.push("/writing");
        return "opening /writing...";
      },
    },
    github: {
      description: "open my github profile",
      usage: "github",
      fn: () => {
        openNewLink("https://github.com/a-saed", "_blank");
        return "opening github...";
      },
    },
    resume: {
      description: "open my resume",
      usage: "resume",
      fn: () => {
        openNewLink(process.env.NEXT_PUBLIC_RESUME_LINK as string, "_blank");
        return "opening resume...";
      },
    },
    home: {
      description: "go back to home",
      usage: "home",
      fn: () => {
        router.push("/");
        return "going home...";
      },
    },
    contact: {
      description: "how to reach me",
      usage: "contact",
      fn: () =>
        "email  → abdulrhman.sa3ed@gmail.com\ngithub → https://github.com/a-saed",
    },
    stack: {
      description: "my current tech stack",
      usage: "stack",
      fn: () =>
        [
          "languages  → TypeScript, Python, Go",
          "frontend   → React, Next.js",
          "backend    → Node.js, Go",
          "data       → PostgreSQL, MongoDB, Redis",
          "maps       → Leaflet, MapLibre, PostGIS",
        ].join("\n"),
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <div className="flex-1 max-w-[680px] w-full mx-auto px-6 py-12 flex flex-col">
        <p className="font-mono text-xs text-neutral-600 mb-4">
          <a href="/" className="hover:text-neutral-400 transition-colors">← back</a>
        </p>
        <Terminal
          ref={terminal}
          commands={commands}
          welcomeMessage={[
            "asaed's terminal — type 'help' for available commands",
          ]}
          promptLabel={"asaed@portfolio:~$"}
          autoFocus
          style={{
            backgroundColor: "#111",
            border: "1px solid #1e1e1e",
            borderRadius: "6px",
            minHeight: "60vh",
            flex: 1,
            overflow: "auto",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
          styleEchoBack="fullInherit"
          contentStyle={{ color: "#ffb86c", fontWeight: "normal" }}
          promptLabelStyle={{ color: "#ff5555", fontWeight: "normal" }}
          inputTextStyle={{ color: "#f1fa8c", fontWeight: "normal" }}
          messageStyle={{ color: "#8be9fd", fontWeight: "normal" }}
          scrollBehavior="auto"
        />
      </div>
    </div>
  );
};

export default TerminalPage;
