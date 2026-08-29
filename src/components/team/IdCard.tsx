'use client'

import Image from 'next/image'
import { DitherPortrait } from './DitherPortrait'
import type { TeamMember, TeamSettings } from '@/types/content'

/**
 * The crew plate. Structure follows the reference ID card exactly: agency
 * strip, name block, portrait beside a spec column, authorisation paragraph,
 * and a property footer. Every row on it carries real information — the card
 * is a record, not a frame around a headshot.
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
  const accent = `hsl(${member.hue} 78% 62%)`

  return (
    <article
      className="relative w-[min(84vw,25rem)] overflow-hidden border bg-[#05070a] font-mono select-none"
      style={{
        borderColor: accent,
        color: accent,
        boxShadow: `0 0 0 1px rgba(0,0,0,0.9), 0 0 60px -12px ${accent}, 0 40px 90px -40px #000`,
      }}
    >
      <div className="scanlines pointer-events-none absolute inset-0 z-30 opacity-45" aria-hidden="true" />

      <div className="relative z-10 p-3.5">
        {/* ---- agency strip ---------------------------------------- */}
        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${accent}55` }}>
          <span className="text-[0.72rem] font-bold tracking-[0.05em]">
            <span className="opacity-55">株式</span> {copy.agency}
          </span>
          <span className="label opacity-60">SIGNAL LOW</span>
          <span className="flex gap-[2px]" aria-hidden="true">
            {[0, 1, 2, 3].map((bar) => (
              <span key={bar} className="h-2.5 w-1.5" style={{ background: accent, opacity: bar < 3 ? 1 : 0.25 }} />
            ))}
          </span>
        </div>

        {/* ---- name block ------------------------------------------ */}
        <div className="flex items-start justify-between pt-2.5">
          <div>
            <p className="label opacity-55">OPERATOR</p>
            <h3 className="mt-0.5 text-[1.5rem] leading-none font-bold tracking-[0.02em]">{member.name}</h3>
          </div>
          <div className="text-right">
            <p className="label opacity-55">ACCESS</p>
            <p className="text-[0.85rem] tracking-[0.2em]">{'*'.repeat(8)}</p>
          </div>
        </div>

        {/* ---- portrait + spec column ------------------------------ */}
        <div className="mt-3 grid grid-cols-[1fr_1.05fr] gap-3">
          <div className="relative aspect-[4/5] overflow-hidden border" style={{ borderColor: `${accent}66` }}>
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

          <dl className="space-y-1.5 text-[0.7rem] leading-tight">
            <Row label="ROLE" value={member.role} />
            <Row label="SEC CODE" value={member.serial} />
            {member.specs.map((spec) => (
              <Row key={spec.label} label={spec.label} value={spec.value} />
            ))}
            <Row label="CLEARANCE" value={member.clearance} />
            <Row label="ACTIVE SINCE" value={member.since} />
            <p className="pt-1 text-[0.78rem] tracking-[0.08em] opacity-80">{member.jp}</p>
          </dl>
        </div>

        {/* ---- authorisation --------------------------------------- */}
        <p
          className="mt-3 border-t pt-2.5 text-[0.63rem] leading-[1.7] tracking-[0.02em] uppercase opacity-75"
          style={{ borderColor: `${accent}55` }}
        >
          {copy.authorisation}
        </p>

        {/* ---- footer ---------------------------------------------- */}
        <div
          className="mt-2.5 flex items-center justify-between border-t pt-2"
          style={{ borderColor: `${accent}55` }}
        >
          <span className="label opacity-55">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {/* barcode */}
          <span className="flex h-4 items-end gap-[1.5px]" aria-hidden="true">
            {Array.from({ length: 34 }, (_, i) => (
              <span
                key={i}
                style={{
                  width: (i * 7) % 3 === 0 ? 2 : 1,
                  height: '100%',
                  background: accent,
                  opacity: (i * 5) % 4 === 0 ? 0.25 : 0.9,
                }}
              />
            ))}
          </span>
          <span className="label opacity-55">{copy.cardFooter}</span>
        </div>
      </div>
    </article>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 border-b border-current/15 pb-1">
      <dt className="label shrink-0 opacity-50">{label}</dt>
      <dd className="text-right tracking-[0.02em]">{value}</dd>
    </div>
  )
}
