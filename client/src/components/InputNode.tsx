import { Handle, Position } from '@xyflow/react';
import { useState, useEffect, type ChangeEvent } from 'react';
import { MessageSquarePlus, Mic, MicOff } from 'lucide-react';
import { NodeCard, NodeHeader } from './NodeCard';

interface InputNodeProps {
  data: {
    label: string;
    value: string;
    onChange: (evt: ChangeEvent<HTMLTextAreaElement> | { target: { value: string } }) => void;
  };
}

export function InputNode({ data }: InputNodeProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newValue = data.value ? `${data.value} ${transcript}` : transcript;
        data.onChange({ target: { value: newValue } });
        setIsListening(false);
      };

      recog.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [data]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <NodeCard id="input-node" className="w-[300px] md:w-[380px]">
      <NodeHeader 
        icon={<MessageSquarePlus className="w-4 h-4" />}
        title="Input Prompt"
        subtitle="User Request"
        action={
          <button
            onClick={toggleListening}
            className={`p-2 rounded-full transition-all ${
              isListening 
                ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400' 
                : 'bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200'
            }`}
            title="Voice Input"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
        }
      />

      {/* Body */}
      <div className="p-5">
        <div className="relative">
          <textarea
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-gray-700 text-sm leading-relaxed placeholder:text-gray-400 min-h-[120px]"
            value={data.value}
            onChange={data.onChange}
            placeholder="Enter your prompt here... (e.g., 'Write a haiku about coding')"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 font-medium bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm border border-gray-100">
            {data.value.length} chars
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-3.5 !h-3.5 !bg-indigo-600 !border-[3px] !border-white shadow-md transition-transform hover:scale-110" 
      />
    </NodeCard>
  );
}
