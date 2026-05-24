// ============================================================
// 청년톡톡 — React 19 + RAG 챗봇 + 정책 매칭
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
);

interface Message { id: string; role: 'user' | 'bot'; content: string; policy_refs?: string[]; }
interface Policy { id: string; title: string; organization: string; amount_summary: string; apply_deadline: string; }

// ── Chat hook ────────────────────────────────────────────────
function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at')
      .then(({ data }) => setMessages((data ?? []) as Message[]));
  }, [conversationId]);

  async function send(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setPending(true);

    // Supabase Edge Function: RAG 검색 + Solar LLM 응답
    const { data } = await supabase.functions.invoke('chat', {
      body: { conversation_id: conversationId, message: text },
    });

    const botMsg: Message = {
      id: crypto.randomUUID(),
      role: 'bot',
      content: data.reply,
      policy_refs: data.policy_refs,
    };
    setMessages((prev) => [...prev, botMsg]);
    setPending(false);
  }

  return { messages, pending, send };
}

// ── 매칭 정책 가져오기 ──────────────────────────────────────
async function getMatchedPolicies(): Promise<Policy[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.rpc('match_policies_for', { p_user: user.id });
  const ids = (data ?? []).filter((r: any) => r.score >= 0.7).map((r: any) => r.policy_id);
  const { data: policies } = await supabase.from('policies').select('*').in('id', ids);
  return (policies ?? []) as Policy[];
}

// ── Chatbot UI ───────────────────────────────────────────────
function ChatBot({ conversationId }: { conversationId: string }) {
  const { messages, pending, send } = useChat(conversationId);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
  }

  return (
    <main className="main">
      <div className="chat">
        {messages.map((m) => (
          <div key={m.id} className={`msg msg--${m.role}`}>
            <div className="msg__bubble">{m.content}</div>
          </div>
        ))}
        {pending && <div className="msg msg--bot"><div className="typing">···</div></div>}
        <div ref={endRef} />
      </div>
      <form className="composer" onSubmit={onSubmit}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="궁금한 정책을 물어보세요" />
        <button type="submit">↑ 전송</button>
      </form>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatBot conversationId="default" />} />
      </Routes>
    </BrowserRouter>
  );
}
