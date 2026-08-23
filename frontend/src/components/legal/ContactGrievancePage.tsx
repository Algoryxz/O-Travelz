import React, { useState } from "react";
import { Mail, Shield, CheckCircle2, ArrowLeft, Send, MapPin } from "lucide-react";

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
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300 text-[#12161E]"
    >
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          data-testid="contact-back-btn"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#B87B22] hover:text-[#A0691B] transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Back to Travel Hub</span>
        </button>
      )}

      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-[#B87B22]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#B87B22] font-mono">
            RESPONSIBLE COMMUNICATION &amp; REDRESSAL
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#12161E]">
          Contact &amp; Grievance Redressal
        </h1>
        <p className="text-xs sm:text-sm text-[#3D4654] leading-relaxed max-w-2xl">
          Under the Digital Personal Data Protection Act, 2023, O-Travelz provides a dedicated grievance redressal and feedback channel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info Card */}
        <div className="space-y-4 md:col-span-1">
          <div className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] space-y-4 shadow-xs">
            <h3 className="text-sm font-serif font-bold text-[#12161E]">
              Grievance Officer Information
            </h3>

            <div className="space-y-3 text-xs text-[#3D4654]">
              <div className="flex items-start gap-2.5">
                <Shield size={16} className="text-[#B87B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#12161E] block">Officer:</span>
                  <span>Punam &amp; Algoryxz Support Desk</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail size={16} className="text-[#B87B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#12161E] block">Official Email:</span>
                  <span className="font-mono text-[#B87B22]">grievance@o-travelz.in</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#B87B22] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-[#12161E] block">Location:</span>
                  <span>Bhubaneswar, Odisha 751024</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5DFD5] text-[11px] text-[#70798B] leading-relaxed">
              Inquiries regarding personal data rights under the DPDP Act 2023 receive written acknowledgment within 48 hours.
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2">
          <div className="p-6 sm:p-7 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xs space-y-5">
            <h3 className="text-base font-serif font-bold text-[#12161E]">
              Submit Grievance or Travel Feedback
            </h3>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#FFFFFF] text-[#2F523E] flex items-center justify-center border border-[#E5DFD5]">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-base font-serif font-bold text-[#12161E]">
                  Message Received
                </h4>
                <p className="text-xs text-[#70798B] max-w-sm mx-auto leading-relaxed">
                  Thank you for contacting O-Travelz. Your inquiry has been registered with our team in Bhubaneswar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#12161E]">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Priyaranjan Jena"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] text-xs text-[#12161E] focus:outline-none focus:border-[#B87B22]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#12161E]">
                      Email Address <span className="text-[#B87B22]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. user@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] text-xs text-[#12161E] focus:outline-none focus:border-[#B87B22]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#12161E]">
                    Message / Grievance Details <span className="text-[#B87B22]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your inquiry, data request, or grievance..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5DFD5] bg-[#FAF7F2] text-xs text-[#12161E] focus:outline-none focus:border-[#B87B22]"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#B87B22] hover:bg-[#A0691B] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Submit Grievance or Travel Feedback</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
