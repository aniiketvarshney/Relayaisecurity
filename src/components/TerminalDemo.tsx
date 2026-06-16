import React from "react";

export default function TerminalDemo() {
  const receipts = ["#7d12", "#04fa", "#9c33", "#b21e", "#e801"];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
          Relay-verify • Offline
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
          No server • No call-home
        </span>
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-[13px] leading-relaxed">
        {/* Command */}
        <div className="mb-5 flex items-center gap-2 text-[var(--code-green)]">
          <span className="text-[var(--text-muted)]">$</span>
          <span>relay-verify run.json --key 4f29...</span>
        </div>

        {/* Output list */}
        <div className="space-y-1.5 text-[var(--code-text)]">
          {[
            { id: "0x8f3a2c", sig: "b71e4d9a..." },
            { id: "0x4e91b7", sig: "c8a203f1..." },
            { id: "0x1d55e0", sig: "a4419b6c..." },
            { id: "0x6c00f2", sig: "e2d8a501..." },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <svg
                className="h-3.5 w-3.5 text-[var(--success)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-[var(--code-green)]">
                {item.id}
              </span>
              <span className="text-[var(--text-muted)]">→</span>
              <span className="text-[var(--code-text)]">{item.sig}</span>
            </div>
          ))}
        </div>

        {/* Receipt chain */}
        <div className="my-6 flex items-center gap-2">
          {receipts.map((hash, index) => (
            <React.Fragment key={hash}>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-7 w-12 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[11px] font-medium text-[var(--code-green)]">
                  {hash}
                </div>
              </div>
              {index < receipts.length - 1 && (
                <span className="h-px w-5 bg-[var(--border-strong)]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
          <span className="rounded-[var(--radius-sm)] bg-[var(--success-bg)] px-2 py-1 text-[11px] font-medium text-[var(--success)]">
            Chain OK • bit-exact
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            ed25519 + merkle append-log
          </span>
        </div>
      </div>
    </div>
  );
}
