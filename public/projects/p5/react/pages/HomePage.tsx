/**
 * HomePage — 청년 정책 챗봇 메인
 * ────────────────────────────────────────────────────────────
 * 핵심:
 *   - RAG 챗봇: 사용자 메시지 → Solar LLM(정책 RAG 검색 포함) → 응답
 *   - 빈 상태일 때 추천 카테고리 칩 표시
 *   - 자동 스크롤 (새 메시지 시)
 *
 * 패턴:
 *   - useState 로 input/messages 관리
 *   - useEffect 로 메시지 로드 + 스크롤
 *   - sending state 로 중복 전송 방지
 *   - optimistic update (user 메시지 즉시 표시)
 */

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { sendChat, fetchMessages } from '../supabase';
import { useAsync } from '../hooks';
import { Spinner } from '../components/Common';
import type { Message } from '../types';

const CONVERSATION_ID = 'default';
const SUGGESTS = [
  { emoji: '🏠', label: '주거', q: '월세가 부담되는데 청년 주거 지원 있나요?' },
  { emoji: '💼', label: '취업·창업', q: '신입 구직 활동 지원금 알려주세요' },
  { emoji: '💰', label: '금융·자산', q: '청년도약계좌 어떻게 가입하나요?' },
  { emoji: '📚', label: '교육·역량', q: '국비 교육 받을 수 있나요?' },
];

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [pending, setPending]   = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // ─── 초기 메시지 로드 ────────────────────────────────
  const initialState = useAsync(async () => {
    return await fetchMessages(CONVERSATION_ID);
  }, []);

  // 첫 로드 시 동기화
  useEffect(() => {
    if (initialState.status === 'success' && messages.length === 0 && initialState.data.length > 0) {
      setMessages(initialState.data);
    }
  }, [initialState, messages.length]);

  // ─── 새 메시지 시 자동 스크롤 ────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pending]);

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || pending) return;

    // Optimistic: user 메시지 먼저 표시
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
      // 실패 시 user 메시지 롤백
      setMessages((prev) => prev.filter((m) => m.id !== tempUser.id));
      setInput(text);
      alert(`전송 실패: ${(err as Error).message}`);
    } finally {
      setPending(false);
    }
  }

  function quickSend(q: string) {
    setInput(q);
    // 다음 tick에 submit
    setTimeout(() => handleSend(), 0);
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
          {initialState.status === 'loading' && messages.length === 0 && (
            <Spinner label="대화를 불러오는 중..." />
          )}

          {messages.length === 0 && initialState.status === 'success' && (
            <Welcome onPick={quickSend} />
          )}

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

// ─── 보조 ─────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="side">
      <div className="brand">💬 청년톡톡</div>
      <Link to="/" className="on">💬 챗봇 상담</Link>
      <Link to="/search">🔍 정책 검색</Link>
      <Link to="/my">📋 내 맞춤 정책</Link>
      <Link to="/checklist">✓️ 신청 체크리스트</Link>
      <Link to="/calendar">📅 정책 캘린더</Link>
    </aside>
  );
}

function Welcome({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="msg msg--bot">
      <div className="msg__bubble">
        안녕하세요! 어떤 분야의 청년 지원 정책을 알아볼까요?<br/>
        아래에서 카테고리를 선택하거나 자유롭게 질문해 주세요.
        <div className="suggests">
          {SUGGESTS.map((s) => (
            <span key={s.label} className="suggest" onClick={() => onPick(s.q)}>
              {s.emoji} {s.label}
            </span>
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
