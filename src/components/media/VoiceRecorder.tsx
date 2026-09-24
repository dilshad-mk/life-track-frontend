import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';
import { MediaAttachment } from '../../types';

interface VoiceRecorderProps {
  attachment?: MediaAttachment;
  onSave: (attachment: MediaAttachment) => void;
  onDelete?: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  attachment,
  onSave,
  onDelete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  const getSupportedMimeType = (): string | undefined => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
      'audio/wav',
    ];
    for (const t of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return undefined;
  };

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone recording not supported on this browser context.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const actualType = mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualType });

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const duration = recordingDuration || 1;
          const newAtt: MediaAttachment = {
            id: `voice_${Date.now()}`,
            type: 'audio',
            url: base64Audio,
            duration: duration,
            name: `Voice note (${duration}s)`,
            createdAt: new Date().toISOString(),
          };
          onSave(newAtt);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks to free microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // chunk every 200ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission or hardware issue:', err);
      setErrorMessage(
        err?.message?.includes('Permission')
          ? 'Microphone permission denied. Please allow microphone in browser settings.'
          : 'Could not access microphone on this device.'
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!attachment?.url) return;

    if (!audioElementRef.current) {
      const audio = new Audio(attachment.url);
      audioElementRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackTime(0);
      };

      audio.ontimeupdate = () => {
        setPlaybackTime(Math.floor(audio.currentTime));
      };
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio playback failed', e);
        setIsPlaying(false);
      });
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>Voice Note (Tap to Record)</span>
        </label>
      </div>

      {/* Record button when idle and no attachment */}
      {!attachment && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium active:scale-95 transition-all w-fit shadow-sm"
        >
          <Mic className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Tap to Record Voice</span>
        </button>
      )}

      {/* Recording in progress banner */}
      {isRecording && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Recording... {formatSeconds(recordingDuration)}
            </span>
            <div className="flex items-center gap-0.5 ml-2">
              <span className="w-0.5 h-3 bg-rose-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <span className="w-0.5 h-5 bg-rose-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <span className="w-0.5 h-4 bg-rose-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-0.5 h-6 bg-rose-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md active:scale-95"
          >
            <Square className="w-3 h-3 fill-white" />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* Playback Preview when attachment is present */}
      {attachment && !isRecording && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 active:scale-95 shadow-md shadow-indigo-600/30 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                  {attachment.name || 'Voice Note'}
                </span>
                <span className="font-mono">
                  {formatSeconds(isPlaying ? playbackTime : attachment.duration || 0)}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{
                    width: `${
                      attachment.duration && attachment.duration > 0
                        ? Math.min(100, (playbackTime / attachment.duration) * 100)
                        : 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
              title="Delete audio note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
