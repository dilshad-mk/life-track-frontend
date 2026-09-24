import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, ExternalLink, Copy, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../../context/AppContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(window.location.origin);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('App URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open on Mobile (Samsung S23)" maxWidth="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200 mb-4">
          {url ? (
            <QRCodeSVG value={url} size={180} level="H" includeMargin={false} />
          ) : (
            <div className="w-[180px] h-[180px] bg-slate-100 flex items-center justify-center text-slate-400">
              Loading QR...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-1">
          <Smartphone className="w-4 h-4" />
          <span>Point your Phone Camera to Scan</span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Open your Samsung S23 camera or QR scanner. Make sure your phone and laptop are connected to the same Wi-Fi network.
        </p>

        {/* URL Pill and Copy Button */}
        <div className="flex items-center gap-2 w-full p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-4">
          <span className="text-xs font-mono text-slate-300 truncate flex-1 text-left px-1">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 active:scale-95 transition-all"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Tip for Add to Home Screen */}
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-left w-full">
          <p className="text-[11px] text-indigo-300 leading-snug">
            💡 <strong>Native App Feel:</strong> Once opened in Samsung Internet or Chrome, tap <strong>Menu (⋮) → "Install app"</strong> or <strong>"Add to Home screen"</strong> to run it full-screen just like a native app!
          </p>
        </div>
      </div>
    </Modal>
  );
};
