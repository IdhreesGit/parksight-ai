import React from 'react';
import {
  ShieldCheck,
  EyeOff,
  Lock,
  Cpu,
  Database,
  CheckCircle2,
  Camera,
} from 'lucide-react';

export const PrivacyView: React.FC = () => {
  const privacyPillars = [
    {
      title: 'Vehicle-Centric Object Detection',
      icon: EyeOff,
      color: 'text-cyan-400',
      tag: 'Zero Biometrics',
      desc: 'The neural detection backbone is trained strictly on vehicle classes (car, truck, SUV, motorcycle, bus). Bounding box inference intentionally ignores pedestrian facial geometry and personal identifiers.',
    },
    {
      title: 'Automated Edge License Plate Masking',
      icon: Lock,
      color: 'text-indigo-400',
      tag: 'Pre-Storage Redaction',
      desc: 'License plates are automatically detected and replaced with synthetic masked hashes (e.g. SIM-***42 or REAL-***88) in volatile RAM at the edge before any telemetry packet reaches persistent storage or cloud APIs.',
    },
    {
      title: 'Overhead Vantage & Zero Facial Recognition',
      icon: Camera,
      color: 'text-amber-400',
      tag: 'Optical Constraint',
      desc: 'Cameras are mounted at steep 45° overhead angles to capture vehicle roofs and bay floor markers. Optical angles make facial recognition mathematically unfeasible and policy strictly prohibits biometric profiling.',
    },
    {
      title: 'Edge Processing Architecture',
      icon: Cpu,
      color: 'text-emerald-400',
      tag: 'Local Air-Gap Ready',
      desc: 'Designed for on-device inference using industrial edge accelerators (NVIDIA Jetson Orin / Intel OpenVINO). Video frames are decoded, inferred, and discarded locally without streaming raw video outside the parking deck.',
    },
    {
      title: 'Strict Data Minimization',
      icon: Database,
      color: 'text-teal-400',
      tag: 'GDPR / CCPA Compliant',
      desc: 'Only lightweight anonymous metadata is persisted (e.g. { bayId: "A3", status: "occupied", timestamp: 1726485000 }). Raw optical footage is ephemeral and never written to disk.',
    },
    {
      title: 'Human Dispute Redaction',
      icon: ShieldCheck,
      color: 'text-purple-400',
      tag: 'Audited Resolution',
      desc: 'When drivers dispute a bay occupancy status, dispute tickets do not retain driver telemetry, phone numbers, or GPS traces beyond the selected bay ID and timestamp.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Privacy by Design &amp; Edge Architecture
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              ZERO BIOMETRICS MANDATE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Built from the ground up to protect driver privacy, anonymize license plates, minimize data storage, and prioritize edge processing.
          </p>
        </div>
      </div>

      {/* 6 Privacy Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {privacyPillars.map((pillar) => (
          <div
            key={pillar.title}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl bg-slate-950 border border-slate-800 ${pillar.color}`}>
                  <pillar.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {pillar.tag}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm">{pillar.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Architecturally Enforced</span>
            </div>
          </div>
        ))}
      </div>

      {/* Edge Processing Comparison Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Edge Processing vs Traditional Cloud Streaming</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-rose-950/60 space-y-2">
            <div className="flex items-center justify-between text-rose-400 font-bold">
              <span>Traditional Cloud CCTV (High Risk)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">DEPRECATED</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li>&times; Streams gigabytes of unencrypted live video over public WAN</li>
              <li>&times; Centralizes vulnerable facial and vehicle footage in cloud buckets</li>
              <li>&times; Introduces 500ms - 2000ms network roundtrip latency</li>
              <li>&times; Fails completely when internet connection experiences outages</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-950/60 space-y-2">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>ParkSight Edge Model (Privacy First)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">RECOMMENDED</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>&check; Inferences locally on NVIDIA Jetson / Intel edge hardware</li>
              <li>&check; Video discarded immediately after 640x360 frame processing</li>
              <li>&check; Only sends 15-byte JSON telemetry (e.g. bayId, vacant)</li>
              <li>&check; 100% offline operational resilience during internet downtime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
