import { useState, type KeyboardEvent } from 'react';
import { Paperclip, Gift, Smile, Send, Mic } from 'lucide-react';

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
}

export default function MessageInput({ channelName, onSend }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="px-4 pb-5 pt-2">
      <div
        className={`flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
          focused
            ? 'bg-dc-input ring-1 ring-fox-500/40 shadow-lg shadow-fox-500/10'
            : 'bg-dc-input'
        }`}
      >
        {/* Attach */}
        <button className="mb-0.5 flex-shrink-0 text-dc-muted-fg transition-colors hover:text-fox-400">
          <Paperclip className="h-5 w-5" />
        </button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`${channelName} kanalına yaz...`}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-dc-text-primary placeholder:text-dc-muted-fg/60 focus:outline-none"
          style={{ maxHeight: '120px', minHeight: '22px' }}
        />

        <div className="mb-0.5 flex flex-shrink-0 items-center gap-1.5">
          <button className="text-dc-muted-fg transition-colors hover:text-fox-400">
            <Gift className="h-5 w-5" />
          </button>
          <button className="text-dc-muted-fg transition-colors hover:text-fox-400">
            <Smile className="h-5 w-5" />
          </button>

          {value.trim() ? (
            <button
              onClick={handleSend}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-fox-500 text-white shadow-md shadow-fox-500/30 transition-all hover:bg-fox-600 hover:shadow-fox-600/40 active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button className="text-dc-muted-fg transition-colors hover:text-fox-400">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      <p className="mt-1.5 px-2 text-[10px] text-dc-muted-fg/40">
        Enter ile gönder · Shift+Enter ile yeni satır
      </p>
    </div>
  );
}
