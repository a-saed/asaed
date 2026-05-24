"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import Terminal from "react-console-emulator";
import { openNewLink } from "@/utils/general.util";

const TerminalPage = () => {
  const terminal = useRef(null);
  const router = useRouter();
  const commands = {
    github: {
      description: "open my github profile",
      usage: "github",
      fn: () => openNewLink("https://github.com/AbdoElsaed", "_blank"),
    },
    resume: {
      description: "open my resume document",
      usage: "resume",
      fn: () =>
        openNewLink(process.env.NEXT_PUBLIC_RESUME_LINK as string, "_blank"),
    },
    home: {
      description: "Return to the portfolio home page",
      usage: "home",
      fn: () => router.push("/"),
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
            "welcome to terminal mode of asaed portfolio",
            "type 'help' to get a list of available commands",
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
