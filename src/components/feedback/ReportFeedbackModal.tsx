import React, { useState } from 'react';
import { Flag, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useParking } from '../../context/ParkingContext';

export const ReportFeedbackModal: React.FC = () => {
  const { isFeedbackModalOpen, closeFeedbackModal, feedbackTargetBay, submitFeedback } = useParking();
  const [reportedStatus, setReportedStatus] = useState<'available' | 'occupied'>('occupied');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isFeedbackModalOpen) return null;

  const currentStatus = feedbackTargetBay?.status || 'available';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackTargetBay) return;
    setIsSubmitting(true);
    try {
      await submitFeedback(feedbackTargetBay.id, reportedStatus, comment);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        closeFeedbackModal();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Dispute Bay Occupancy Status</h3>
              <p className="text-xs text-slate-400">
                Human-in-the-loop status correction {feedbackTargetBay ? `for Bay ${feedbackTargetBay.id}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={closeFeedbackModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-white text-base">Correction Logged</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              State updated in memory. This report is recorded in the model recalibration dispute log.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                Currently registered as <strong className="capitalize text-white">{currentStatus}</strong> in{' '}
                <span className="text-slate-200">{feedbackTargetBay?.section || 'Campus Deck'}</span>.
                Reporting overrides automated classification and records operator ground truth.
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                What is the actual observed state right now?
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReportedStatus('occupied')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs font-medium ${
                    reportedStatus === 'occupied'
                      ? 'border-rose-500 bg-rose-500/15 text-rose-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">Actually Occupied</div>
                  <div className="text-[11px] opacity-80">A vehicle is currently parked</div>
                </button>
                <button
                  type="button"
                  onClick={() => setReportedStatus('available')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs font-medium ${
                    reportedStatus === 'available'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold text-white mb-0.5">Actually Vacant</div>
                  <div className="text-[11px] opacity-80">The bay is empty &amp; available</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observation details (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="e.g. Dark vehicle parked across painted line, optical occlusion by concrete pillar..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Status Correction'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
