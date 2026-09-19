import { useState } from 'react';

// 버튼을 누를 때마다 이 목록에서 명언 하나를 무작위로 선택합니다.
const quotes = [
  { id: 1, text: '시작이 반이다.', author: '아리스토텔레스' },
  { id: 2, text: '천 리 길도 한 걸음부터 시작된다.', author: '노자' },
  { id: 3, text: '성공은 열정을 잃지 않고 실패를 거듭하는 것이다.', author: '윈스턴 처칠' },
  { id: 4, text: '오늘 할 수 있는 일을 내일로 미루지 마라.', author: '벤저민 프랭클린' },
  { id: 5, text: '행동이 모든 성공의 기초이다.', author: '파블로 피카소' },
  { id: 6, text: '배움에는 끝이 없다.', author: '공자' },
  { id: 7, text: '가장 큰 영광은 결코 넘어지지 않는 데 있지 않다.', author: '넬슨 만델라' },
  { id: 8, text: '할 수 있다고 믿는 사람은 결국 해낸다.', author: '나폴레온 힐' },
  { id: 9, text: '삶이 있는 한 희망은 있다.', author: '키케로' },
  { id: 10, text: '꿈을 꿀 수 있다면, 그것을 이룰 수도 있다.', author: '월트 디즈니' },
  { id: 11, text: '작은 기회로부터 종종 위대한 업적이 시작된다.', author: '데모스테네스' },
  { id: 12, text: '변화는 모든 진정한 배움의 최종 결과다.', author: '레오 버스카글리아' },
  { id: 13, text: '가장 어두운 밤도 끝나고 태양은 떠오른다.', author: '빅토르 위고' },
  { id: 14, text: '좋은 습관은 좋은 삶을 만든다.', author: '아리스토텔레스' },
  { id: 15, text: '용기는 두려움이 없는 것이 아니라 두려움을 이기는 것이다.', author: '넬슨 만델라' },
  { id: 16, text: '모든 위대한 꿈은 꿈꾸는 사람으로부터 시작된다.', author: '해리엇 터브먼' },
  { id: 17, text: '행복은 준비된 마음에 찾아온다.', author: '존 러스킨' },
  { id: 18, text: '성공보다 중요한 것은 성장하는 것이다.', author: '존 우든' },
  { id: 19, text: '자신을 믿어라. 그러면 무엇이든 가능하다.', author: '샤를 드골' },
  { id: 20, text: '오늘의 작은 노력이 내일의 큰 변화를 만든다.', author: '로버트 콜리어' },
];

function App() {
  const [quote, setQuote] = useState(quotes[0]);
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');

  // 현재 명언과 다른 명언이 선택되도록 목록에서 무작위로 고릅니다.
  const showNewQuote = () => {
    let nextQuote = quote;

    while (nextQuote === quote) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      nextQuote = quotes[randomIndex];
    }

    setQuote(nextQuote);
  };

  // 마음에 드는 명언을 목록에 저장합니다.
  const saveCurrentQuote = () => {
    const isAlreadySaved = favoriteQuotes.some((item) => item.id === quote.id);

    if (isAlreadySaved) {
      return;
    }

    setFavoriteQuotes((prev) => [quote, ...prev]);
  };

  // 검색 결과를 메인 명언 박스에 보여주고 저장할 수 있게 합니다.
  const selectQuote = (selectedQuote) => {
    setQuote(selectedQuote);
    setKeyword('');
  };

  // 입력한 키워드로 OpenAI에 새로운 명언을 요청합니다.
  const generateAiQuote = async () => {
    if (!keyword.trim()) {
      setGenerationError('먼저 키워드를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setGenerationError('');

    try {
      const response = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setQuote(data);
      setKeyword('');
    } catch (error) {
      setGenerationError(error.message || '명언을 생성하지 못했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 저장 목록에서 선택한 명언을 제거합니다.
  const removeFavoriteQuote = (id) => {
    setFavoriteQuotes((prev) => prev.filter((item) => item.id !== id));
  };

  // 키워드를 기준으로 명언을 필터링합니다.
  const filteredQuotes = keyword.trim()
    ? quotes.filter((item) => {
        const lowerKeyword = keyword.toLowerCase();
        const text = item.text.toLowerCase();
        const author = item.author.toLowerCase();

        return text.includes(lowerKeyword) || author.includes(lowerKeyword);
      })
    : [];

  return (
    <main className="app">
      <header className="page-header">
        <p className="eyebrow">A little thought for today</p>
        <h1>오늘의 명언</h1>
      </header>

      <section className="quote-card" aria-live="polite">
        <span className="quote-mark" aria-hidden="true">“</span>
        <p className="quote-text">{quote.text}</p>
        <p className="quote-author">— {quote.author}</p>
        <div className="card-divider" />

        <div className="button-row">
          <button type="button" className="new-quote-button" onClick={showNewQuote}>
            새로운 명언
            <span aria-hidden="true">↗</span>
          </button>

          <button
            type="button"
            className={`save-button ${favoriteQuotes.some((item) => item.id === quote.id) ? 'saved' : ''}`}
            onClick={saveCurrentQuote}
          >
            {favoriteQuotes.some((item) => item.id === quote.id) ? '저장됨' : '저장하기'}
          </button>
        </div>
      </section>

      <section className="search-panel">
        <h2>키워드 검색</h2>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="예: 성공, 용기, 배움"
          className="search-input"
        />
        <button type="button" className="ai-button" onClick={generateAiQuote} disabled={isGenerating}>
          {isGenerating ? 'GPT가 명언을 만드는 중...' : 'GPT로 명언 만들기'}
        </button>

        {generationError && <p className="search-error">{generationError}</p>}

        {keyword.trim() === '' ? (
          <p className="search-hint">검색어를 입력하면 관련 명언을 보여드립니다.</p>
        ) : filteredQuotes.length === 0 ? (
          <p className="search-empty">입력한 키워드와 관련된 명언이 없어요.</p>
        ) : (
          <ul className="search-result-list">
            {filteredQuotes.map((item) => (
              <li key={item.id} className="search-result-item">
                <button type="button" className="search-result-button" onClick={() => selectQuote(item)}>
                  <p>“{item.text}”</p>
                  <span>— {item.author}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="favorite-panel" aria-live="polite">
        <h2>저장한 명언</h2>

        {favoriteQuotes.length === 0 ? (
          <p className="empty-message">아직 저장한 명언이 없어요. 마음에 드는 문장을 저장해보세요.</p>
        ) : (
          <ul className="favorite-list">
            {favoriteQuotes.map((favorite) => (
              <li key={favorite.id} className="favorite-item">
                <div>
                  <p className="favorite-text">“{favorite.text}”</p>
                  <span className="favorite-author">— {favorite.author}</span>
                </div>
                <button type="button" className="remove-button" onClick={() => removeFavoriteQuote(favorite.id)}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="page-footer">오늘의 마음에 오래 머무는 문장을 만나보세요.</p>
    </main>
  );
}

export default App;
