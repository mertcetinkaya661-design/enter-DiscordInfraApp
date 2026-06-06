import { useState, type KeyboardEvent } from 'react';
import { Plus, Gift, Sticker, Smile, Send } from 'lucide-react';

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
}

export default function MessageInput({ channelName, onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

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
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-end gap-2 rounded-lg bg-dc-input px-4 py-2">
        {/* Attachment button */}
        <button className="mb-1 flex-shrink-0 text-dc-muted-fg transition-colors hover:text-dc-text-primary">
          <Plus className="h-5 w-5" />
        </button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`#${channelName} kanalına mesaj gönder`}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-dc-text-primary placeholder:text-dc-muted-fg focus:outline-none"
          style={{ maxHeight: '120px', minHeight: '22px' }}
        />

        <div className="mb-1 flex flex-shrink-0 items-center gap-1">
          <button className="text-dc-muted-fg transition-colors hover:text-dc-text-primary">
            <Gift className="h-5 w-5" />
          </button>
          <button className="text-dc-muted-fg transition-colors hover:text-dc-text-primary">
            <Sticker className="h-5 w-5" />
          </button>
          <button className="text-dc-muted-fg transition-colors hover:text-dc-text-primary">
            <Smile className="h-5 w-5" />
          </button>
          {value.trim() && (
            <button
              onClick={handleSend}
              className="flex h-7 w-7 items-center justify-center rounded bg-fox-500 text-white transition-colors hover:bg-fox-600"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
