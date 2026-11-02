'use client'

import Image from 'next/image'
import { DitherPortrait } from './DitherPortrait'
import type { TeamMember, TeamSettings } from '@/types/content'

/**
 * The crew plate. Structure follows the reference ID card exactly: agency
 * strip, name block, portrait beside a spec column, authorisation paragraph,
 * and a property footer. Every row on it carries real information: the card
 * is a record, not a frame around a headshot.
 *
 * Everything printed on the plate is in the instrument voice (mono, lowercase,
 * untracked) at 12px or more, so the card reads as one engraved object rather
 * than a block of tracked capitals. The member's hue is the only colour on it,
 * mixed in OKLCH so every crew colour lands at the same lightness.
 */
export function IdCard({
  member,
  index,
  total,
  copy,
}: {
  member: TeamMember
  index: number
  total: number
  copy: TeamSettings
}) {
  const accent = `oklch(80% 0.12 ${member.hue})`
  const line = `oklch(80% 0.12 ${member.hue} / 0.28)`

  return (
    <article
      className="relative w-[min(84vw,25rem)] overflow-hidden rounded-[6px] border bg-void-2 select-none"
      style={{
        borderColor: line,
        color: accent,
        boxShadow: 'var(--shadow-lift)',
      }}
    >
      <div className="scanlines pointer-events-none absolute inset-0 z-30 opacity-30" aria-hidden="true" />
      {/* a sheen across the laminate, from the same upper-left key as the portrait */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: `linear-gradient(135deg, oklch(98% 0.01 ${member.hue} / 0.07), transparent 42%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 p-4">
        {/* ---- agency strip ---------------------------------------- */}
        <div className="flex items-center justify-between border-b pb-2.5" style={{ borderColor: line }}>
          <span className="font-display text-sm font-extrabold">
            <span className="font-mono font-normal opacity-60">株式</span> {copy.agency}
          </span>
          <span className="readout opacity-70">signal low</span>
          <span className="flex items-end gap-[2px]" aria-hidden="true">
            {[0, 1, 2, 3].map((bar) => (
              <span
                key={bar}
                className="w-1.5"
                style={{ height: 4 + bar * 2, background: accent, opacity: bar < 3 ? 1 : 0.25 }}
              />
            ))}
          </span>
        </div>

        {/* ---- name block ------------------------------------------ */}
        <div className="flex items-end justify-between gap-4 pt-3">
          <h3 className="font-display text-[1.6rem] leading-none font-extrabold tracking-[-0.02em]">
            {member.name}
          </h3>
          <p className="readout shrink-0 text-right">
            <span className="block opacity-60">access</span>
            <span aria-label="redacted">{'*'.repeat(8)}</span>
          </p>
        </div>

        {/* ---- portrait + spec column ------------------------------ */}
        <div className="mt-3.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-3.5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] border" style={{ borderColor: line }}>
            {member.imageUrl ? (
              <Image
                src={member.imageUrl}
                alt={member.name}
                fill
                sizes="(max-width: 640px) 42vw, 12rem"
                className="object-cover contrast-125 grayscale"
              />
            ) : (
              <DitherPortrait hue={member.hue} seed={member._id} />
            )}
            <div
              className="pointer-events-none absolute inset-0 mix-blend-color"
              style={{ background: accent, opacity: 0.35 }}
              aria-hidden="true"
            />
          </div>

          <dl className="readout space-y-2">
            <Row label="role" value={member.role} line={line} />
            <Row label="sec code" value={member.serial} line={line} />
            {member.specs.map((spec) => (
              <Row key={spec.label} label={spec.label} value={spec.value} line={line} />
            ))}
            <Row label="clearance" value={member.clearance} line={line} />
            <Row label="active since" value={member.since} line={line} />
            <p className="pt-1 font-body text-sm opacity-85">{member.jp}</p>
          </dl>
        </div>

        {/* ---- authorisation --------------------------------------- */}
        <p className="readout mt-3.5 border-t pt-3 leading-[1.6] opacity-80" style={{ borderColor: line }}>
          {copy.authorisation}
        </p>

        {/* ---- footer ---------------------------------------------- */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-2.5" style={{ borderColor: line }}>
          <span className="readout opacity-70">
            {String(index + 1).padStart(2, '0')} of {String(total).padStart(2, '0')}
          </span>
          {/* barcode: a printed code, not a count */}
          <span
            className="h-4 w-[34%]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, ${accent} 0 2px, transparent 2px 3px, ${accent} 3px 4px, transparent 4px 6px, ${accent} 6px 7px, transparent 7px 9px)`,
              opacity: 0.85,
            }}
            aria-hidden="true"
          />
          <span className="readout opacity-70">{copy.cardFooter}</span>
        </div>
      </div>
    </article>
  )
}

function Row({ label, value, line }: { label: string; value: string; line: string }) {
  return (
    <div className="flex justify-between gap-2 border-b pb-1.5" style={{ borderColor: line }}>
      <dt className="shrink-0 opacity-60">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
