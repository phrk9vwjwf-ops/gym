import { Exercise } from '@/db';

export const DEFAULT_PROGRAM = {
  mon: {
    title: "Понедельник — грудь и трицепс",
    lead: "Тяжёлый день груди с упором на верх, брусья на объём. ≈ 65 минут.",
    warmup: "Разминка: 5–7 минут кардио, тяга каната к лицу 2×15 с лёгким весом, 2 лёгких подхода наклонного жима.",
    items: [
      {
        exerciseId: "bench-incline-barbell",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 32.5,
        supersetWith: undefined
      },
      {
        exerciseId: "hammer-incline",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "butterfly",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "dips-forward",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: 120,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "tricep-overhead-ext",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 75,
        startWeight: 8,
        supersetWith: undefined
      },
      {
        exerciseId: "tricep-pull-down",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 10,
        supersetWith: undefined
      }
    ]
  },
  wed: {
    title: "Среда — спина и бицепс",
    lead: "Вся спина: ширина, толщина, низ. Турник лестницей. ≈ 75 минут.",
    warmup: "Разминка: 5–7 минут кардио, вращения плечами, 2 лёгких подхода тяги.",
    items: [
      {
        exerciseId: "pullup-ladder",
        sets: null,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "back-extension",
        sets: 3,
        repsLow: 15,
        repsHigh: 15,
        restSec: 60,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "row-barbell-underhand",
        sets: 4,
        repsLow: 6,
        repsHigh: 8,
        restSec: 150,
        startWeight: 40,
        supersetWith: undefined
      },
      {
        exerciseId: "pulldown-narrow",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: 35,
        supersetWith: undefined
      },
      {
        exerciseId: "row-seated",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 90,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "pullover",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 20,
        supersetWith: undefined
      },
      {
        exerciseId: "ez-curl",
        sets: 3,
        repsLow: 8,
        repsHigh: 10,
        restSec: 90,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "hammer-curl",
        sets: 3,
        repsLow: 10,
        repsHigh: 12,
        restSec: 60,
        startWeight: null,
        supersetWith: undefined
      }
    ]
  },
  fri: {
    title: "Пятница — добавка груди и плечи",
    lead: "Лёгкий по весам, объёмный день. Средняя и задняя дельта, турник на максимум. ≈ 70 минут.",
    warmup: "Разминка: 5–7 минут кардио, тяга каната к лицу 2×15, 2 лёгких подхода наклонного жима гантелей.",
    items: [
      {
        exerciseId: "db-incline",
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "crossover-low-to-high",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 75,
        startWeight: null,
        supersetWith: undefined
      },
      {
        exerciseId: "db-shoulder-press",
        sets: 4,
        repsLow: 8,
        repsHigh: 10,
        restSec: 120,
        startWeight: 10,
        supersetWith: undefined
      },
      {
        exerciseId: "crossover-one-arm",
        sets: 3,
        repsLow: 12,
        repsHigh: 15,
        restSec: 60,
        startWeight: 5,
        supersetWith: undefined
      },
      {
        exerciseId: "pull-to-chest",
        sets: 3,
        repsLow: 12,
        repsHigh: 12,
        restSec: 75,
        startWeight: 20,
        supersetWith: undefined
      },
      {
        exerciseId: "reverse-fly",
        sets: 3,
        repsLow: 15,
        repsHigh: 20,
        restSec: 60,
        startWeight: 7.5,
        supersetWith: undefined
      },
      {
        exerciseId: "pullup-max",
        sets: 3,
        repsLow: null,
        repsHigh: null,
        restSec: null,
        startWeight: null,
        supersetWith: undefined
      }
    ]
  }
};

// Exercise seed data (minimal)
export const DEFAULT_EXERCISES: Exercise[] = [
  { id: "bench-incline-barbell", name: "Жим штанги на наклонной скамье 30°", muscle: "chest", cue: "Главное упражнение недели на верх груди. Угол 30°, не выше — иначе работают плечи. Гриф опушай под ключицы, лопатки сведены.", unit: "kg" },
  { id: "hammer-incline", name: "Жим в Хаммере на наклонной", muscle: "chest", cue: "Если наклонного Хаммера нет — горизонтальный. Тренажёр даёт добить грудь без страха уронить вес, можно работать ближе к отказу.", unit: "kg" },
  { id: "butterfly", name: "Бабочка", muscle: "chest", cue: "Локти зафиксированы на уровне плеч. В конце сведения задержись на секунду и сожми грудь.", unit: "kg" },
  { id: "dips-forward", name: "Брусья, корпус вперёд — объём", muscle: "chest", cue: "Наклон вперёд переводит нагрузку на грудь. Стоп за 2 повтора до отказа. Плечо опушай до уровня локтя, ниже не надо.", unit: "bodyweight" },
  { id: "tricep-overhead-ext", name: "Разгибание гантели из-за головы", muscle: "triceps", cue: "Длинная головка трицепса. Локоть смотрит вверх и не разъезжается, вниз опускай медленно, вверху выпрямляй руку полностью.", unit: "kg" },
  { id: "tricep-pull-down", name: "Разгибания на канате стоя", muscle: "triceps", cue: "Корпус вертикально, локти прижаты к бокам — работает боковая головка, а не та же длинная, что в прошлом упражнении. Внизу разводи канат и держи секунду.", unit: "kg" },
  { id: "pullup-ladder", name: "Подтягивания — лестница", muscle: "back", cue: "Между ступенями отдыхай примерно 10 секунд за каждый сделанный повтор. Нед 1–2: 2 лестницы до 4. Нед 3–7: 3 лестницы, верхняя ступень +1 каждые 2 недели.", unit: "bodyweight" },
  { id: "back-extension", name: "Гиперэкстензия", muscle: "back", cue: "Низ спины. Поднимаешься до прямой линии корпуса, выше не надо. Когда 15 идут легко — блин 5–10 кг на грудь.", unit: "bodyweight" },
  { id: "row-barbell-underhand", name: "Тяга штанги в наклоне обратным хватом", muscle: "back", cue: "Толщина спины. Наклон около 45°, тянешь к поясу, локти вдоль корпуса. Спина округлилась — сбрасывай вес.", unit: "kg" },
  { id: "pulldown-narrow", name: "Вертикальный блок узким хватом", muscle: "back", cue: "Хват узкий или нейтральный — широким ты уже подтягивался в начале, незачем дублировать вектор. Тянешь к верху груди, локти идут вниз.", unit: "kg" },
  { id: "row-seated", name: "Горизонтальная тяга", muscle: "back", cue: "Середина спины. Грудь вперёд, в конце своди лопатки и держи секунду. Корпусом не раскачивайся.", unit: "kg" },
  { id: "pullover", name: "Пуловер на верхнем блоке", muscle: "back", cue: "Руки почти прямые, ведёшь канат к бёдрам широчайшими. Даёт ширину спины.", unit: "kg" },
  { id: "ez-curl", name: "Подъём EZ-штанги стоя", muscle: "biceps", cue: "Локти не уходят вперёд, корпус не качается. Опускай 2–3 секунды.", unit: "kg" },
  { id: "hammer-curl", name: "Молотки", muscle: "biceps", cue: "Поочерёдно, без раскачки. Качают брахиалис — рука становится толще.", unit: "kg" },
  { id: "db-incline", name: "Жим гантелей на наклонной скамье 30°", muscle: "chest", cue: "Второй заход на верх груди за неделю, но в другом диапазоне. Внизу гантели у груди, локти под 45° к корпусу.", unit: "kg" },
  { id: "crossover-low-to-high", name: "Сведение в кроссовере снизу вверх", muscle: "chest", cue: "Тросы снизу, руки идут вверх к подбородку. Чистая добивка верха груди — вес вторичен, чувствуй мышцу.", unit: "kg" },
  { id: "db-shoulder-press", name: "Жим гантелей сидя", muscle: "shoulders", cue: "Без вертикального жима дельты массу не наберут, махи этого не заменят. Спинка почти вертикально, опушай до уровня ушей.", unit: "kg" },
  { id: "crossover-one-arm", name: "Махи в кроссовере по одной руке", muscle: "shoulders", cue: "Средняя дельта. Трос из нижнего блока за спиной, ведёшь локтем. Раскачиваешься — вес большой.", unit: "kg" },
  { id: "pull-to-chest", name: "Протяжка штанги к груди", muscle: "back", cue: "Хват только широкий, выше уровня груди не тянешь — узкий хват и высокая протяжка выкручивают плечо. Локти всегда выше кистей.", unit: "kg" },
  { id: "reverse-fly", name: "Обратная бабочка", muscle: "shoulders", cue: "Задняя дельта. Рукояти на уровне плеч, руки слегка согнуты, много повторов и чистая техника.", unit: "kg" },
  { id: "pullup-max", name: "Подтягивания на максимум", muscle: "back", cue: "Широкий, нейтральный, обратный хват — по подходу. Каждый до последнего чистого повтора. Записывай числа, это твой прогресс.", unit: "bodyweight" }
];
