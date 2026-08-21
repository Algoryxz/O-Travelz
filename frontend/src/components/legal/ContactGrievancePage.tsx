import React, { useState } from "react";
import { Mail, MessageSquare, Shield, CheckCircle2, ArrowLeft, Send, MapPin, Phone } from "lucide-react";

interface LegalPageProps {
  onBack?: () => void;
}

export const ContactGrievancePage: React.FC<LegalPageProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Grievance / Feedback",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.message.trim()) return;
    setSubmitted(true);
  };

  return (
    <main
      data-testid="contact-grievance-page"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-white"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="contact-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#14B8A6]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] font-mono">
            RESPONSIBLE COMMUNICATION &amp; REDRESSAL
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Contact &amp; Grievance Redressal
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
          Under the Digital Personal Data Protection Act, 2023, O-Travelz provides a dedicated grievance redressal and feedback channel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="space-y-4 md:col-span-1">
          <div className="p-5 rounded-2xl bg-[#172235] border border-[#263244] space-y-4">
            <h3 className="text-sm font-bold text-white font-display">
              Grievance Officer Information
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Shield size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Officer:</span>
                  <span>Punam &amp; Algoryxz Support Desk</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Official Email:</span>
                  <span className="font-mono text-teal-300">grievance@o-travelz.in</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Location:</span>
                  <span>Bhubaneswar, Odisha 751024</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#263244] text-[11px] text-slate-400 leading-relaxed">
              Inquiries regarding personal data rights, corrections, or erasure requests under the DPDP Act 2023 receive written acknowledgment within 48 hours.
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#111827] border border-[#263244] shadow-xl space-y-5">
            <h3 className="text-base font-bold font-display text-white">
              Submit Grievance or Travel Feedback
            </h3>

            {submitted ? (
              <div
                data-testid="contact-success-msg"
                className="p-6 rounded-2xl bg-teal-950/60 border border-teal-500/40 text-teal-200 text-center space-y-2"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <CheckCircle2 size={22} />
                </div>
                <h4 className="font-bold text-white text-sm">Message Submitted Successfully</h4>
                <p className="text-xs text-teal-300 max-w-sm mx-auto">
                  Thank you for contacting O-Travelz. Your inquiry has been routed to the Grievance &amp; Product team in Bhubaneswar.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "Grievance / Feedback", message: "" });
                  }}
                  className="mt-3 text-xs text-white underline font-semibold cursor-pointer"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-300">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyaranjan Dash"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#0B1220] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-300">
                      Email Address <span className="text-[#14B8A6]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#0B1220] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-300">
                    Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#0B1220] text-xs text-white focus:outline-none focus:border-[#14B8A6]"
                  >
                    <option value="Grievance / Feedback">General Feedback &amp; Suggestions</option>
                    <option value="Data Privacy Inquiry">Data Privacy / DPDP Act Inquiry</option>
                    <option value="Destination Fact Correction">Destination Fact or Coordinate Correction</option>
                    <option value="Transit Information Update">Mo Bus / Transit Route Update</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-300">
                    Your Message <span className="text-[#14B8A6]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, grievance, or destination suggestion in detail..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#334155] bg-[#0B1220] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#14B8A6] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="contact-submit-btn"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={14} />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
