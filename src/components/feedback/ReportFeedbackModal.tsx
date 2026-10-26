import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export const ReportFeedbackModal: React.FC = () => {
  const {
    isFeedbackModalOpen,
    feedbackTargetBay,
    closeFeedbackModal,
    submitFeedback,
    bays,
  } = useParking();
  const [reportedStatus, setReportedStatus] = useState<'available' | 'occupied'>('occupied');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isFeedbackModalOpen) return null;

  const targetBay = feedbackTargetBay ?? bays[0] ?? null;

  const handleClose = () => {
    closeFeedbackModal();
    setError('');
    setSuccess(false);
    setComment('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!targetBay) {
      setError('No parking space is selected. Please select a bay and try again.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await submitFeedback(targetBay.id, reportedStatus, comment.trim() || undefined);
      setSuccess(true);
    } catch {
      setError('The report could not be submitted. Please check the connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="feedback-title" className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-amber-500/10 p-2 text-amber-300"><AlertTriangle className="h-5 w-5" /></span>
            <div>
              <h2 id="feedback-title" className="text-lg font-semibold text-white">Report parking status</h2>
              <p className="mt-1 text-sm text-slate-400">Help improve the parking data by reporting an incorrect status.</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close feedback" className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
            <div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5" /> Report submitted</div>
            <p className="mt-2 text-sm text-emerald-100/80">Thank you. Your feedback has been recorded by the prototype.</p>
            <button type="button" onClick={handleClose} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
              Parking space: <strong className="text-white">{targetBay?.id ?? 'No bay selected'}</strong>
            </div>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium text-slate-200">What is the correct status?</legend>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200 hover:border-cyan-500/60">
                <input type="radio" name="reportedStatus" value="available" checked={reportedStatus === 'available'} onChange={() => setReportedStatus('available')} /> Available
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 p-3 text-sm text-slate-200 hover:border-cyan-500/60">
                <input type="radio" name="reportedStatus" value="occupied" checked={reportedStatus === 'occupied'} onChange={() => setReportedStatus('occupied')} /> Occupied
              </label>
            </fieldset>
            <label className="block text-sm font-medium text-slate-200">
              Additional details (optional)
              <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={500} rows={3} placeholder="Describe what you observed..." className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none" />
            </label>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleClose} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
              <button type="submit" disabled={submitting || !targetBay} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit report'}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
