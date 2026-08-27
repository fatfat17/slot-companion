"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { machines } from "@/data/machines";

export default function IdentifyPage() {
  const [preview, setPreview] = useState<string>();
  const [recognized, setRecognized] = useState(false);
  const machine = machines[0];
  function pickImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setPreview(URL.createObjectURL(file));
    setRecognized(true);
  }
  return (
    <>
      <PageHeader title="拍機台" eyebrow="Mock Recognition" />
      <main className="page pt-5!">
        <div className="notice mb-4">本功能只會在你的裝置上預覽照片，辨識結果固定為示範資料，不會上傳圖片。</div>
        <label className={`photo-picker ${preview ? "has-photo" : ""}`}>
          {preview ? <div className="photo-preview" style={{ backgroundImage: `url(${preview})` }} /> : <><span>📷</span><strong>選擇或拍攝機台照片</strong><small>點一下開啟相機／相簿</small></>}
          <input type="file" accept="image/*" capture="environment" onChange={pickImage} />
        </label>
        {recognized && (
          <section className="section result-card">
            <div className="result-label"><span>MOCK 辨識結果</span><b>示範</b></div>
            <h2>{machine.nameZh}</h2><p className="ja">{machine.nameJa}</p>
            <div className="result-meta"><span>{machine.manufacturer}</span><span>{machine.category}</span></div>
            <Link href={`/machines/${machine.id}`} className="primary-button mt-5">✓ 就是這台</Link>
            <Link href="/machines" className="secondary-button mt-2">⌕ 不是這台，手動選</Link>
          </section>
        )}
      </main>
    </>
  );
}
