import React from "react";
import { Link } from "react-router-dom";
import { Shield, Scale, Mail, AlertTriangle, ArrowLeft } from "lucide-react";

export const Legal: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 p-6 md:p-12 font-sans selection:bg-blue-500/30 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight flex items-center gap-4">
            <Scale className="w-10 h-10 text-blue-500" />
            Legal & DMCA Policy
          </h1>
          <p className="text-xl text-slate-400">
            Platform terms of service and copyright compliance information.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1: Aggregator Status */}
          <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-500" />
              1. Platform Status & Neutral Aggregation
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                JanataTv is a media player and directory service. The platform
                functions purely as a neutral search engine and aggregator of
                publicly available streaming links (such as M3U/M3U8 playlists)
                found on the internet.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-300 font-medium">
                <li>We <strong>do not</strong> host any video files on our servers.</li>
                <li>We <strong>do not</strong> re-broadcast, re-encode, or transmit streams.</li>
                <li>We <strong>do not</strong> strip, alter, or remove advertisements embedded in FAST streams by the original broadcasters.</li>
                <li>We <strong>do not</strong> bypass geographical DRM locks automatically. Any proxy usage is an explicit, client-side action taken entirely at the user's discretion.</li>
              </ul>
              <p>
                All media content is loaded directly from third-party servers to
                the user's browser. We have no control over the content broadcasted
                by these third-party networks.
              </p>
            </div>
          </section>

          {/* Section 2: DMCA Takedown Policy */}
          <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              2. DMCA Takedown Policy
            </h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                We respect the intellectual property rights of others and comply
                with the Digital Millennium Copyright Act (DMCA). Although we do
                not host any infringing content, we will promptly remove any links
                or directories pointing to unauthorized streams upon receiving a
                valid DMCA notice.
              </p>
              <p className="text-white font-medium mt-6 mb-2">
                If you are a copyright owner or an authorized agent thereof, please
                submit a takedown request containing the following information:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm bg-black/30 p-6 rounded-xl border border-white/5">
                <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the copyright.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the material that is claimed to be infringing (specifically, the exact M3U link or channel name listed in our directory).</li>
                <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address.</li>
                <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
                <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
              </ol>
            </div>
          </section>

          {/* Section 3: Contact */}
          <section className="bg-blue-950/20 p-8 rounded-2xl border border-blue-900/30">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-400" />
              3. Submit a Notice
            </h2>
            <p className="text-slate-400 mb-6">
              Please send all formal DMCA takedown requests to our designated legal team.
              We will process requests and remove the offending links from our registry within 48 hours.
            </p>
            <div className="inline-flex items-center gap-3 bg-blue-950/50 px-6 py-4 rounded-xl border border-blue-800/50">
              <Mail className="w-5 h-5 text-blue-400" />
              <a href="mailto:dmca@janatatv.in" className="text-white font-bold text-lg hover:underline">
                dmca@janatatv.in
              </a>
            </div>
          </section>
        </div>
        
        <div className="mt-12 text-center text-slate-600 text-sm">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
