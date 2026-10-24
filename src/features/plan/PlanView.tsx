import React, { useEffect, useState } from 'react';
import { useGymStore } from '@/lib/store';
import { localDate, parseLocalDate } from '@/lib/date';
import { CYCLE_LENGTH, CYCLE_WEEKS, DAYS, cycleWeekOf, cycleWeekRange } from '@/lib/cycle';
import ProgramEditor from './ProgramEditor';

const DAY_LABEL: Record<(typeof DAYS)[number], string> = { mon: 'Пн', wed: 'Ср', fri: 'Пт' };

const RULES: { title: string; body: string[] }[] = [
  {
    title: 'Запас повторов',
    body: [
      '«3–4 в запасе» значит: остановился, когда мог сделать ещё 3–4 чистых повтора.',
      'Недели 1–2 — запас 3–4, подходов на один меньше. Недели 3–7 — запас 1–2, полные подходы. Неделя 8 — половина подходов, веса те же, в пятницу тест турника и брусьев.',
    ],
  },
  {
    title: 'Шаг прибавки',
    body: [
      'Во всех подходах сделал верх диапазона чисто (например, 4×8 при задании 6–8) — в следующий раз добавь: штанга +2,5 кг, гантели +1–2 кг, блок +1 плитка.',
      'Повторы снова падают к низу диапазона и растут обратно. Так и растёт масса.',
    ],
  },
  {
    title: 'Отдых между подходами',
    body: ['Базовые (жимы, тяги, турник, брусья) — 2–3 минуты. Изоляция — 60–90 секунд.'],
  },
  {
    title: 'Турник и брусья',
    body: [
      'Пн — брусья на объём, корпус вперёд: 3 подхода, стоп за 2 до отказа. Ср — турник лестницей 1-2-3-4-5: недели 1–2 — 2 лестницы до 4, недели 3–7 — 3 лестницы, верхняя ступень +1 каждые 2 недели. Пт — турник на максимум: широкий, нейтральный, обратный хват по подходу.',
      'Вес: брусья с 5-й недели, если делаешь 15+ чистых — один подход 6–8 с поясом +5 кг перед объёмными. На турник вес не вешаем.',
      'Техника: на турнике внизу руки прямые, подбородок выше перекладины, без раскачки, сначала лопатки вниз. На брусьях плечо до уровня локтя, вверху руки выпрямлены полностью.',
    ],
  },
  {
    title: 'Боль',
    body: [
      'Жжение в мышце — норма. Острая боль в плече, локте или колене — не терпишь, меняешь упражнение или снижаешь вес.',
      'Крепатура первые 1–2 недели будет сильной, это нормально.',
    ],
  },
];

export const PlanView: React.FC = () => {
  const [cycleStart, setCycleStart] = useState<string | null>(null);
  // week number -> day ids with a finished session
  const [closed, setClosed] = useState<Record<number, Set<string>>>({});
  const today = localDate();

  useEffect(() => {
    (async () => {
      const { getSettings, getSessionsInRange } = useGymStore.getState();
      const s = await getSettings();
      const from = cycleWeekRange(s.cycleStart, 1).from;
      const to = cycleWeekRange(s.cycleStart, CYCLE_LENGTH).to;
      const sessions = await getSessionsInRange(from, to);
      const byWeek: Record<number, Set<string>> = {};
      for (const session of sessions) {
        if (session.finishedAt === null) continue;
        const n = cycleWeekOf(s.cycleStart, session.date);
        (byWeek[n] ??= new Set()).add(session.dayId);
      }
      setClosed(byWeek);
      setCycleStart(s.cycleStart);
    })();
  }, []);

  if (!cycleStart) return <div className="plan-view">Загрузка...</div>;

  const currentWeek = cycleWeekOf(cycleStart, today);
  const status =
    currentWeek < 1
      ? `Цикл начнётся ${parseLocalDate(cycleWeekRange(cycleStart, 1).from).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
      : currentWeek > CYCLE_LENGTH
        ? 'Цикл завершён — повторяй недели 3–8 с новыми весами'
        : `Неделя ${currentWeek} из ${CYCLE_LENGTH} · ${CYCLE_WEEKS[currentWeek - 1].mode}`;
  const totalClosed = Object.values(closed).reduce((sum, days) => sum + days.size, 0);

  return (
    <section className="plan-view">
      <div className="dayhead">
        <div>
          <h2>План</h2>
          <p className="lead">{status}</p>
        </div>
      </div>

      <div className="plan-card">
        <div className="plan-card-head">
          <h3>Цикл 8 недель</h3>
          <span className="plan-total">
            {totalClosed} из {CYCLE_LENGTH * DAYS.length}
          </span>
        </div>
        <ol className="weeks">
          {CYCLE_WEEKS.map((week, i) => {
            const n = i + 1;
            const days = closed[n] ?? new Set<string>();
            const { from } = cycleWeekRange(cycleStart, n);
            return (
              <li key={n} className={`week ${week.kind}${n === currentWeek ? ' current' : ''}${n < currentWeek ? ' past' : ''}`} aria-current={n === currentWeek ? 'step' : undefined}>
                <span className="week-num">{n}</span>
                <div className="week-body">
                  <div className="week-mode">
                    {week.mode}
                    <span className="week-date">с {parseLocalDate(from).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="week-note">{week.note}</div>
                </div>
                <div className="week-days" aria-label={`Закрыто ${days.size} из ${DAYS.length}`}>
                  {DAYS.map(d => (
                    <span key={d} className={`day-dot${days.has(d) ? ' done' : ''}`} aria-hidden="true">
                      {DAY_LABEL[d]}
                    </span>
                  ))}
                  <span className="week-count" aria-hidden="true">
                    {days.size}/{DAYS.length}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="plan-after">После 8-й недели повторяешь недели 3–8 с новыми рабочими весами.</p>
      </div>

      <div className="rules">
        <h3>Правила</h3>
        {RULES.map(rule => (
          <details key={rule.title} className="rule">
            <summary>{rule.title}</summary>
            {rule.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </details>
        ))}
      </div>

      <ProgramEditor />
    </section>
  );
};

export default PlanView;
