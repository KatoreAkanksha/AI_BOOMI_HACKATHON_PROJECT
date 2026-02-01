import React from 'react';

interface AssessmentDashboardProps {
    scores: {
        anxiety: number;
        depression: number;
        stress: number;
    };
}

const AssessmentDashboard: React.FC<AssessmentDashboardProps> = ({ scores }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-[#111C44]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-[#0075FF] to-[#00E0FF] bg-clip-text text-transparent">
                Your Wellness Analysis
            </h2>

            <div className="space-y-10">
                {/* Anxiety Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wider text-slate-400">
                        <span>Anxiety Score</span>
                        <span className="text-white text-lg">{scores.anxiety}</span>
                    </div>
                    <div className="h-4 w-full bg-[#1A1F37] rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#0075FF] to-[#00E0FF] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,117,255,0.5)]"
                            style={{ width: `${scores.anxiety}%` }}
                        />
                    </div>
                </div>

                {/* Depression Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wider text-slate-400">
                        <span>Depression Score</span>
                        <span className="text-white text-lg">{scores.depression}</span>
                    </div>
                    <div className="h-4 w-full bg-[#1A1F37] rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#7551FF] to-[#B794FF] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(117,81,255,0.5)]"
                            style={{ width: `${scores.depression}%` }}
                        />
                    </div>
                </div>

                {/* Stress Bar */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold uppercase tracking-wider text-slate-400">
                        <span>Stress Score</span>
                        <span className="text-white text-lg">{scores.stress}</span>
                    </div>
                    <div className="h-4 w-full bg-[#1A1F37] rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#FF5151] to-[#FF9494] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,81,81,0.5)]"
                            style={{ width: `${scores.stress}%` }}
                        />
                    </div>
                </div>
            </div>

            <p className="mt-10 text-center text-xs text-slate-500 italic">
                Scores are calculated directly by ML probabilities (0-100).
            </p>
        </div>
    );
};

export default AssessmentDashboard;
