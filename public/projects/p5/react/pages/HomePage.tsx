/**
 * ChatPage — 청년 정책 챗봇 (메인)
 * ────────────────────────────────────────────────────────────
 * RAG 기반 챗봇 UI.
 * 사용자 메시지 → Solar LLM(정책 RAG 검색 포함) → 응답 + 정책 카드
 *
 * 컴포넌트 분해:
 *   - Sidebar: 최근 대화 + 프로필
 *   - ChatThread: 메시지 목록 (자동 스크롤)
 *   - Composer: 입력창 + 전송
 *   - PolicyCardInline: 봇 응답에 첨부되는 정책 카드
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendChat, fetchMessages } from '../supabase';
import type { Message } from '../types';

const CONVERSATION_ID = 'default';  // 실제로는 useParams 등으로 동적

const SUGGESTS = ['🏠 주거', '💼 취업·창업', '💰 금융·자산', '📚 교육·역량', '🏥 건강'];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [pending, setPending]   = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // ─── 초기 로드 ────────────────────────────────────────
  useEffect(() => {
    fetchMessages(CONVERSATION_ID).then(setMessages);
  }, []);

  // ─── 새 메시지 시 자동 스크롤 ──────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── 전송 ─────────────────────────────────────────────
  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    // 낙관적 업데이트
    const tempUser: Message = {
      id: crypto.randomUUID(),
      conversation_id: CONVERSATION_ID,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUser]);
    setInput('');
    setPending(true);

    try {
      const { reply, policy_refs } = await sendChat(CONVERSATION_ID, text);
      const botMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: CONVERSATION_ID,
        role: 'bot',
        content: reply,
        policy_refs,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      alert(`전송 실패: ${(err as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main">
        <header className="topbar">
          <h1>청년정책 상담</h1>
          <p>나에게 맞는 정책을 찾아드릴게요. 편하게 물어보세요.</p>
        </header>

        <div className="chat">
          {messages.length === 0 && <Welcome onPick={(text) => { setInput(text); handleSend(); }} />}
          {messages.map((m) => <MessageBubble key={m.id} msg={m} />)}
          {pending && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        <form className="composer" onSubmit={handleSend}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="궁금한 정책이나 상황을 자유롭게 적어주세요…"
            disabled={pending}
          />
          <button type="submit" disabled={pending || !input.trim()}>↑ 전송</button>
        </form>
      </main>
    </div>
  );
}

// ─── 보조 컴포넌트 ─────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="side">
      <div className="brand">💬 청년톡톡</div>
      <Link to="/" className="on">💬 챗봇 상담</Link>
      <Link to="/search">🔍 정책 검색</Link>
      <Link to="/my">📋 내 맞춤 정책</Link>
    </aside>
  );
}

function Welcome({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="msg msg--bot">
      <div className="msg__bubble">
        안녕하세요! 어떤 분야의 청년 지원 정책을 알아볼까요?
        <div className="suggests">
          {SUGGESTS.map((s) => (
            <span key={s} className="suggest" onClick={() => onPick(s)}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  return (
    <div className={`msg msg--${msg.role}`}>
      <div className="msg__bubble" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="msg msg--bot">
      <div className="msg__bubble">
        <span className="typing">···</span>
      </div>
    </div>
  );
}
