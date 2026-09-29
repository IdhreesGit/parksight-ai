import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  AlertOctagon,
  Info,
  CheckCircle2,
  Trash2,
  Flag,
  RotateCcw,
  Check,
  ShieldAlert,
  MessageSquare,
  ArrowRight,
  Radio,
  Zap,
} from 'lucide-react';
import { useParking } from '../../context/ParkingContext';
import { fetchFeedbackList, resolveFeedbackItem } from '../../services/api';
import { StatusFeedback } from '../../types';

interface AlertsViewProps {
  onNavigate?: (route: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onNavigate }) => {
  const { alerts, markAlertAsRead, clearAlertById, anomalyStatus, openFeedbackModal, simulation } = useParking();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [feedbackList, setFeedbackList] = useState<StatusFeedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);

  const loadFeedback = () => {
    setFeedbackLoading(true);
    fetchFeedbackList()
      .then((data) => {
        setFeedbackList(data.feedback);
        setFeedbackLoading(false);
      })
      .catch((e) => {
        console.error('Feedback list load error:', e);
        setFeedbackLoading(false);
      });
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleResolveFeedback = async (id: string) => {
    await resolveFeedbackItem(id, 'Verified and resolved by parking operations attendant.');
    loadFeedback();
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-cyan-400" />
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Rule-Based Anomaly Detection &amp; Operations Dispatch
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                anomalyStatus === 'Normal'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : anomalyStatus === 'Warning'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}
            >
              System State: {anomalyStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Threshold-based anomaly flags: occupancy surges, sensor chatter, EV infrastructure violations, and human status disputes.
          </p>
        </div>

        {/* Diagnostic Scenarios Triggers */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => simulation.setScenario('camera_failure')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Inject simulated optical camera feed drop"
          >
            Test Camera Drop
          </button>
          <button
            onClick={() => simulation.setScenario('unusual_spike')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Inject sudden occupancy surge (>15%)"
          >
            Test Occupancy Surge
          </button>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs gap-1 max-w-sm">
        {(['all', 'critical', 'warning', 'info'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeverity(s)}
            className={`flex-1 py-1.5 rounded-xl font-semibold capitalize transition-all text-center ${
              filterSeverity === s
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Main Two-Column Layout: Active Alerts with Explanations + Human Feedback Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts List (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Alerts &amp; Anomaly Rules ({filteredAlerts.length})
            </h2>
            <span className="text-[10px] text-slate-500 font-mono">
              MATHEMATICAL RULE ENGINE
            </span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Zero Active Trigger Events</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No sensor occlusions, occupancy spikes, or parking violations match the selected severity filter.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const isCritical = alert.severity === 'critical';
                const isWarning = alert.severity === 'warning';
                const exp = alert.anomalyExplanation;

                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.isRead ? 'opacity-70' : 'opacity-100'
                    } ${
                      isCritical
                        ? 'bg-rose-950/20 border-rose-800/60'
                        : isWarning
                        ? 'bg-amber-950/20 border-amber-800/60'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-400'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {isCritical ? (
                            <AlertOctagon className="w-4 h-4" />
                          ) : isWarning ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm">{alert.title}</span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                isCritical
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : isWarning
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            {alert.bayId && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                                BAY {alert.bayId}
                              </span>
                            )}
                            <span className="text-[9px] text-slate-500 font-mono">
                              Source: {alert.source || 'Rule-based Anomaly Engine'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                          {/* Review 2 Mandatory Explanation Box: WHAT HAPPENED, WHY IT WAS FLAGGED, WHAT THE SYSTEM RECOMMENDS */}
                          {exp ? (
                            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                              <div>
                                <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider text-rose-300 block mb-0.5">
                                  What Happened:
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">{exp.whatHappened}</p>
                              </div>

                              <div>
                                <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider text-amber-300 block mb-0.5">
                                  Why It Was Flagged:
                                </span>
                                <p className="text-slate-400 text-[11px] leading-relaxed">{exp.whyFlagged}</p>
                              </div>

                              <div>
                                <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider text-emerald-300 block mb-0.5">
                                  What The System Recommends:
                                </span>
                                <p className="text-slate-300 text-[11px] leading-relaxed">{exp.recommendedAction}</p>
                              </div>

                              {exp.detectionRule && (
                                <div className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                                  Rule ID: {exp.detectionRule} &bull; Observed: {exp.metricObserved || alert.anomalyDetails?.observedValue}
                                </div>
                              )}
                            </div>
                          ) : (
                            alert.anomalyDetails && (
                              <div className="mt-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                                <div className="flex justify-between text-slate-400">
                                  <span>Observed Metric:</span>
                                  <span className="font-mono text-amber-400">{alert.anomalyDetails.observedValue}</span>
                                </div>
                                <div className="flex justify-between text-slate-400">
                                  <span>Expected Threshold:</span>
                                  <span className="font-mono text-slate-300">{alert.anomalyDetails.expectedRange}</span>
                                </div>
                                <p className="text-[11px] text-slate-500 pt-1 italic">{alert.anomalyDetails.reason}</p>
                              </div>
                            )
                          )}

                          <div className="text-[10px] text-slate-500 font-mono mt-2">
                            Detected: {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onNavigate && (
                          <button
                            onClick={() => onNavigate('detection')}
                            title="Inspect in Computer Vision workspace"
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 flex items-center gap-1 transition-colors"
                          >
                            <span>CV Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {!alert.isRead && (
                          <button
                            onClick={() => markAlertAsRead(alert.id)}
                            title="Acknowledge alert"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => clearAlertById(alert.id)}
                          title="Dismiss alert"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Human Feedback Queue (1 Column) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Human Dispute Reports ({feedbackList.length})</span>
            </h3>
            <button
              onClick={() => openFeedbackModal()}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              + Dispute Status
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When drivers or attendants dispute bay status, reports enter this queue for operational review and classifier recalibration.
            </p>

            {feedbackLoading ? (
              <p className="text-slate-500 text-xs">Retrieving feedback logs...</p>
            ) : feedbackList.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 text-center text-slate-500 text-[11px]">
                No disputed bay records filed.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {feedbackList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-200">BAY {item.bayId}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          item.resolved
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {item.resolved ? 'RESOLVED' : 'PENDING REVIEW'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300">
                      Reported: <strong className="capitalize text-white">{item.reportedStatus}</strong> (System registered: {item.actualObservedStatus})
                    </div>

                    {item.comment && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2 rounded-lg border border-slate-800/60">
                        &ldquo;{item.comment}&rdquo;
                      </p>
                    )}

                    {item.resolutionNotes && (
                      <div className="text-[10px] text-emerald-400/90 font-medium pt-1">
                        Resolution: {item.resolutionNotes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[9px] text-slate-500">
                      <span className="font-mono">{new Date(item.submittedAt).toLocaleTimeString()}</span>
                      {!item.resolved && (
                        <button
                          onClick={() => handleResolveFeedback(item.id)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                        >
                          Resolve &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
